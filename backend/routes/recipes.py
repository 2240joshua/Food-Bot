# backend/routes/recipes.py
from fastapi import APIRouter, HTTPException, Query
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

@router.get("/recipes/search")
def search_recipes(query: str = Query(..., description="Food name to search")):
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 5,  # limit results for now
        "addRecipeNutrition": True,
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch recipes.")

    results = response.json().get("results", [])

    meals = []
    for item in results:
        nutrition = item.get("nutrition", {}).get("nutrients", [])
        calories = next((n["amount"] for n in nutrition if n["name"] == "Calories"), None)
        protein = next((n["amount"] for n in nutrition if n["name"] == "Protein"), None)
        fat = next((n["amount"] for n in nutrition if n["name"] == "Fat"), None)
        carbs = next((n["amount"] for n in nutrition if n["name"] == "Carbohydrates"), None)

        meals.append({
            "title": item.get("title"),
            "id": item.get("id"),
            "calories": calories,
            "protein": protein,
            "fat": fat,
            "carbs": carbs
        })

    return meals
