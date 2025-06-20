import React, { useState } from "react";
import FoodSearch from "./FoodSearch";
import "./AddRecipe.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [portions, setPortions] = useState(1); // was servings
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);
  const [instructions, setInstructions] = useState([""]);
  const [message, setMessage] = useState("");

  // Ingredient handlers
  const handleIngredientChange = (idx, field, value) => {
    setIngredients(ings =>
      ings.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };
  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  const removeIngredient = idx => setIngredients(ings => ings.filter((_, i) => i !== idx));

  // Instructions handlers
  const handleInstructionChange = (idx, value) => {
    setInstructions(ins => ins.map((step, i) => (i === idx ? value : step)));
  };
  const addInstruction = () => setInstructions(ins => [...ins, ""]);
  const removeInstruction = idx => setInstructions(ins => ins.filter((_, i) => i !== idx));
  const moveInstruction = (idx, dir) => {
    setInstructions(ins => {
      const arr = [...ins];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return arr;
    });
  };

  // Submit handler
  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in");
      return;
    }
    const instructionsString = instructions.filter(s => s.trim()).join("\n");
    const payload = {
      title,
      instructions: instructionsString,
      portions, // 👈 use portions, not servings
      ingredients: ingredients.filter(ing => ing.name.trim()),
    };

    try {
      const res = await fetch(`${API_BASE}/recipes/user`, {
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
        setInstructions([""]);
        setPortions(1);
        setIngredients([{ name: "", amount: "", unit: "" }]);
      } else {
        setMessage(`❌ ${data.detail || res.statusText}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="add-recipe-card">
      <h2>➕ Add Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* Title and portions */}
        <div className="row">
          <input
            className="big-input"
            placeholder="Recipe Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div>
            <label>Portions:</label>
            <input
              type="number"
              min={1}
              value={portions}
              onChange={e => setPortions(e.target.value)}
              className="servings-input"
              required
            />
            <div style={{ fontSize: "0.9em", color: "#888" }}>
              (How many portions/people does this recipe serve?)
            </div>
          </div>
        </div>

        {/* INGREDIENTS */}
        <h3>Ingredients</h3>
        <div className="ingredients-list">
          {ingredients.map((ing, i) => (
            <div className="ingredient-row" key={i}>
              <div className="autocomplete-container">
                <FoodSearch
                  value={ing.name}
                  onChange={val => handleIngredientChange(i, "name", val)}
                  onSelect={item => handleIngredientChange(i, "name", item.name)}
                />
              </div>
              <input
                type="text"
                placeholder="Amount (e.g. 1, 2/3)"
                value={ing.amount}
                onChange={e => handleIngredientChange(i, "amount", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Unit"
                value={ing.unit}
                onChange={e => handleIngredientChange(i, "unit", e.target.value)}
                required
              />
              {ingredients.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeIngredient(i)}>
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addIngredient}>＋ Add Ingredient</button>

        {/* INSTRUCTIONS */}
        <h3>Instructions</h3>
        <div className="instructions-list">
          {instructions.map((step, i) => (
            <div className="instruction-row" key={i}>
              <span className="step-number">{i + 1}.</span>
              <input
                placeholder={`Step ${i + 1}`}
                value={step}
                onChange={e => handleInstructionChange(i, e.target.value)}
                required
              />
              <button type="button" onClick={() => moveInstruction(i, "up")} disabled={i === 0}>⬆️</button>
              <button type="button" onClick={() => moveInstruction(i, "down")} disabled={i === instructions.length - 1}>⬇️</button>
              {instructions.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeInstruction(i)}>🗑️</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addInstruction}>＋ Add Step</button>

        <button type="submit" className="save-btn">💾 Save Recipe</button>
      </form>
      {message && <div className="success-msg">{message}</div>}
    </div>
  );
}
