# backend/init_db.py

from backend.models.database import Base, engine
from backend.models import user, recipe, user_recipe, user_meal  # make sure all models are imported

# 🚨 DEV MODE: Drop all tables and recreate them (this wipes data)
print("Dropping existing tables...")
Base.metadata.drop_all(bind=engine)

print("Creating tables...")
Base.metadata.create_all(bind=engine)

print("✅ AWS Database tables recreated successfully.")
