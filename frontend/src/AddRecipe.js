import React, { useState } from "react";

function AddRecipe() {
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    is_public: false,
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!token || !userId) {
      setMessage("❌ User not logged in");
      return;
    }

    const res = await fetch(`http://localhost:8000/recipes/?user_id=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        calories: parseFloat(form.calories),
        protein: parseFloat(form.protein),
        carbs: parseFloat(form.carbs),
        fat: parseFloat(form.fat),
      }),
    });

    if (res.ok) {
      setMessage("✅ Recipe added!");
      setForm({
        title: "",
        ingredients: "",
        instructions: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        is_public: false,
      });
    } else {
      setMessage("❌ Failed to add recipe");
    }
  };

  return (
    <div className="container">
      <h2>📤 Add Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /><br />
        <textarea placeholder="Ingredients (comma separated)" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })}></textarea><br />
        <textarea placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}></textarea><br />
        <input placeholder="Calories" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} /><br />
        <input placeholder="Protein" type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} /><br />
        <input placeholder="Carbs" type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} /><br />
        <input placeholder="Fat" type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} /><br />
        <label><input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} /> Public</label><br />
        <button className="button">Add Recipe</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default AddRecipe;
