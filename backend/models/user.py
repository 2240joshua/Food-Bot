from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .database import Base  # Adjust path based on your structure

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    dietary_preferences = Column(String, nullable=True)

    meals = relationship("UserMeal", back_populates="user")  # String reference avoids circular import
