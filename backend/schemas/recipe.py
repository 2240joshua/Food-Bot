from pydantic import BaseModel

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
