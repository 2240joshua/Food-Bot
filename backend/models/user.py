from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.models.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False) 
    dietary_preferences = Column(String, nullable=True)

    recipes = relationship("UserRecipe", back_populates="user")
    plan_entries = relationship("PlanEntry", back_populates="user", cascade="all, delete-orphan")

    def verify_password(self, plain_password):
        return pwd_context.verify(plain_password, self.password_hash)

    @classmethod
    def hash_password(cls, plain_password):
        return pwd_context.hash(plain_password)
