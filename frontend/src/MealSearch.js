import React, { useState } from "react";

function MealSearch({ onAddMeal }) {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  // Search endpoint
  const handleSearch = async () => {
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/recipes/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Search error:", data);
        setError(data.detail || `Error ${res.status}`);
      } else {
        setMeals(data);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("❌ Could not fetch recipes");
    }
  };

  // Save a recipe to your own list
  const saveToMyRecipes = async (meal) => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ You must be logged in to save recipes");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/recipes/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:        meal.title,
          ingredients:  meal.ingredients || "",
          instructions: meal.instructions || "",
          calories:     meal.calories || 0,
          protein:      meal.protein || 0,
          carbs:        meal.carbs || 0,
          fat:          meal.fat || 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Save error:", errData);
        setError(errData.detail || `Save failed: ${res.status}`);
      } else {
        alert("✅ Recipe saved to My Recipes!");
      }
    } catch (err) {
      console.error("Save fetch failed:", err);
      setError("❌ Could not save recipe");
    }
  };

  return (
    <div className="container">
      <h2>🔍 Search Meals</h2>
      <input
        placeholder="Search for meals (e.g., chicken)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-field"
      />
      <button onClick={handleSearch} className="button">
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {meals.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {meals.map((meal) => (
            <li key={meal.id} style={{ marginBottom: "1rem" }}>
              <strong>{meal.title}</strong>
              <br />
              Calories: {meal.calories} kcal
              <br />
              Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fat: {meal.fat}g
              <br />
              <button
                onClick={() => onAddMeal(meal)}
                className="button-small"
              >
                ➕ Add to Planner
              </button>
              <button
                onClick={() => saveToMyRecipes(meal)}
                className="button-small"
                style={{ marginLeft: 10 }}
              >
                💾 Save to My Recipes
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MealSearch;
