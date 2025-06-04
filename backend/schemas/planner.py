from pydantic import BaseModel
from typing import List, Dict

class DayPlan(BaseModel):
    day: str               
    recipe_ids: List[int]  

class FullPlan(BaseModel):
    plans: Dict[str, List[int]]

