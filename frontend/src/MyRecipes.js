import React, { useEffect, useState } from "react";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
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
  }, []);

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
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

  if (error) return <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>;

  return (
    <div className="recipes-container">
      <h2>📋 My Recipes</h2>
      {recipes.length === 0
        ? <p style={{ textAlign: "center" }}>No recipes saved yet.</p>
        : (
          <ul className="recipes-list">
            {recipes.map(r => (
              <li className="recipe-card" key={r.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleDelete(r.id)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'transparent', border: 'none',
                    fontSize: '1.2rem', cursor: 'pointer', color: '#c00'
                  }}
                  title="Delete this recipe"
                >🗑️</button>

                <h3>{r.title}</h3>
                <p><strong>Ingredients:</strong> {r.ingredients.split(",").length}</p>
                <p>
                  <strong>Instructions:</strong>{" "}
                  {r.instructions.split(".").filter(s => s.trim()).length} steps
                </p>
                <p>
                  <strong>Nutrition:</strong>{" "}
                  {`${r.calories} kcal, ${r.protein}g P, ${r.carbs}g C, ${r.fat}g F`}
                </p>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}

export default MyRecipes;
