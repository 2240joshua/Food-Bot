import React, { useState } from "react";

function UploadRecipe() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/recipes/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Recipe uploaded!");
      setForm({
        title: "",
        description: "",
        ingredients: "",
        instructions: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: ""
      });
    } else {
      setMessage("❌ Error uploading");
    }
  };

  return (
    <div className="container">
      <h2>📤 Upload Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /><br />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" /><br />
        <textarea placeholder="Ingredients" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input-field" /><br />
        <textarea placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="input-field" /><br />
        <input placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="input-field" /><br />
        <input placeholder="Protein" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="input-field" /><br />
        <input placeholder="Carbs" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="input-field" /><br />
        <input placeholder="Fat" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="input-field" /><br />
        <button className="button" type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default UploadRecipe;
