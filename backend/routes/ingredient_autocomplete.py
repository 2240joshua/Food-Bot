from fastapi import APIRouter, Query
import requests
from backend.env import SPOONACULAR_API_KEY

router = APIRouter(tags=["ingredients"])

@router.get("/ingredients/suggest")
def ingredient_suggest(q: str = Query(..., min_length=1)):
    """
    Return up to 12 ingredient suggestions from Spoonacular for a search prefix.
    """
    url = "https://api.spoonacular.com/food/ingredients/autocomplete"
    params = {
        "query": q,
        "number": 12,
        "apiKey": SPOONACULAR_API_KEY
    }
    res = requests.get(url, params=params)
    if res.ok:
        # Spoonacular returns [{"id":..., "name":..., ...}]
        results = res.json()
        # Return only the name field to the frontend
        return [{"name": r["name"]} for r in results if "name" in r]
    return []
