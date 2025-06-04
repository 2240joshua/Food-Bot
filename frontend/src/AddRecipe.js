import React, { useState } from "react";
import FoodSearch from "./FoodSearch";

// --- Add this function at the top ---
function parseFraction(input) {
  input = input.trim();
  // Handles mixed numbers, e.g. 1 1/2
  const mixed = input.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Handles fractions, e.g. 2/3
  const frac = input.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  // Handles decimals and integers
  const asFloat = parseFloat(input);
  if (!isNaN(asFloat)) return asFloat;
  return 0; // fallback for invalid input
}

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [message, setMessage] = useState("");

  const handleIngChange = (idx, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };

  const addRow = () =>
    setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);

  const removeRow = (idx) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));

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
      servings,
      ingredients: ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name.trim(),
          amount: parseFraction(ing.amount), // <-- Use parseFraction here
          unit: ing.unit.trim(),
        })),
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/recipes/user`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Saved: ${data.title}`);
        setTitle("");
        setInstructions("");
        setServings(1);
        setIngredients([{ name: "", amount: "", unit: "" }]);
      } else {
        setMessage(`❌ ${data.detail || res.statusText}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="container">
      <h2>➕ Add Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* --- Title and Servings Row --- */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: 8 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
            style={{ flex: 1, minWidth: 0 }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontWeight: 500 }}>Servings:</span>
            <input
              type="number"
              min="1"
              value={servings}
              onChange={e => setServings(Number(e.target.value))}
              required
              className="input-field"
              style={{ width: 60 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16, marginLeft: 6 }}>
          <small style={{ color: "#666" }}>
            How many servings does this recipe make?
          </small>
        </div>

        <h4>Ingredients</h4>
        {ingredients.map((ing, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              alignItems: "center"
            }}
          >
            <div style={{ width: 220, flexShrink: 0 }}>
              <FoodSearch
                value={ing.name}
                onChange={val => handleIngChange(i, "name", val)}
                onSelect={item => handleIngChange(i, "name", item.name)}
              />
            </div>
            <input
              placeholder="Amount (e.g. 2, 1.5, 2/3, 1 1/2)"
              type="text" // <-- changed from number to text
              value={ing.amount}
              onChange={(e) => handleIngChange(i, "amount", e.target.value)}
              className="input-field"
              style={{ width: "80px", flexShrink: 0 }}
            />
            <input
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => handleIngChange(i, "unit", e.target.value)}
              className="input-field"
              style={{ width: "80px", flexShrink: 0 }}
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
        </button>

        <h4>Instructions</h4>
        <textarea
          placeholder="Step-by-step instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          className="input-field"
        />

        <button type="submit" className="button">
          Save Recipe
        </button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
