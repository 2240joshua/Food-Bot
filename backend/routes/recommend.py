from fastapi import APIRouter, Query
from backend.services.spoonacular import fetch_recipes

router = APIRouter()

@router.get("/recommend")
def get_recommendations(
    ingredients: str = Query("", description="Comma-separated list of ingredients"),
    cuisine: str = Query("", description="Type of cuisine (e.g., 'italian')"),
    diet: str = Query("", description="Dietary restrictions (e.g., 'vegetarian')"),
    max_ready_time: int = Query(30, description="Max cooking time in minutes"),
    number: int = Query(5, description="Number of recipes to return")
):
    """
    API endpoint to fetch recipe recommendations based on user preferences.
    """
    recipes = fetch_recipes(ingredients=ingredients, cuisine=cuisine, diet=diet, max_ready_time=max_ready_time, number=number)
    return {"recipes": recipes}
