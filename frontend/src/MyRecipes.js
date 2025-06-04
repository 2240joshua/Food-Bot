import React, { useEffect, useState } from "react";
import "./App.css";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("❌ Not logged in");
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/recipes/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(setRecipes)
      .catch((err) => setError(err.message));
  }, [token]);

  const handleDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/recipes/user/${id}`, {
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
      servings: recipe.servings ?? 1,
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

    // Ensure servings is a valid number >= 1
    let servingsNum = Number(form.servings);
    if (isNaN(servingsNum) || servingsNum < 1) servingsNum = 1;

    const bodyToSend = {
      title: form.title,
      servings: servingsNum,
      instructions: form.instructions,
      ingredients: parsedIngredients,
      calories: form.calories === "" ? null : parseFloat(form.calories),
      protein: form.protein === "" ? null : parseFloat(form.protein),
      carbs: form.carbs === "" ? null : parseFloat(form.carbs),
      fat: form.fat === "" ? null : parseFloat(form.fat),
    };

    // Log for debugging:
    console.log("PATCH bodyToSend", bodyToSend);

    const res = await fetch(`${process.env.REACT_APP_API_URL}/recipes/user/${id}`, {
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
  } catch (err) {
    setError(err.message);
  }
};

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
          {recipes.map((r) => (
            <li className="myrecipe-card" key={r.id}>
              {editingId === r.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Servings</label>
                    <input
                      name="servings"
                      type="number"
                      min="1"
                      value={form.servings}
                      onChange={(e) =>
                        setForm({ ...form, servings: e.target.value })
                      }
                    />
                    <small style={{ color: "#888" }}>
                      How many servings does this recipe make?
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Ingredients (JSON‐array)</label>
                    <textarea
                      name="ingredients"
                      rows={4}
                      value={form.ingredients}
                      onChange={(e) =>
                        setForm({ ...form, ingredients: e.target.value })
                      }
                    />
                    <small style={{ fontSize: "0.8em", color: "#666" }}>
                      Example:  
                      <br />
                      [{"{"}"name":"egg","amount":1.0,"unit":"g"{"}"}]
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Instructions</label>
                    <textarea
                      name="instructions"
                      rows={3}
                      value={form.instructions}
                      onChange={(e) =>
                        setForm({ ...form, instructions: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      name="calories"
                      type="number"
                      value={form.calories}
                      onChange={(e) =>
                        setForm({ ...form, calories: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      name="protein"
                      type="number"
                      value={form.protein}
                      onChange={(e) =>
                        setForm({ ...form, protein: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      name="carbs"
                      type="number"
                      value={form.carbs}
                      onChange={(e) =>
                        setForm({ ...form, carbs: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      name="fat"
                      type="number"
                      value={form.fat}
                      onChange={(e) =>
                        setForm({ ...form, fat: e.target.value })
                      }
                    />
                  </div>
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
                    <span className="section-label">Servings</span>
                    <span style={{ fontWeight: 500, marginLeft: 8 }}>
                      {r.servings ?? 1}
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
                              {ing.amount} {ing.unit}
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
                    <div className="instructions">{r.instructions}</div>
                  </div>
                  <div className="myrecipe-section">
                    <span className="section-label">Nutrition</span>
                    <span className="nutrition-info">
                      {`Total: ${Math.round(r.calories ?? 0)} kcal, ${Math.round(r.protein ?? 0)}g protein, ${Math.round(r.carbs ?? 0)}g carbs, ${Math.round(r.fat ?? 0)}g fat`}


                      <br />
                      <b>Per Serving:</b> {Math.round((r.calories ?? 0)/(r.servings ?? 1))} kcal, 
                      {Math.round((r.protein ?? 0)/(r.servings ?? 1))}g protein, 
                      {Math.round((r.carbs ?? 0)/(r.servings ?? 1))}g carbs, 
                      {Math.round((r.fat ?? 0)/(r.servings ?? 1))}g fat
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyRecipes;
