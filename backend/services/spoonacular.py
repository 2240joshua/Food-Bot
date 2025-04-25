import requests
from backend.config import SPOONACULAR_API_KEY, BASE_URL

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
        "apiKey": SPOONACULAR_API_KEY,
    }

    response = requests.get(BASE_URL, params=params)
    
    if response.status_code == 200:
        return response.json().get("results", [])
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return []