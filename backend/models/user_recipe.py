#backend/models/user_recipe.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from models.database import Base

class UserRecipe(Base):
    __tablename__ = "user_recipes"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    title        = Column(String, nullable=False)
    ingredients  = Column(JSON, nullable=False)  
    instructions = Column(Text, nullable=False)
    calories     = Column(Float, nullable=False)
    protein      = Column(Float, nullable=False)
    carbs        = Column(Float, nullable=False)
    fat          = Column(Float, nullable=False)
    is_public    = Column(Boolean, default=False)
    servings = Column(Integer, default=1)
    user = relationship("User", back_populates="recipes")
