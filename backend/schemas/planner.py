from pydantic import BaseModel
from typing import List, Dict

class DayPlan(BaseModel):
    day: str               # e.g. "Monday"
    recipe_ids: List[int]  # list of UserRecipe.id

class FullPlan(BaseModel):
    plans: Dict[str, List[int]]
    # e.g. { "Monday":[1,2], "Tuesday":[3], … }
