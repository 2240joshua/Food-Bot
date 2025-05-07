import React, { useEffect, useState } from "react";
import "./App.css";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function MealPlanner({
  plannedMeals,
  setPlannedMeals,
  selectedDay,
  setSelectedDay
}) {
  const [recipes, setRecipes] = useState([]);

  // Fetch your saved recipes (so you can add them)
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/recipes/user", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  // Remove one entry both locally & on server
  const removeFromPlan = (recipeId) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/planner/${selectedDay}/${recipeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error("Delete failed");
        return r.json();
      })
      .then(data => setPlannedMeals(data.plans))
      .catch(console.error);
  };

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
        {/* Left: your recipes to click and add */}
        <div className="recipes-list">
          <h3>My Recipes</h3>
          {recipes.map(r => (
            <button
              key={r.id}
              className="button-recipe"
              onClick={() => {
                // lift-add handled in parent via addMeal
              }}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Right: today’s plan with delete buttons */}
        <div className="day-plan">
          <h3>{selectedDay}</h3>
          {!(plannedMeals[selectedDay] || []).length ? (
            <p>No meals yet—click a recipe to add.</p>
          ) : (
            plannedMeals[selectedDay].map(m => (
              <div 
                key={m.id} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <button className="button-plan">
                  {m.title}
                </button>
                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#c00'
                  }}
                  onClick={() => removeFromPlan(m.id)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
