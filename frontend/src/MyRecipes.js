import React, { useState, useEffect } from "react";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")); // get logged in user
    const userId = user?.id;

    if (!userId) {
      setError("❌ User not logged in");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/recipes/my?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setRecipes(data);
      } else {
        setError(data.detail || "Failed to fetch recipes");
      }
    } catch (err) {
      setError("❌ Network error");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/recipes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setRecipes(recipes.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="container">
      <h2>📋 My Recipes</h2>
      {recipes.length === 0 ? <p>No recipes yet.</p> : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <strong>{recipe.title}</strong> - {recipe.calories} kcal<br />
              Ingredients: {recipe.ingredients}<br />
              Instructions: {recipe.instructions}<br />
              <button onClick={() => handleDelete(recipe.id)} className="button-small">🗑 Delete</button>
            </li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default MyRecipes;
