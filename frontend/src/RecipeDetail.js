// src/RecipeDetail.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";

export default function RecipeDetail() {
  const { id } = useParams();
  const nav     = useNavigate();
  const [rec, setRec]     = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/recipes/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setRec)
      .catch(() => setError("Could not load recipe"));
  }, [id]);

  if (error) return <p className="error-text">❌ {error}</p>;
  if (!rec)   return <p>Loading…</p>;

  return (
    <div className="container">
      <button className="button-small" onClick={() => nav(-1)}>
        ← Back
      </button>
      <h1>{rec.title}</h1>
      <h3>Ingredients</h3>
      <p>{rec.ingredients}</p>
      <h3>Instructions</h3>
      <p>{rec.instructions}</p>
      <h3>Nutrition</h3>
      <p>
        {`${rec.calories} kcal, ${rec.protein}g protein, ${rec.carbs}g carbs, ${rec.fat}g fat`}
      </p>
    </div>
  );
}
