import requests
from backend.config import SPOONACULAR_API_KEY, BASE_URL

def fetch_recipes(query="", ingredients="", cuisine="", diet="", max_ready_time=30, number=5):
    """
    Fetch recipes from Spoonacular API based on query parameters.
    
    Args:
        query (str): Search query for recipes.
        ingredients (str): Comma-separated ingredients list.
        cuisine (str): Type of cuisine (e.g., "italian").
        diet (str): Dietary restriction (e.g., "vegetarian").
        max_ready_time (int): Max cooking time in minutes.
        number (int): Number of results to return.

    Returns:
        list: A list of recipes matching the criteria.
    """
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
