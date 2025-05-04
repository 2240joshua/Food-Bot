from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.models.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    dietary_preferences = Column(String, nullable=True)

    # ADD THESE (for back_populates relationships)
    meals = relationship("UserMeal", back_populates="user")  # <-- if you have user_meals.py
    recipes = relationship("UserRecipe", back_populates="user")  # <-- if you have user_recipe.py
