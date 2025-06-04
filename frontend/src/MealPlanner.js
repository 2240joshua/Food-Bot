// src/MealPlanner.js

import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday",
  "Friday","Saturday","Sunday"
];

export default function MealPlanner({
  plannedMeals,
  setPlannedMeals,
  selectedDay,
  setSelectedDay
}) {
  const [recipes, setRecipes]     = useState([]);
  const [undoStack, setUndoStack] = useState(null);
  const [toast, setToast]         = useState("");

  // Helper to POST only IDs
  async function savePlanner(idMap) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.REACT_APP_API_URL}/planner/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plans: idMap }),
    });
    if (!res.ok) throw new Error("Failed to save planner");
    const data = await res.json();
    return data.plans;
  }

  // Convert full-object map → id-only map
  const toIdMap = useCallback(fullMap => {
    return Object.fromEntries(
      Object.entries(fullMap).map(
        ([day, meals]) => [day, meals.map(m => m.id)]
      )
    );
  }, []);

  // Convert id-only map → full-object map (depends on recipes)
  const toObjMap = useCallback(idMap => {
    return Object.fromEntries(
      Object.entries(idMap).map(
        ([day, ids]) => [
          day,
          ids
            .map(id => recipes.find(r => r.id === id))
            .filter(Boolean)
        ]
      )
    );
  }, [recipes]);

  // Sync full-object map → backend → full-object map
  async function syncPlan(fullMap) {
    const idMap    = toIdMap(fullMap);
    const savedMap = await savePlanner(idMap);
    const objMap   = toObjMap(savedMap);
    setPlannedMeals(objMap);
  }

  // Load saved planner once recipes are loaded
  useEffect(() => {
    if (!recipes.length) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.REACT_APP_API_URL}/planner/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        const obj = toObjMap(data.plans);
        setPlannedMeals(obj);
      })
      .catch(console.error);
  }, [recipes, setPlannedMeals, toObjMap]);

  // Load recipes for adding
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.REACT_APP_API_URL}/recipes/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setRecipes)
      .catch(console.error);
  }, []);

  // Add a meal
  const onAdd = meal => {
    const updated = {
      ...plannedMeals,
      [selectedDay]: [...(plannedMeals[selectedDay] || []), meal]
    };
    syncPlan(updated);
  };

  // Remove with confirm + undo
  const onRemove = (meal, idx) => {
    if (!window.confirm(`Remove "${meal.title}" from ${selectedDay}?`)) return;
    const list    = [...(plannedMeals[selectedDay] || [])];
    list.splice(idx, 1);
    const updated = { ...plannedMeals, [selectedDay]: list };

    setUndoStack({ day: selectedDay, meal, idx });
    setToast(`Removed "${meal.title}" — click to undo`);

    syncPlan(updated);
  };

  // Undo last delete
  const handleUndo = () => {
    if (!undoStack) return;
    const { day, meal, idx } = undoStack;
    const list    = [...(plannedMeals[day] || [])];
    list.splice(idx, 0, meal);
    const updated = { ...plannedMeals, [day]: list };

    setToast("");
    setUndoStack(null);
    syncPlan(updated);
  };

  // Reorder up/down
  const move = (dir, idx) => {
    const list = [...(plannedMeals[selectedDay] || [])];
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= list.length) return;
    [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
    const updated = { ...plannedMeals, [selectedDay]: list };
    syncPlan(updated);
  };

  const dayMeals = plannedMeals[selectedDay] || [];

  // Compute daily totals
  const totals = dayMeals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein:  acc.protein  + m.protein,
    carbs:    acc.carbs    + m.carbs,
    fat:      acc.fat      + m.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="planner-container">
      {/* Day selector */}
      <div className="planner-days">
        {DAYS.map(d => (
          <button
            key={d}
            className={d === selectedDay ? "active" : ""}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="planner-content">
        {/* Left: Recipe buttons */}
        <div className="recipes-list">
          <h3>My Recipes</h3>
          {recipes.map(r => (
            <button
              key={r.id}
              className="button-recipe"
              onClick={() => onAdd(r)}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Right: Today's plan */}
        <div className="day-plan">
          <h3>{selectedDay}</h3>
          <div className="nutrition-summary">
            <strong>Total:</strong>{" "}
            {`${totals.calories} kcal, ${totals.protein}g P, ${totals.carbs}g C, ${totals.fat}g F`}
          </div>
          {dayMeals.length === 0 ? (
            <p>No meals yet—click a recipe to add.</p>
          ) : (
            dayMeals.map((m, i) => (
              <div className="meal-entry" key={i}>
                <span className="meal-title">{m.title}</span>
                <div className="meal-controls">
                  <button onClick={() => move("up", i)} disabled={i === 0}>⬆️</button>
                  <button onClick={() => move("down", i)} disabled={i === dayMeals.length - 1}>⬇️</button>
                  <button onClick={() => onRemove(m, i)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Undo toast */}
      {toast && (
        <div className="undo-toast" onClick={handleUndo}>
          ↩️ {toast}
        </div>
      )}
    </div>
  );
}
