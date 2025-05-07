from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
import requests, os
from dotenv import load_dotenv

from backend.models.database import SessionLocal
from backend.models.user import User
from backend.models.user_recipe import UserRecipe
from backend.schemas.recipe import RecipeCreate, RecipeRead
from backend.routes.auth import get_current_user

load_dotenv()
router = APIRouter()
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search", response_model=list[RecipeRead])
def search_recipes(query: str = Query(..., description="Food name to search")):
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 5,
        "addRecipeNutrition": True,
    }
    resp = requests.get(url, params=params)
    if resp.status_code != 200:
        raise HTTPException(500, "Failed to fetch recipes.")
    meals = []
    for item in resp.json().get("results", []):
        nut = item.get("nutrition", {}).get("nutrients", [])
        get_n = lambda name: next((n["amount"] for n in nut if n["name"] == name), None)
        meals.append({
            "id":           item.get("id"),      # spoonacular ID
            "title":        item.get("title"),
            "ingredients":  "",
            "instructions": "",
            "calories":     get_n("Calories"),
            "protein":      get_n("Protein"),
            "carbs":        get_n("Carbohydrates"),
            "fat":          get_n("Fat"),
        })
    return meals


@router.post("/user", response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
def save_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    if not db.query(User).get(user_id):
        raise HTTPException(404, "User not found")

    new = UserRecipe(
        user_id      = user_id,
        title        = recipe.title,
        ingredients  = recipe.ingredients,
        instructions = recipe.instructions,
        calories     = recipe.calories,
        protein      = recipe.protein,
        carbs        = recipe.carbs,
        fat          = recipe.fat
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.get("/user", response_model=list[RecipeRead])
def list_my_recipes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    return db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()


@router.delete("/user/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    deleted = db.query(UserRecipe)\
                .filter(UserRecipe.id == recipe_id, UserRecipe.user_id == user_id)\
                .delete()
    if not deleted:
        raise HTTPException(404, "Recipe not found")
    db.commit()
    # 204 No Content
