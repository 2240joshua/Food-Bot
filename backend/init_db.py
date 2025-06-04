# backend/init_db.py

from sqlalchemy import text
from models.database import Base, engine, SessionLocal
from models.user_recipe import UserRecipe
from models.plan_entry import PlanEntry  

from models import user, recipe, user_recipe, plan_entry


Base.metadata.create_all(bind=engine)


# Remove all plan_entries first (to avoid FK errors), then recipes
db = SessionLocal()


db.commit()
    
db.close()
