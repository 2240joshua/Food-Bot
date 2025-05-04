import React from "react";

function RecipeView({ recipe }) {
  return (
    <div className="container">
      <h2>{recipe.title}</h2>
      <p><strong>Description:</strong> {recipe.description || "N/A"}</p>
      <p><strong>Ingredients:</strong><br />{recipe.ingredients?.split("\n").map((i, idx) => <span key={idx}>{i}<br/></span>)}</p>
      <p><strong>Instructions:</strong><br />{recipe.instructions?.split("\n").map((i, idx) => <span key={idx}>{i}<br/></span>)}</p>
      <p><strong>Calories:</strong> {recipe.calories} kcal</p>
      <p><strong>Protein:</strong> {recipe.protein}g</p>
      <p><strong>Carbs:</strong> {recipe.carbs}g</p>
      <p><strong>Fat:</strong> {recipe.fat}g</p>
    </div>
  );
}

export default RecipeView;
