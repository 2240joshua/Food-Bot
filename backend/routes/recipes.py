# backend/routes/recipes.py

from fastapi import APIRouter, HTTPException, Depends, Query, status, Path
from sqlalchemy.orm import Session
import requests, os
from dotenv import load_dotenv
from typing import List

from backend.env import BASE_URL, SPOONACULAR_API_KEY
from backend.models.database import SessionLocal
from backend.models.user import User
from backend.models.user_recipe import UserRecipe
from backend.schemas.recipe import RecipeCreate, RecipeRead, RecipeUpdate
from backend.routes.auth import get_current_user

load_dotenv()
router = APIRouter(tags=["recipes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search", response_model=List[RecipeRead])
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
            "ingredients":  [],       # we don’t import ingredients here
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

    return RecipeRead(
        id           = new.id,
        title        = new.title,
        ingredients  = new.ingredients.split(",") if new.ingredients else [],
        instructions = new.instructions,
        calories     = new.calories,
        protein      = new.protein,
        carbs        = new.carbs,
        fat          = new.fat
    )


@router.get("/user", response_model=List[RecipeRead])
def list_my_recipes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id    = current_user["user_id"]
    db_recs    = db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()
    output: List[RecipeRead] = []

    for r in db_recs:
        output.append(RecipeRead(
            id           = r.id,
            title        = r.title,
            ingredients  = r.ingredients.split(",") if r.ingredients else [],
            instructions = r.instructions,
            calories     = r.calories,
            protein      = r.protein,
            carbs        = r.carbs,
            fat          = r.fat
        ))
    return output


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
    r = (
        db.query(UserRecipe)
          .filter(UserRecipe.id == recipe_id, UserRecipe.user_id == user_id)
          .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return RecipeRead(
        id           = r.id,
        title        = r.title,
        ingredients  = r.ingredients.split(",") if r.ingredients else [],
        instructions = r.instructions,
        calories     = r.calories,
        protein      = r.protein,
        carbs        = r.carbs,
        fat          = r.fat
    )


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
    user_id   = current_user["user_id"]
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

    return RecipeRead(
        id           = db_recipe.id,
        title        = db_recipe.title,
        ingredients  = db_recipe.ingredients.split(",") if db_recipe.ingredients else [],
        instructions = db_recipe.instructions,
        calories     = db_recipe.calories,
        protein      = db_recipe.protein,
        carbs        = db_recipe.carbs,
        fat          = db_recipe.fat
    )


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
