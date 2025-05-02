import React, { useEffect, useState } from "react";

function MyUploads({ onAddMeal }) {
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:8000/meals/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setMeals(data);
        } else {
          setError(data.detail || "Failed to fetch meals");
        }
      } catch (err) {
        setError("❌ Network error");
      }
    };

    fetchMeals();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container">
      <h2>📦 My Uploaded Meals</h2>
      {meals.length === 0 ? (
        <p>You haven't uploaded any meals yet.</p>
      ) : (
        <ul>
          {meals.map((meal) => (
            <li key={meal.id} style={{ marginBottom: "1rem" }}>
              <strong>{meal.title}</strong> - {meal.calories} kcal
              <br />
              Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fat: {meal.fat}g
              <br />
              {onAddMeal && (
                <button onClick={() => onAddMeal(meal)} className="button-small">
                  ➕ Add to Planner
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyUploads;
