import asyncio
import logging
import os
import sys
from datetime import datetime

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bson import ObjectId
from app.db.mongo import connect_to_mongo, get_restaurants_collection, get_tables_collection
from app.services.auth_service import create_user
from app.services.inventory_service import create_menu_item
from app.core.roles import Role

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed():
    logger.info("Connecting to MongoDB...")
    await connect_to_mongo()
    
    # Specific details provided by the user
    OWNER_ID = "69e284b3e319a96bd0b43a6e"
    RESTAURANT_ID = "69e284b3e319a96bd0b43a6d"
    EMAIL = "vyas@gmail.com"
    # Note: We use the hash provided by the user if we were doing a direct insert,
    # but since the user said "use our already created methods", we'll hash a fresh password.
    # However, to match the user's intent of "exactly this", I'll use the hash directly if I can,
    # but AuthService.create_user takes a pre-hashed password.
    HASHED_PASS = "$2b$12$GKg2t4NYadj7/ePjo0oNRua59/PGgxq2w5MdpeHjopAn0WMLsO5Oe"
    
    try:
        # 1. Create Owner Account
        # logger.info(f"Creating owner account: {EMAIL}")
        # await create_user(
        #     email=EMAIL,
        #     hashed_password=HASHED_PASS,
        #     role=Role.owner,
        #     restaurant_id=RESTAURANT_ID,
        #     user_id=OWNER_ID
        # )
        
        # 2. Create Restaurant
        # logger.info("Creating restaurant: The Grand Spice")
        # restaurants = get_restaurants_collection()
        # await restaurants.insert_one({
        #     "_id": ObjectId(RESTAURANT_ID),
        #     "name": "The Grand Spice",
        #     "timezone": "Asia/Kolkata",
        #     "status": "active",
        #     "owner_id": OWNER_ID,
        #     "created_at": datetime.utcnow()
        # })
        
        # 3. Create Tables
        logger.info("Creating tables...")
        tables = get_tables_collection()
        table_data = [
            {"name": "Table 1", "capacity": 2, "status": "free"},
            {"name": "Table 2", "capacity": 4, "status": "occupied"},
            {"name": "Table 3", "capacity": 4, "status": "free"},
            {"name": "Table 4", "capacity": 6, "status": "free"},
            {"name": "Table 5", "capacity": 2, "status": "occupied"},
        ]
        for t in table_data:
            await tables.insert_one({
                "restaurant_id": RESTAURANT_ID,
                **t,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
        # 4. Create Menu Items
        logger.info("Creating menu items (and generating embeddings)...")
        menu_items = [
            {"name": "Paneer Butter Masala", "price": 280, "isVeg": True, "spiceLevel": "medium", "category": "Mains", "tags": ["popular", "creamy"], "time_to_cook": 20},
            {"name": "Chicken Tikka", "price": 320, "isVeg": False, "spiceLevel": "high", "category": "Appetizers", "tags": ["spicy", "grilled"], "time_to_cook": 15},
            {"name": "Dal Makhani", "price": 240, "isVeg": True, "spiceLevel": "low", "category": "Mains", "tags": ["classic", "slow-cooked"], "time_to_cook": 25},
            {"name": "Garlic Naan", "price": 60, "isVeg": True, "spiceLevel": "low", "category": "Breads", "tags": ["hot"], "time_to_cook": 5},
            {"name": "Mango Lassi", "price": 120, "isVeg": True, "spiceLevel": "none", "category": "Beverages", "tags": ["sweet", "refreshing"], "time_to_cook": 5},
        ]
        for item in menu_items:
            await create_menu_item(RESTAURANT_ID, item)
            
        logger.info("Seeding completed successfully!")
        logger.info(f"User Email: {EMAIL}")
        logger.info("You can now log in and see your dashboard populated.")
        
    except Exception as e:
        logger.error(f"Error during seeding: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
