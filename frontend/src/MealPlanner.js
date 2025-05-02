import React, { useState, useEffect, useCallback } from "react";

function MealPlanner({ addMealExternal }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [plannedMeals, setPlannedMeals] = useState({});

  const addMeal = useCallback((meal) => {
    setPlannedMeals((prev) => {
      const dayMeals = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: [...dayMeals, meal],
      };
    });
  }, [selectedDay]);

  useEffect(() => {
    // ✅ FIXED: skip if addMealExternal is not ready (during login or logout)
    if (!addMealExternal || !addMealExternal.current) return;

    addMealExternal.current = (meal) => {
      addMeal(meal);
    };
  }, [addMeal, addMealExternal, selectedDay]);

  const getTotals = () => {
    const meals = plannedMeals[selectedDay] || [];
    return meals.reduce(
      (totals, meal) => {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fat || 0;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = getTotals();

  return (
    <div className="container">
      <h2>📅 Meal Planner</h2>

      <div>
        <strong>Select Day:</strong><br />
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{ margin: "5px", background: selectedDay === day ? "#007BFF" : "#eee", color: selectedDay === day ? "white" : "black", borderRadius: "5px" }}
          >
            {day}
          </button>
        ))}
      </div>

      <h3>Meals for {selectedDay}</h3>
      <ul>
        {(plannedMeals[selectedDay] || []).map((meal, index) => (
          <li key={index}>
            <strong>{meal.title}</strong> - {meal.calories} kcal
            <br />
            Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fat: {meal.fat}g
          </li>
        ))}
      </ul>

      <h3>Totals</h3>
      <p>Calories: {totals.calories} kcal</p>
      <p>Protein: {totals.protein}g</p>
      <p>Carbs: {totals.carbs}g</p>
      <p>Fat: {totals.fat}g</p>
    </div>
  );
}

export default MealPlanner;
