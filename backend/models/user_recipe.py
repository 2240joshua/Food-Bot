from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.database import Base

class UserRecipe(Base):
    __tablename__ = "user_recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)

    ingredients = Column(String, nullable=True)
    instructions = Column(String, nullable=True)   # ✅ ✅ THIS IS MISSING BASED ON ERROR
    steps = Column(String, nullable=True)          # (optional) if you want steps separate
    
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)

    is_public = Column(Boolean, default=False)

    user = relationship("User", back_populates="recipes")
