import React, { useState } from "react";
import "./App.css";

export default function AddRecipe() {
  const [title, setTitle]           = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients]   = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [message, setMessage] = useState("");

  const handleIngChange = (i, field, val) => {
    const copy = [...ingredients];
    copy[i][field] = val;
    setIngredients(copy);
  };
  const addRow = () =>
    setIngredients(prev => [...prev, { name: "", amount: "", unit: "" }]);
  const removeRow = (i) =>
    setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in");
      return;
    }

    const payload = {
      title,
      instructions,
      ingredients: ingredients.map(i => ({
        name: i.name,
        amount: parseFloat(i.amount),
        unit: i.unit
      }))
    };

    try {
      const res = await fetch("http://localhost:8000/recipes/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Saved: ${data.title}`);
        setTitle("");
        setInstructions("");
        setIngredients([{ name: "", amount: "", unit: "" }]);
      } else {
        setMessage(`❌ ${data.detail || res.statusText}`);
      }
    } catch {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="container">
      <h2>➕ Add Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="input-field"
        /><br/>

        {ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              placeholder="Ingredient"
              value={ing.name}
              onChange={e => handleIngChange(i, "name", e.target.value)}
              required
            />
            <input
              placeholder="Amount"
              type="number"
              value={ing.amount}
              onChange={e => handleIngChange(i, "amount", e.target.value)}
              required
            />
            <input
              placeholder="Unit"
              value={ing.unit}
              onChange={e => handleIngChange(i, "unit", e.target.value)}
              required
            />
            {i > 0 && (
              <button type="button" onClick={() => removeRow(i)}>
                –
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRow} className="button-small">
          ＋ Add Ingredient
        </button><br/>

        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          required
          className="input-field"
        /><br/>

        <button type="submit" className="button">
          Save Recipe
        </button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
