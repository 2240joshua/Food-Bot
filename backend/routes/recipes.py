# backend/routes/recipes.py

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
import requests, os
from dotenv import load_dotenv

from backend.env import BASE_URL, SPOONACULAR_API_KEY
from backend.models.database import SessionLocal
from backend.models.user import User
from backend.models.user_recipe import UserRecipe
from backend.schemas.recipe import RecipeCreate, RecipeRead, RecipeUpdate
from backend.routes.auth import get_current_user
from fastapi import Path
from backend.schemas.recipe import RecipeRead
load_dotenv()  # ensures .env is loaded if you need it here

router = APIRouter(tags=["recipes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search", response_model=list[RecipeRead])
def search_recipes(query: str = Query(..., description="Food name to search")):
    if not SPOONACULAR_API_KEY:
        raise HTTPException(status_code=500, detail="Missing SPOONACULAR_API_KEY")

    resp = requests.get(
        BASE_URL,
        params={
            "apiKey": SPOONACULAR_API_KEY,
            "query": query,
            "number": 5,
            "addRecipeNutrition": True,
        },
        timeout=5
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    meals = []
    for item in resp.json().get("results", []):
        nut = item.get("nutrition", {}).get("nutrients", [])
        def get_n(name):
            return next((n["amount"] for n in nut if n["name"] == name), None)

        meals.append({
            "id":           item.get("id"),
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
        raise HTTPException(status_code=404, detail="User not found")

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
    deleted = (
        db.query(UserRecipe)
          .filter(UserRecipe.id == recipe_id, UserRecipe.user_id == user_id)
          .delete()
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.commit()


@router.patch(
    "/user/{recipe_id}",
    response_model=RecipeRead,
    status_code=status.HTTP_200_OK
)
def update_my_recipe(
    recipe_id: int,
    recipe_in: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    db_recipe = (
        db.query(UserRecipe)
          .filter(UserRecipe.id == recipe_id, UserRecipe.user_id == user_id)
          .first()
    )
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_data = recipe_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_recipe, field, value)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe
@router.get(
    "/user/{recipe_id}",
    response_model=RecipeRead,
    status_code=status.HTTP_200_OK
)
def get_my_recipe(
    recipe_id: int = Path(..., description="Your recipe ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    rec = (
        db.query(UserRecipe)
          .filter(UserRecipe.id == recipe_id, UserRecipe.user_id == user_id)
          .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return rec