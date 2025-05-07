// src/MealPlanner.js

import React, { useEffect, useState } from "react";
import "./App.css";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function MealPlanner({
  plannedMeals,
  setPlannedMeals,
  addMeal,
  selectedDay,
  setSelectedDay
}) {
  const [recipes, setRecipes]   = useState([]);
  const [expanded, setExpanded] = useState({});

  // Fetch saved recipes on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/recipes/user", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  // Optimistically remove from UI, then DELETE on server
  const removeFromPlan = (recipeId) => {
    // 1) Update local state immediately
    setPlannedMeals(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter(m => m.id !== recipeId)
    }));

    // 2) Send DELETE to server
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/planner/${selectedDay}/${recipeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
      })
      .catch(err => {
        console.error("❌ removeFromPlan error:", err);
        // Optionally, re-fetch the full plan here to resync:
        // fetchPlanner();
      });
  };

  // Toggle the “View More” section
  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const dayMeals = plannedMeals[selectedDay] || [];

  // Sum nutrition for the day
  const totals = dayMeals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein:  acc.protein  + m.protein,
    carbs:    acc.carbs    + m.carbs,
    fat:      acc.fat      + m.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="planner-container">
      <div className="planner-days">
        {DAYS.map(day => (
          <button
            key={day}
            className={day === selectedDay ? "active" : ""}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="planner-content">
        {/* Left: Your recipes to add */}
        <div className="recipes-list">
          <h3>My Recipes</h3>
          {recipes.map(r => (
            <button
              key={r.id}
              className="button-recipe"
              onClick={() => addMeal(r)}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Right: Today’s Plan + nutrition */}
        <div className="day-plan">
          <h3>{selectedDay}</h3>
          <div className="nutrition-summary">
            <strong>Daily Total:</strong>{" "}
            {`${totals.calories} kcal, ${totals.protein}g P, ${totals.carbs}g C, ${totals.fat}g F`}
          </div>

          {dayMeals.length === 0 ? (
            <p>No meals yet—click a recipe to add.</p>
          ) : (
            dayMeals.map(m => (
              <div className="meal-entry" key={m.id}>
                <div className="meal-header">
                  <button className="button-plan">{m.title}</button>
                  <button className="button-view" onClick={() => toggleExpand(m.id)}>
                    {expanded[m.id] ? "Hide" : "View More"}
                  </button>
                  <button className="button-remove" onClick={() => removeFromPlan(m.id)}>
                    🗑️
                  </button>
                </div>

                {expanded[m.id] && (
                  <div className="meal-details">
                    <p><strong>Ingredients:</strong> {m.ingredients}</p>
                    <p><strong>Instructions:</strong> {m.instructions}</p>
                    <p>
                      <strong>Nutrition:</strong>{" "}
                      {`${m.calories} kcal, ${m.protein}g P, ${m.carbs}g C, ${m.fat}g F`}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
