# backend/init_db.py
from sqlalchemy import text
from backend.models.database import Base, engine

# Import every model you want to keep (including your new plan_entry)
from backend.models import user, recipe, user_recipe, plan_entry

# 1) Drop the old user_meals table if it still exists
with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS user_meals CASCADE"))

# 2) Create all remaining tables (users, user_recipes, plan_entries, etc.)
Base.metadata.create_all(bind=engine)
print("✅ Database tables created (without user_meals).")
