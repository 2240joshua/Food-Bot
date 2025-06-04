# backend/init_db.py

from sqlalchemy import text
from backend.models.database import Base, engine, SessionLocal
from backend.models.user_recipe import UserRecipe
from backend.models.plan_entry import PlanEntry  # Assuming this is your model

# Import all needed models to create tables
from backend.models import user, recipe, user_recipe, plan_entry

# (Re)create all tables
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))

Base.metadata.create_all(bind=engine)


# Remove all plan_entries first (to avoid FK errors), then recipes
db = SessionLocal()
try:
    plan_deleted = db.query(PlanEntry).delete()
    recipe_deleted = db.query(UserRecipe).delete()
    db.commit()
    print(f"✅ Deleted {plan_deleted} plan entries and {recipe_deleted} recipes.")
finally:
    db.close()
