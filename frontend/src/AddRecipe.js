// src/AddRecipe.js

import React, { useState } from "react";

function AddRecipe() {
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/recipes/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          ingredients: form.ingredients,
          instructions: form.instructions,
          calories: parseFloat(form.calories),
          protein: parseFloat(form.protein),
          carbs: parseFloat(form.carbs),
          fat: parseFloat(form.fat)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Saved: ${data.title}`);
        setForm({
          title: "",
          ingredients: "",
          instructions: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: ""
        });
      } else {
        setMessage(`❌ ${data.detail || "Failed to save"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="container">
      <h2>➕ Add Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="input-field"
        /><br/>
        <textarea
          name="ingredients"
          placeholder="Ingredients (comma separated)"
          value={form.ingredients}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <input
          type="number"
          name="calories"
          placeholder="Calories"
          value={form.calories}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <input
          type="number"
          name="protein"
          placeholder="Protein (g)"
          value={form.protein}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <input
          type="number"
          name="carbs"
          placeholder="Carbs (g)"
          value={form.carbs}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <input
          type="number"
          name="fat"
          placeholder="Fat (g)"
          value={form.fat}
          onChange={handleChange}
          className="input-field"
        /><br/>
        <button type="submit" className="button">Save Recipe</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddRecipe;
