from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Response, status
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from mongo_db import build_connection
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uuid

############################################
# --- Security-related Configurations ---
############################################

# Libraries for password hashing and JWT token handling
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
import jwt

# Library for loading environment variables
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Configurations for JWT token handling
SECRET_KEY = os.getenv("SECRET_KEY")  # This is a secret key used to sign JWT tokens.
ALGORITHM = "HS256"  # The algorithm used to sign the JWT tokens
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Set token expiration time (e.g., 30 minutes)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token"
)  # Specify the location of the Login logic, i.e., the '/token' endpoint

############################################
# --- MongoDB connection Management ---
############################################

# Build the MongoDB connection and get the client and collections for todos and users
client, products_collection, cart_collection, users_collection = build_connection()


# Define the lifespan function to manage MongoDB connection lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_products()
    yield
    client.close()
    print("MongoDB disconnected.")


app = FastAPI(lifespan=lifespan)  # Pass the lifespan function to the FastAPI instance

############################################
# --- CORS Configuration ---
############################################

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allows cookies and authentication headers in cross-origin requests
    allow_methods=["*"],
    allow_headers=["*"],
)

############################################
# --- Seed Flower Products ---
############################################

def seed_products():
    if products_collection.count_documents({}) > 0:
        return
    flowers = [
        {"id": "rose",        "name": "Rose Bouquet",          "price": 80.00, "image_url": "/assets/rose.jpg",        "description": "Classic roses in a blush pink colour"},
        {"id": "tulip",       "name": "Tulip Bouquet",         "price": 45.00, "image_url": "/assets/tulip.jpg",       "description": "Pink tulips with lush greenery"},
        {"id": "peony",       "name": "Peony Bouquet",         "price": 53.00, "image_url": "/assets/peony.jpg",       "description": "Elegant peonies in soft pastel shades"},
        {"id": "orchid",      "name": "Orchid Bouquet",        "price": 62.00, "image_url": "/assets/orchid.jpg",      "description": "Bright and beautiful orchids in full bloom"},
        {"id": "babysbreath", "name": "Baby's Breath Bouquet", "price": 36.00, "image_url": "/assets/babysbreath.jpg", "description": "Simple but stunning"},
        {"id": "hibiscus",    "name": "Hibiscus Bouquet",      "price": 45.00, "image_url": "/assets/hibiscus.jpg",    "description": "Tropical hibiscus blooms"},
        {"id": "hydrangea",   "name": "Hydrangea Bouquet",     "price": 44.00, "image_url": "/assets/hydrangea.jpg",   "description": "Pretty white hydrangeas"},
        {"id": "dahlia",      "name": "Dahlia Bouquet",        "price": 50.00, "image_url": "/assets/dahlia.jpg",      "description": "Diverse dahlias in vibrant pinks"},
        {"id": "daisy",       "name": "Daisy Bouquet",         "price": 47.00, "image_url": "/assets/daisy.jpg",       "description": "Cute white daisies in a bunch"},
    ]
    products_collection.insert_many(flowers)
    print("Flower products seeded.")

############################################
# --- All FastAPI endpoints ---
############################################

# --- Product endpoints ---

@app.get("/products")
async def get_all_products():
    """Fetch all available flower products"""
    return products_collection.find({}, {"_id": 0}).to_list()


# --- Cart endpoints ---

@app.get("/cart")
async def get_cart(current_user: str = Depends(get_current_user)):
    """Fetch all cart items for the current user"""
    return cart_collection.find({"user_id": current_user}, {"_id": 0}).to_list()


@app.post("/cart")
async def add_to_cart(item: dict, current_user: str = Depends(get_current_user)):
    """Add a product to the cart, or increase its quantity if already present"""
    product_id = item.get("product_id")
    quantity = item.get("quantity", 1)

    existing = cart_collection.find_one({"product_id": product_id, "user_id": current_user})
    if existing:
        cart_collection.update_one(
            {"product_id": product_id, "user_id": current_user},
            {"$inc": {"quantity": quantity}},
        )
        updated = cart_collection.find_one({"product_id": product_id, "user_id": current_user}, {"_id": 0})
        return updated
    else:
        new_item = {
            "id": str(uuid.uuid4()),
            "product_id": product_id,
            "quantity": quantity,
            "user_id": current_user,
        }
        cart_collection.insert_one(new_item)
        return {k: v for k, v in new_item.items() if k != "_id"}


@app.put("/cart/{item_id}")
async def update_cart_item(item_id: str, updated: dict, current_user: str = Depends(get_current_user)):
    """Update the quantity of a cart item"""
    result = cart_collection.update_one(
        {"id": item_id, "user_id": current_user},
        {"$set": {"quantity": updated.get("quantity")}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: str = Depends(get_current_user)):
    """Remove an item from the cart"""
    result = cart_collection.delete_one({"id": item_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

