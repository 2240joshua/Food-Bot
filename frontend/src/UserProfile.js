import React, { useEffect, useState } from "react";
import "./App.css";  // or a dedicated Profile.css if you prefer

function UserProfile({ user: initialUser }) {
  const [user, setUser]   = useState(initialUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialUser) return;  // already passed in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setUser(data);
        else       setError(data.detail || "Failed to fetch user");
      } catch {
        setError("❌ Network error while fetching user");
      }
    })();
  }, [initialUser]);

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!user) return <p style={{ textAlign: "center" }}>Loading profile...</p>;

  return (
    <div className="profile-card">
      <h1>👤 User Profile</h1>
      <div className="profile-field">
        <label>Name:</label><span>{user.name}</span>
      </div>
      <div className="profile-field">
        <label>Email:</label><span>{user.email}</span>
      </div>
      <div className="profile-field">
        <label>Dietary Preferences:</label>
        <span>{user.dietary_preferences || "None"}</span>
      </div>
    </div>
  );
}

export default UserProfile;
function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>

      <h4>Ingredients:</h4>
      <ul>
        {recipe.ingredients.map((ing, idx) => (
          <li key={idx}>
            {/* Pick whichever fields you want to display */}
            {ing.name} — {ing.amount} {ing.unit}
          </li>
        ))}
      </ul>

      <h4>Instructions:</h4>
      <p>{recipe.instructions}</p>
    </div>
  );
}
