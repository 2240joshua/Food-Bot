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
def search_ingredient_id(name):
    url = "https://api.spoonacular.com/food/ingredients/search"
    params = {
        "query": name,
        "number": 1,
        "apiKey": SPOONACULAR_API_KEY,
    }
    resp = requests.get(url, params=params)
    if resp.status_code == 200:
        results = resp.json().get("results", [])
        if results:
            return results[0]["id"]
    return None

def get_ingredient_nutrition(ingredient_id, amount, unit):
    url = f"https://api.spoonacular.com/food/ingredients/{ingredient_id}/information"
    params = {
        "amount": amount,
        "unit": unit,
        "apiKey": SPOONACULAR_API_KEY,
    }
    resp = requests.get(url, params=params)
    if resp.status_code == 200:
        nutrients = resp.json().get("nutrition", {}).get("nutrients", [])
        def grab(nutrient):
            for n in nutrients:
                if n["name"].lower() == nutrient.lower():
                    return n["amount"]
            return 0.0
        return {
            "calories": grab("Calories"),
            "protein": grab("Protein"),
            "carbs": grab("Carbohydrates"),
            "fat": grab("Fat"),
        }
    return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

def get_nutrients_for_ingredient(ingredient):

    ingredient_id = search_ingredient_id(ingredient["name"])
    if not ingredient_id:
        return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    return get_ingredient_nutrition(ingredient_id, ingredient["amount"], ingredient["unit"])
