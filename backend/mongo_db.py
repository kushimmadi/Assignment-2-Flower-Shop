# Kushi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import urllib.parse
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Use the environment variables to build the connection string for MongoDB
username = urllib.parse.quote_plus(os.getenv("db_username"))
password = urllib.parse.quote_plus(os.getenv("db_password"))
host = os.getenv("db_host")
port = int(os.getenv("db_port"))
auth_source = os.getenv("db_auth_source")
db_name = os.getenv("db_name")

# Define collection names
products_collection_name = os.getenv("products_collection_name")  # collection name for flower products
cart_collection_name = os.getenv("cart_collection_name")          # collection name for cart items
users_collection_name = os.getenv("users_collection_name")        # collection name for users


# Get a collection from the database by its name, creating it if it doesn't exist
def get_collection(db, collection):
    if collection in db.list_collection_names():
        # if the collection already exists, return it
        return db[collection]
    else:
        # If the collection doesn't exist, create and return it.
        return db.create_collection(collection)


# Build the MongoDB connection and return the client and collections
def build_connection():
    uri = f"mongodb://{username}:{password}@{host}:{port}/?authSource={auth_source}"

    # Create a single, shared client instance
    client = None
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        print("MongoDB connection successful!")
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    db = client[db_name]

    return (
        client,
        get_collection(db, products_collection_name),
        get_collection(db, cart_collection_name),
        get_collection(db, users_collection_name),
    )
