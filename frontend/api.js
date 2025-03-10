const API_URL = "http://localhost:8000";

export async function getRecipes(ingredients, cuisine, diet, maxTime) {
    const response = await fetch(`${API_URL}/recommend?ingredients=${ingredients}&cuisine=${cuisine}&diet=${diet}&max_ready_time=${maxTime}`);
    return response.json();
}
