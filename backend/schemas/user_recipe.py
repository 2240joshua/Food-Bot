#backend/schemas/user_recipe.py
from pydantic import BaseModel
from typing import List, Optional

class IngredientIn(BaseModel):
    name: str
    amount: float
    unit: str

class RecipeCreate(BaseModel):
    title: str
    instructions: str
    ingredients: List[IngredientIn]
    servings: int = 1   


class RecipeRead(BaseModel):
    id: int
    title: str
    instructions: str
    ingredients: List[IngredientIn]
    calories: Optional[float]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    servings: int      

    class Config:
        from_attributes = True

class RecipeUpdate(BaseModel):
    title: Optional[str]
    ingredients: Optional[List[IngredientIn]]
    instructions: Optional[str]
    calories: Optional[float]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    servings: Optional[int] 

    class Config:
        from_attributes = True
