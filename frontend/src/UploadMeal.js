import React, { useState } from "react";

function UploadMeal() {
  const [mealData, setMealData] = useState({
    title: "",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/meals/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: mealData.title,
          instructions: mealData.description, // ✅ fixed this!
          calories: parseFloat(mealData.calories),
          protein: parseFloat(mealData.protein),
          carbs: parseFloat(mealData.carbs),
          fat: parseFloat(mealData.fat),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Meal posted!");
        setMealData({ title: "", description: "", calories: "", protein: "", carbs: "", fat: "" });
      } else {
        setMessage(`❌ ${data.detail || "Failed to post meal"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="container">
      <h2>📤 Upload a Meal</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Meal Title" value={mealData.title} onChange={handleChange} required className="input-field" /><br />
        <textarea name="description" placeholder="Instructions" value={mealData.description} onChange={handleChange} className="input-field" /><br />
        <input name="calories" type="number" placeholder="Calories" value={mealData.calories} onChange={handleChange} className="input-field" /><br />
        <input name="protein" type="number" placeholder="Protein (g)" value={mealData.protein} onChange={handleChange} className="input-field" /><br />
        <input name="carbs" type="number" placeholder="Carbs (g)" value={mealData.carbs} onChange={handleChange} className="input-field" /><br />
        <input name="fat" type="number" placeholder="Fat (g)" value={mealData.fat} onChange={handleChange} className="input-field" /><br />
        <button type="submit" className="button">Post Meal</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default UploadMeal;
