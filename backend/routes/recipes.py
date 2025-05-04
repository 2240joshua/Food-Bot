# backend/routes/recipes.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.models.database import SessionLocal
from backend.models.user_recipe import UserRecipe
from backend.schemas.recipe import RecipeCreate
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

# Dependency for DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- SPOONACULAR SEARCH --------------------
@router.get("/recipes/search")
def search_recipes(query: str = Query(..., description="Food name to search")):
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 5,
        "addRecipeNutrition": True,
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch recipes.")

    results = response.json().get("results", [])
    meals = []

    for item in results:
        nutrition = item.get("nutrition", {}).get("nutrients", [])
        calories = next((n["amount"] for n in nutrition if n["name"] == "Calories"), None)
        protein = next((n["amount"] for n in nutrition if n["name"] == "Protein"), None)
        fat = next((n["amount"] for n in nutrition if n["name"] == "Fat"), None)
        carbs = next((n["amount"] for n in nutrition if n["name"] == "Carbohydrates"), None)

        meals.append({
            "title": item.get("title"),
            "id": item.get("id"),
            "calories": calories,
            "protein": protein,
            "fat": fat,
            "carbs": carbs
        })

    return meals

# -------------------- USER RECIPE CREATE --------------------
@router.post("/recipes/")
def create_recipe(recipe: RecipeCreate, user_id: int, db: Session = Depends(get_db)):
    new_recipe = UserRecipe(
        user_id=user_id,
        title=recipe.title,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        calories=recipe.calories,
        protein=recipe.protein,
        carbs=recipe.carbs,
        fat=recipe.fat,
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    return new_recipe
def get_my_recipes(user_id: int, db: Session = Depends(get_db)):
    recipes = db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()
    return recipes
# -------------------- USER RECIPE FETCH --------------------
@router.get("/recipes/my")
def get_user_recipes(user_id: int, db: Session = Depends(get_db)):
    recipes = db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()

    return recipes
@router.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(UserRecipe).filter(UserRecipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(recipe)
    db.commit()

    return {"detail": "Recipe deleted"}