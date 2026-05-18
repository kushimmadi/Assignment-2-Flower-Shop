# Assignment-2-Flower-Shop
Assignment 2 - Advanced Website based on Modern Frontend Libraries

## Summary:

Flower shop is an e-commerce shopping cart application that allows users to browse different flower bouquets and interact with items in their cart. This solves the issue of having to buy flowers in person and helps in viewing all the flower types in one space, allowing for easy efficient flower browsing process. 

## Feature List:

- Responsive layout that can be viewed in desktop, mobile and tablet
- Products are seeded on backend startup
- Product grid with flower bouquets
- Add to cart functionality
- Increase and decrease quanitiy of a certain item in the cart
- Delete an item from the cart
- Cart is displayed in a sidebar with overlay
- Toasts are displayed when items are added or deleted from cart
- Total cost of items in cart is calculated at the bottom of cart
- Cart icon has a badge with the number of items in cart
- Empty states for cart, search and admin view
- Delete confirmation modal when removing an item from cart
- Login functionality
- Sign up functionality
- Search functionality
- Admin view functionality

## Workload Allocation:

Kushi Immadi:
- Work Completed:
    - Added assignment 1
    - Changed assignment 1 to use mongoDB instead of mySQL
    - Added login functionality
    - Refactored reused code
    - Readme

- Files Changed:
    - mongo_app.py
    - mongo_db.py
    - App.jsx
    - FlowerShop.css
    - FlowerShop.jsx
    - Login.css
    - Login.jsx
    - app.js
    - hook.js

Nikita Bellett:
- Work Completed:
    - Added admin view functionality
    - Added delete confirmation functionality
    - Added NavBar for less code duplication 
    - Added file authors as comments
    - Readme

- Files Changed:
    - mongo_app.py
    - AdminView.jsx
    - App.jsx
    - FlowerShop.css
    - FlowerShop.jsx
    - Login.jsx
    - NavBar.jsx

## Technical Stack

| Layer     | Technology                                                                 |
|-----------|---------------------------------------------------------------------------|
| Frontend  | React (via Vite), React Router DOM, Lucide React (icons)                  |
| Backend   | Python, FastAPI, Pydantic                                                 |
| Database  | MongoDB (via PyMongo)                                                     |
| Auth      | JWT (PyJWT), bcrypt for password hashing, OAuth2 password bearer flow     |
| Dev Tools | Vite (frontend dev server & bundler), dotenv (environment variable mgmt)  |

---

## How to Run

### Prerequisites

- **Node.js** (v18+) and **npm**
- **Python** (3.10+)
- **MongoDB** instance (local or remote)

### Backend

```bash
cd backend

# Install Python dependencies
pip install fastapi uvicorn pymongo pydantic python-dotenv bcrypt pyjwt

# Create a .env file with the following variables:
# SECRET_KEY=<your-jwt-secret>
# db_username=<mongo-username>
# db_password=<mongo-password>
# db_host=localhost
# db_port=27017
# db_auth_source=admin
# db_name=<your-db-name>
# products_collection_name=products
# cart_collection_name=cart
# users_collection_name=users

# Run the server
uvicorn mongo_app:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (default: http://localhost:5173)
npm run dev
```