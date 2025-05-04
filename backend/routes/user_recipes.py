from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.database import SessionLocal
from backend.models.user import User
from backend.models.user_recipe import UserRecipe
from backend.schemas.user_recipe import UserRecipeCreate, UserRecipeOut
from typing import List
from fastapi import status

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create recipe
@router.post("/recipes/", response_model=UserRecipeOut, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: UserRecipeCreate, user_id: int, db: Session = Depends(get_db)):
    new_recipe = UserRecipe(**recipe.dict(), user_id=user_id)
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    return new_recipe

# Get all public recipes
@router.get("/recipes/public", response_model=List[UserRecipeOut])
def get_public_recipes(db: Session = Depends(get_db)):
    return db.query(UserRecipe).filter(UserRecipe.is_public == True).all()

# Get my recipes
@router.get("/recipes/my", response_model=List[UserRecipeOut])
def get_my_recipes(user_id: int, db: Session = Depends(get_db)):
    return db.query(UserRecipe).filter(UserRecipe.user_id == user_id).all()

# Update recipe
@router.put("/recipes/{recipe_id}", response_model=UserRecipeOut)
def update_recipe(recipe_id: int, recipe_update: UserRecipeCreate, db: Session = Depends(get_db)):
    recipe = db.query(UserRecipe).filter(UserRecipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    for key, value in recipe_update.dict().items():
        setattr(recipe, key, value)

    db.commit()
    db.refresh(recipe)
    return recipe

# Delete recipe
@router.delete("/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(UserRecipe).filter(UserRecipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(recipe)
    db.commit()
