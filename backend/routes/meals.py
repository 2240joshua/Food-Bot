from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.database import SessionLocal
from backend.models.user_meal import UserMeal
from backend.models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MealCreate(BaseModel):
    title: str
    description: str
    calories: float
    protein: float
    carbs: float
    fat: float

@router.post("/meals/user")
def post_meal(meal: MealCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_meal = UserMeal(
        title=meal.title,
        description=meal.description,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        user_id=current_user["user_id"]
    )
    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)
    return {"message": "✅ Meal posted", "meal": new_meal}

@router.get("/meals/feed")
def get_public_meals(db: Session = Depends(get_db)):
    return db.query(UserMeal).order_by(UserMeal.created_at.desc()).limit(20).all()
@router.get("/meals/my")
def get_my_meals(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    meals = db.query(UserMeal).filter(UserMeal.user_id == current_user["user_id"]).order_by(UserMeal.created_at.desc()).all()
    return meals
