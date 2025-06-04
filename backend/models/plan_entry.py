from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class PlanEntry(Base):
    __tablename__ = "plan_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day     = Column(String, nullable=False)   # e.g. "Monday"
    recipe_id = Column(Integer, ForeignKey("user_recipes.id"), nullable=False)
    order     = Column(Integer, nullable=False)  # position in the list

    # optional backrefs
    user   = relationship("User", back_populates="plan_entries")
    recipe = relationship("UserRecipe")
