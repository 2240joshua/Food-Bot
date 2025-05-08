// src/MyRecipes.js

import React, { useEffect, useState } from "react";
import "./App.css";

function MyRecipes() {
  const [recipes, setRecipes]     = useState([]);
  const [error, setError]         = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState({});

  const token = localStorage.getItem("token");

  // Fetch saved recipes on mount
  useEffect(() => {
    if (!token) {
      setError("❌ Not logged in");
      return;
    }
    fetch("http://localhost:8000/recipes/user", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `${res.status}`);
        }
        return res.json();
      })
      .then(setRecipes)
      .catch(err => setError(err.message));
  }, [token]);

  // Delete handler
  const handleDelete = (id) => {
    fetch(`http://localhost:8000/recipes/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 204) {
          setRecipes(prev => prev.filter(r => r.id !== id));
        } else {
          throw new Error(`Delete failed: ${res.status}`);
        }
      })
      .catch(err => setError(err.message));
  };

  // Start editing
  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      title:        r.title,
      ingredients:  r.ingredients,
      instructions: r.instructions,
      calories:     r.calories,
      protein:      r.protein,
      carbs:        r.carbs,
      fat:          r.fat
    });
    setError("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
    setError("");
  };

  // Save updates
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/recipes/user/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:   `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Status ${res.status}`);
      }
      const updated = await res.json();
      setRecipes(prev => prev.map(r => r.id === id ? updated : r));
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <p className="error-text">❌ {error}</p>;
  }

  return (
    <div className="recipes-container">
      <h2>📋 My Recipes</h2>
      {recipes.length === 0 ? (
        <p className="no-recipes">No recipes saved yet.</p>
      ) : (
        <ul className="recipes-list">
          {recipes.map(r => (
            <li className="recipe-card" key={r.id}>
              <button
                className="delete-btn"
                onClick={() => handleDelete(r.id)}
                title="Delete this recipe"
              >
                🗑️
              </button>

              {editingId === r.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ingredients</label>
                    <textarea
                      name="ingredients"
                      value={form.ingredients}
                      onChange={e => setForm({ ...form, ingredients: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instructions</label>
                    <textarea
                      name="instructions"
                      value={form.instructions}
                      onChange={e => setForm({ ...form, instructions: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      name="calories"
                      type="number"
                      value={form.calories}
                      onChange={e => setForm({ ...form, calories: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein</label>
                    <input
                      name="protein"
                      type="number"
                      value={form.protein}
                      onChange={e => setForm({ ...form, protein: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs</label>
                    <input
                      name="carbs"
                      type="number"
                      value={form.carbs}
                      onChange={e => setForm({ ...form, carbs: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fat</label>
                    <input
                      name="fat"
                      type="number"
                      value={form.fat}
                      onChange={e => setForm({ ...form, fat: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="recipe-actions">
                    <button onClick={() => saveEdit(r.id)} className="button-small">
                      💾 Save
                    </button>
                    <button onClick={cancelEdit} className="button-small cancel">
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{r.title}</h3>
                  <p><strong>Ingredients:</strong> {r.ingredients}</p>
                  <p><strong>Instructions:</strong> {r.instructions}</p>
                  <p>
                    <strong>Nutrition:</strong> {`${r.calories} kcal, ${r.protein}g P, ${r.carbs}g C, ${r.fat}g F`}
                  </p>
                  <button onClick={() => startEdit(r)} className="button-small edit-btn">
                    ✏️ Edit
                  </button>
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
