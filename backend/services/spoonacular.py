import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from env import SPOONACULAR_API_KEY, BASE_URL

def fetch_recipes(query="", ingredients="", cuisine="", diet="", max_ready_time=30, number=5):
    params = {
        "query": query,
        "includeIngredients": ingredients,
        "cuisine": cuisine,
        "diet": diet,
        "maxReadyTime": max_ready_time,
        "number": number,
        "instructionsRequired": True,
        "addRecipeInformation": True,
        "addRecipeNutrition": True,  
        "apiKey": SPOONACULAR_API_KEY,
    }

    response = requests.get(BASE_URL, params=params)

    if response.status_code == 200:
        recipes = response.json().get("results", [])


        result = []
        for recipe in recipes:
            nutrition = {n['title'].lower(): n['amount'] for n in recipe.get("nutrition", {}).get("nutrients", [])}
            result.append({
                "title": recipe.get("title"),
                "calories": nutrition.get("calories", 0),
                "protein": nutrition.get("protein", 0),
                "carbs": nutrition.get("carbohydrates", 0),
                "fat": nutrition.get("fat", 0),
            })

        return result
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return []
