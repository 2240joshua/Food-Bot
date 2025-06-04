from fastapi import APIRouter, HTTPException, Depends, status, Path
from sqlalchemy.orm import Session
from typing import List
import json

from models.database import SessionLocal
from models.user import User
from models.user_recipe import UserRecipe
from schemas.recipe import IngredientIn, RecipeCreate, RecipeRead, RecipeUpdate
from routes.auth import get_current_user

from services.spoonacular import get_nutrients_for_ingredient

router = APIRouter(tags=["recipes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_ingredients(raw):
    """
    Always return a list of dicts suitable for Pydantic/JSON response.
    """
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            result = []
            for item in parsed:
                if isinstance(item, dict):
                    result.append({
                        "name": item.get("name", ""),
                        "amount": item.get("amount", 0.0),
                        "unit": item.get("unit", ""),
                    })
                elif isinstance(item, str):
                    result.append({"name": item, "amount": 0.0, "unit": ""})
            return result
        elif isinstance(parsed, dict):
            return [{
                "name": parsed.get("name", ""),
                "amount": parsed.get("amount", 0.0),
                "unit": parsed.get("unit", ""),
            }]
        elif isinstance(parsed, str):

            try:
                subparsed = json.loads(parsed)
                if isinstance(subparsed, list):
                    return [
                        {
                            "name": i.get("name", ""),
                            "amount": i.get("amount", 0.0),
                            "unit": i.get("unit", "")
                        } if isinstance(i, dict) else {"name": str(i), "amount": 0.0, "unit": ""}
                        for i in subparsed
                    ]
            except Exception:
                pass
            return [{"name": parsed, "amount": 0.0, "unit": ""}]
        else:
            return []
    except Exception:

        parts = [p.strip() for p in raw.split(",") if p.strip()]
        return [{"name": name, "amount": 0.0, "unit": ""} for name in parts]

def ensure_ingredient_list(ingredients):
    """
    Ensure the incoming ingredients is a list of dicts.
    This is defensive for both POST and PATCH.
    """

    if isinstance(ingredients, str):
        try:
            ingredients = json.loads(ingredients)
        except Exception:
            ingredients = []
    
    result = []
    for ing in ingredients or []:
        if hasattr(ing, 'dict'):
            result.append(ing.dict())
        elif isinstance(ing, dict):
            result.append({
                "name": ing.get("name", ""),
                "amount": float(ing.get("amount", 0.0)),
                "unit": ing.get("unit", ""),
            })
    return result

@router.post(
    "/user",
    response_model=RecipeRead,
    status_code=status.HTTP_201_CREATED
)
def save_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    if not db.query(User).get(user_id):
        raise HTTPException(status_code=404, detail="User not found")

    try:
        safe_ingredients = ensure_ingredient_list(recipe.ingredients)
        ingredients_json = json.dumps(safe_ingredients)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not serialize ingredients: {e}")


    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    for ing in safe_ingredients:
        n = get_nutrients_for_ingredient(ing)
        totals["calories"] += n["calories"]
        totals["protein"]  += n["protein"]
        totals["carbs"]    += n["carbs"]
        totals["fat"]      += n["fat"]

    new = UserRecipe(
        user_id=user_id,
        title=recipe.title,
        instructions=recipe.instructions,
        ingredients=ingredients_json,
        calories=totals["calories"],
        protein=totals["protein"],
        carbs=totals["carbs"],
        fat=totals["fat"],
        servings=recipe.servings,
    )
    db.add(new)
    db.commit()
    db.refresh(new)

    ingredient_objs = parse_ingredients(new.ingredients)

    return RecipeRead(
        id=new.id,
        title=new.title,
        instructions=new.instructions,
        ingredients=ingredient_objs,
        calories=new.calories,
        protein=new.protein,
        carbs=new.carbs,
        fat=new.fat,
        servings=new.servings,
    )

@router.get("/user", response_model=List[RecipeRead])
def list_my_recipes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    recs = db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()

    out: List[RecipeRead] = []
    for r in recs:
        ingredient_objs = parse_ingredients(r.ingredients)
        out.append(
            RecipeRead(
                id=r.id,
                title=r.title,
                instructions=r.instructions,
                ingredients=ingredient_objs,
                calories=r.calories,
                protein=r.protein,
                carbs=r.carbs,
                fat=r.fat,
                servings=r.servings,
            )
        )

    return out

@router.get("/user/{recipe_id}", response_model=RecipeRead)
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

    ingredient_objs = parse_ingredients(r.ingredients)

    return RecipeRead(
        id=r.id,
        title=r.title,
        instructions=r.instructions,
        ingredients=ingredient_objs,
        calories=r.calories,
        protein=r.protein,
        carbs=r.carbs,
        fat=r.fat,
        servings=r.servings,
    )

@router.patch("/user/{recipe_id}", response_model=RecipeRead)
def update_my_recipe(
    recipe_id: int,
    recipe_in: RecipeUpdate,
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

    data = recipe_in.dict(exclude_unset=True)

    if "ingredients" in data:
        try:
            safe_ingredients = ensure_ingredient_list(data["ingredients"])
            data["ingredients"] = json.dumps(safe_ingredients)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not serialize updated ingredients: {e}")

        totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        for ing in safe_ingredients:
            n = get_nutrients_for_ingredient(ing)
            totals["calories"] += n["calories"]
            totals["protein"]  += n["protein"]
            totals["carbs"]    += n["carbs"]
            totals["fat"]      += n["fat"]
        data["calories"] = totals["calories"]
        data["protein"]  = totals["protein"]
        data["carbs"]    = totals["carbs"]
        data["fat"]      = totals["fat"]

    for field, val in data.items():
        setattr(r, field, val)

    db.commit()
    db.refresh(r)

    ingredient_objs = parse_ingredients(r.ingredients)

    return RecipeRead(
        id=r.id,
        title=r.title,
        instructions=r.instructions,
        ingredients=ingredient_objs,
        calories=r.calories,
        protein=r.protein,
        carbs=r.carbs,
        fat=r.fat,
        servings=r.servings
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
