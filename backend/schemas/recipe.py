from pydantic import BaseModel
from typing import Optional
class RecipeCreate(BaseModel):
    title: str
    ingredients: str
    instructions: str
    calories: float
    protein: float
    carbs: float
    fat: float

class RecipeRead(RecipeCreate):
    id: int

    class Config:
        orm_mode = True
class RecipeUpdate(BaseModel):
    title: Optional[str]
    ingredients: Optional[str]
    instructions: Optional[str]
    calories: Optional[float]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]

    class Config:
        orm_mode = True