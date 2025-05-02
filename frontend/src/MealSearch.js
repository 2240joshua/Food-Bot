import React, { useState } from "react";

function MealSearch({ onAddMeal }) {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:8000/recipes/search?query=${query}`);
      const data = await res.json();

      if (res.ok) {
        setMeals(data);
        setError("");
      } else {
        setError(data.detail || "Something went wrong");
      }
    } catch (err) {
      setError("❌ Could not fetch recipes");
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
      <button onClick={handleSearch} className="button">Search</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {meals.length > 0 && (
        <ul>
          {meals.map((meal, index) => (
            <li key={index} style={{ marginBottom: "1rem" }}>
              <strong>{meal.title}</strong><br />
              Calories: {meal.calories} kcal<br />
              Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fat: {meal.fat}g<br />
              <button onClick={() => onAddMeal(meal)} className="button-small">➕ Add to Planner</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MealSearch;
