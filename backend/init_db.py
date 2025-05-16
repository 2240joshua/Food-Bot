# backend/init_db.py
from sqlalchemy import text
from backend.models.database import Base, engine


from backend.models import user, recipe, user_recipe, plan_entry


with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS user_meals CASCADE"))

Base.metadata.create_all(bind=engine)
print("Database tables created (without user_meals).")
