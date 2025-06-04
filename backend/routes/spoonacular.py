from fastapi import APIRouter
import requests
from env import SPOONACULAR_API_KEY

router = APIRouter()

@router.get("/recipes/spoonacular/{recipe_id}")
def get_full_recipe(recipe_id: int):
    url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    params = {"apiKey": SPOONACULAR_API_KEY}

    res = requests.get(url, params=params)

    if res.status_code != 200:
        return {"detail": "Recipe not found or error"}

    return res.json()
