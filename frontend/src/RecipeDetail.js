// src/RecipeDetail.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css"; // or RecipeDetail.css if you prefer

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    fetch(`https://foodbot-backend.onrender.com/recipes/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return Promise.reject();
        return res.json();
      })
      .then((data) => {
        setRec(data);
      })
      .catch(() => setError("Could not load recipe"));
  }, [id]);

  if (error) return <p className="error-text">❌ {error}</p>;
  if (!rec) return <p>Loading…</p>;

  return (
    <div className="container">
      <button
        className="button-small"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>

      <h1>{rec.title}</h1>

      <h3>Ingredients</h3>
      <ul>
        {Array.isArray(rec.ingredients) && rec.ingredients.length > 0 ? (
          rec.ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing.name} — {ing.amount} {ing.unit}
            </li>
          ))
        ) : (
          <li>No ingredients provided.</li>
        )}
      </ul>

      <h3>Instructions</h3>
      {rec.instructions ? (
        rec.instructions.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))
      ) : (
        <p>N/A</p>
      )}

      <h3>Nutrition</h3>
      <p>
        {rec.calories != null && (
          <>
            <strong>Calories:</strong> {rec.calories} kcal<br />
          </>
        )}
        {rec.protein != null && (
          <>
            <strong>Protein:</strong> {rec.protein} g<br />
          </>
        )}
        {rec.carbs != null && (
          <>
            <strong>Carbs:</strong> {rec.carbs} g<br />
          </>
        )}
        {rec.fat != null && (
          <>
            <strong>Fat:</strong> {rec.fat} g
          </>
        )}
      </p>
    </div>
  );
}
