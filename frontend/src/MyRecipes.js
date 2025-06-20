import React, { useEffect, useState } from "react";
import "./App.css";
const API_BASE = process.env.REACT_APP_API_BASE;

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [batchMultipliers, setBatchMultipliers] = useState({}); // recipeId: batch multiplier

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("❌ Not logged in");
      return;
    }
    fetch(`${API_BASE}/recipes/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setRecipes(data);
        // Set default batch for each recipe (always 1)
        const batches = {};
        for (const r of data) {
          batches[r.id] = 1;
        }
        setBatchMultipliers(batches);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const handleDelete = (id) => {
    fetch(`${API_BASE}/recipes/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 204) {
          setRecipes((prev) => prev.filter((r) => r.id !== id));
        } else {
          throw new Error(`Delete failed: ${res.status}`);
        }
      })
      .catch((err) => setError(err.message));
  };

  const startEdit = (recipe) => {
    setEditingId(recipe.id);
    setForm({
      title: recipe.title,
      portions: recipe.portions ?? 1, // 👈 was servings
      ingredients: JSON.stringify(recipe.ingredients, null, 2),
      instructions: recipe.instructions,
      calories: recipe.calories ?? "",
      protein: recipe.protein ?? "",
      carbs: recipe.carbs ?? "",
      fat: recipe.fat ?? "",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
    setError("");
  };

  const saveEdit = async (id) => {
    try {
      let parsedIngredients;
      try {
        parsedIngredients = JSON.parse(form.ingredients);
        if (!Array.isArray(parsedIngredients)) {
          throw new Error("Ingredients must be a JSON array");
        }
      } catch (e) {
        setError("Ingredients JSON invalid: " + e.message);
        return;
      }

      let portionsNum = Number(form.portions);
      if (isNaN(portionsNum) || portionsNum < 1) portionsNum = 1;

      const bodyToSend = {
        title: form.title,
        portions: portionsNum, // 👈 was servings
        instructions: form.instructions,
        ingredients: parsedIngredients,
        calories: form.calories === "" ? null : parseFloat(form.calories),
        protein: form.protein === "" ? null : parseFloat(form.protein),
        carbs: form.carbs === "" ? null : parseFloat(form.carbs),
        fat: form.fat === "" ? null : parseFloat(form.fat),
      };

      const res = await fetch(`${API_BASE}/recipes/user/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || `Status ${res.status}`);
        return;
      }
      const updatedRecipe = await res.json();
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? updatedRecipe : r))
      );
      cancelEdit();
      setBatchMultipliers((prev) => ({
        ...prev,
        [id]: 1 // Reset to one batch on edit
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Batch multiplier logic ---
  const handleBatchChange = (recipeId, value) => {
    let n = Number(value);
    if (isNaN(n) || n < 1) n = 1;
    setBatchMultipliers((prev) => ({
      ...prev,
      [recipeId]: n,
    }));
  };

  // Format ingredient amount, rounding nicely
  function formatAmount(val) {
    if (typeof val !== "number") return val;
    if (Number.isInteger(val)) return val;
    // Show up to 2 decimal places, remove trailing zeros
    return parseFloat(val.toFixed(2));
  }

  // Split instructions into steps
  function renderInstructions(instr) {
    if (!instr) return <span style={{ color: "#888" }}>No instructions</span>;
    const steps = instr.split(/\r?\n/).filter(Boolean);
    if (steps.length <= 1) {
      // Fallback for plain one-line instructions
      return <div className="instructions">{instr}</div>;
    }
    return (
      <ol className="instructions-list">
        {steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
    );
  }

  if (error) {
    return <p className="error-text">❌ {error}</p>;
  }

  return (
    <div className="recipes-app-container">
      <h2 className="recipes-title">📋 My Recipes</h2>
      {recipes.length === 0 ? (
        <p className="no-recipes">No recipes saved yet.</p>
      ) : (
        <ul className="myrecipes-list">
          {recipes.map((r) => {
            const basePortions = r.portions ?? 1; // 👈 was servings
            const batches = batchMultipliers[r.id] ?? 1;
            return (
              <li className="myrecipe-card" key={r.id}>
                {editingId === r.id ? (
                  <div className="edit-form">
                    {/* ... rest of edit UI, unchanged ... */}
                    <div className="form-group">
                      <label>Portions</label>
                      <input
                        name="portions"
                        type="number"
                        min="1"
                        value={form.portions}
                        onChange={(e) =>
                          setForm({ ...form, portions: e.target.value })
                        }
                      />
                      <small style={{ color: "#888" }}>
                        How many portions does this recipe make?
                      </small>
                    </div>
                    {/* ... rest unchanged ... */}
                    <div className="recipe-actions">
                      <button
                        onClick={() => saveEdit(r.id)}
                        className="button-small"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="button-small cancel"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="myrecipe-header">
                      <h3>{r.title}</h3>
                      <div>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(r.id)}
                          title="Delete this recipe"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => startEdit(r)}
                          className="button-small edit-btn"
                          title="Edit this recipe"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                    <div className="myrecipe-section">
                      <span className="section-label">Yields:</span>
                      <span style={{ fontWeight: 500, marginLeft: 8 }}>
                        {basePortions} portions
                      </span>
                    </div>
                    <div className="myrecipe-section">
                      <label style={{ fontWeight: 500, marginRight: 8 }}>
                        Batch multiplier:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={batches}
                        style={{
                          width: 60,
                          fontWeight: 600,
                          borderRadius: 6,
                          padding: "2px 6px",
                          border: "1px solid #bbb"
                        }}
                        onChange={e => handleBatchChange(r.id, e.target.value)}
                        title="Multiply recipe to make multiple batches"
                      />
                      <span style={{ color: "#999", marginLeft: 8 }}>
                        (Ingredients scale ×{batches})
                      </span>
                    </div>
                    <div className="myrecipe-section">
                      <span className="section-label">Ingredients</span>
                      <ul className="ingredient-list">
                        {Array.isArray(r.ingredients) && r.ingredients.length > 0 ? (
                          r.ingredients.map((ing, idx) => (
                            <li key={idx} className="ingredient-item">
                              <span className="ingredient-dot" />
                              <span className="ingredient-name">{ing.name}</span>
                              <span className="ingredient-details">
                                {formatAmount(Number(ing.amount) * batches)} {ing.unit}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="ingredient-item" style={{ color: "#888" }}>
                            No ingredients listed
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="myrecipe-section">
                      <span className="section-label">Instructions</span>
                      {renderInstructions(r.instructions)}
                    </div>
                    <div className="myrecipe-section">
                      <span className="section-label">Nutrition</span>
                      <span className="nutrition-info">
                        {`Total: ${Math.round(r.calories ?? 0)} kcal, ${Math.round(r.protein ?? 0)}g protein, ${Math.round(r.carbs ?? 0)}g carbs, ${Math.round(r.fat ?? 0)}g fat`}
                        <br />
                        <b>Per Portion:</b> {Math.round((r.calories ?? 0) / basePortions)} kcal, 
                        {Math.round((r.protein ?? 0) / basePortions)}g protein, 
                        {Math.round((r.carbs ?? 0) / basePortions)}g carbs, 
                        {Math.round((r.fat ?? 0) / basePortions)}g fat
                      </span>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyRecipes;
