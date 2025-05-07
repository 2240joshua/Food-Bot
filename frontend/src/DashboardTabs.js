import React, { useState, useEffect } from "react";
import MealSearch     from "./MealSearch";
import UserProfile    from "./UserProfile";
import MealPlanner    from "./MealPlanner";
import AddRecipe      from "./AddRecipe";
import MyRecipes      from "./MyRecipes";
import ExploreRecipes from "./ExploreRecipes";
import "./App.css";

function DashboardTabs({ user, onLogout }) {
  const [activeTab, setActiveTab]       = useState("profile");
  const [selectedDay, setSelectedDay]   = useState("Monday");
  const [plannedMeals, setPlannedMeals] = useState({});

  // 1️⃣ Load your saved plan once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/planner/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setPlannedMeals(data.plans))
      .catch(console.error);
  }, []);

  // 2️⃣ Add a meal both locally & on the server
  const addMeal = (meal) => {
    const updated = {
      ...plannedMeals,
      [selectedDay]: [...(plannedMeals[selectedDay] || []), meal]
    };
    setPlannedMeals(updated);

    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/planner/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ plans: updated })
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setPlannedMeals(data.plans))
      .catch(console.error);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":    return <UserProfile user={user} />;
      case "search":     return <MealSearch onAddMeal={addMeal} />;
      case "planner":    return (
                            <MealPlanner
                              plannedMeals={plannedMeals}
                              setPlannedMeals={setPlannedMeals}
                              selectedDay={selectedDay}
                              setSelectedDay={setSelectedDay}
                            />
                          );
      case "add_recipe": return <AddRecipe />;
      case "my_recipes": return <MyRecipes />;
      case "explore":    return <ExploreRecipes />;
      default:           return null;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="tab-nav">
        {[
          ["profile","👤 Profile"],
          ["search","🔍 Meal Search"],
          ["planner","📅 Planner"],
          ["add_recipe","➕ Add Recipe"],
          ["my_recipes","📋 My Recipes"],
          ["explore","🌎 Explore"]
        ].map(([key,label]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
        <button onClick={onLogout}>🚪 Logout</button>
      </nav>

      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default DashboardTabs;
