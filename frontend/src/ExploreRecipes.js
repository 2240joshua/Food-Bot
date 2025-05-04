import React, { useState, useEffect } from "react";

function ExploreRecipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchPublicRecipes = async () => {
      const res = await fetch(`http://localhost:8000/recipes/public`);
      const data = await res.json();
      setRecipes(data);
    };

    fetchPublicRecipes();
  }, []);

  return (
    <div className="container">
      <h2>🌎 Explore Public Recipes</h2>
      {recipes.length === 0 ? <p>No public recipes yet.</p> : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <strong>{recipe.title}</strong> by User {recipe.user_id}<br />
              Ingredients: {recipe.ingredients}<br />
              Steps: {recipe.steps}<br />
              Calories: {recipe.calories} kcal
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExploreRecipes;
