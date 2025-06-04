// src/RecipeView.js

import React from "react";
import "./App.css"; // or create a RecipeView.css if you like

export default function RecipeView({ recipe }) {
  return (
    <div className="container">
      <h2>{recipe.title}</h2>

      <p>
        <strong>Description:</strong>{" "}
        {recipe.description || "N/A"}
      </p>

      <h4>Ingredients:</h4>
      <ul>
        {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
          recipe.ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing.name} — {ing.amount} {ing.unit}
            </li>
          ))
        ) : (
          <li>No ingredients provided.</li>
        )}
      </ul>

      <h4>Instructions:</h4>
      {/* 
        If you still want to support newline-separated instructions,
        you can split on "\n". Otherwise just show as a single paragraph.
      */}
      {recipe.instructions ? (
        recipe.instructions.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))
      ) : (
        <p>N/A</p>
      )}

      <h4>Nutrition:</h4>
      <p>
        {recipe.calories != null && (
          <>
            <strong>Calories:</strong> {recipe.calories} kcal<br />
          </>
        )}
        {recipe.protein != null && (
          <>
            <strong>Protein:</strong> {recipe.protein} g<br />
          </>
        )}
        {recipe.carbs != null && (
          <>
            <strong>Carbs:</strong> {recipe.carbs} g<br />
          </>
        )}
        {recipe.fat != null && (
          <>
            <strong>Fat:</strong> {recipe.fat} g
          </>
        )}
      </p>
    </div>
  );
}
