# backend/routes/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.user import User
from schemas.user import UserCreate
from passlib.context import CryptContext

# ✅ New passwords use pbkdf2_sha256 (no 72-byte limit)
# ✅ Existing bcrypt hashes still verify (if you already have users)
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto",
)

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
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
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
