# backend/routes/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.database import SessionLocal
from backend.models.user import User
from backend.schemas.user import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=dict, summary="Register a new user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create and hash password
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),  # <-- Hash password
        dietary_preferences=user.dietary_preferences,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "dietary_preferences": new_user.dietary_preferences,
    }

@router.get("/{user_id}", response_model=dict, summary="Get a user by ID")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "dietary_preferences": user.dietary_preferences,
    }
