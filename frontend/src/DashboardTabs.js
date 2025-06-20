import React, { useState, useEffect } from "react";

import MealPlanner    from "./MealPlanner";
import AddRecipe      from "./AddRecipe";
import MyRecipes      from "./MyRecipes";
import ExploreRecipes from "./ExploreRecipes";
import UserProfile    from "./UserProfile";
import "./App.css";
const API_BASE = process.env.REACT_APP_API_BASE;
function DashboardTabs({ user, onLogout }) {
  const [activeTab, setActiveTab]       = useState("profile");
  const [selectedDay, setSelectedDay]   = useState("Monday");
  const [plannedMeals, setPlannedMeals] = useState({});

  // Load saved planner on mount and hydrate full recipe objects
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function loadPlanner() {
      try {
        const plannerRes = await fetch(`${API_BASE}/planner/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!plannerRes.ok) throw new Error(`Planner load failed: ${plannerRes.status}`);
        const { plans: idMap } = await plannerRes.json();

        const recipesRes = await fetch(`${API_BASE}/recipes/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!recipesRes.ok) throw new Error(`Recipes load failed: ${recipesRes.status}`);
        const allRecipes = await recipesRes.json();

        const fullMap = {};
        for (const [day, ids] of Object.entries(idMap)) {
          fullMap[day] = ids
            .map(id => allRecipes.find(r => r.id === id))
            .filter(Boolean);
        }
        setPlannedMeals(fullMap);
      } catch (err) {
        console.error(err);
      }
    }

    loadPlanner();
  }, []);

  // Adds a meal: update UI state with full objects, then POST only IDs
  const addMeal = (meal) => {
    const updatedFull = {
      ...plannedMeals,
      [selectedDay]: [...(plannedMeals[selectedDay] || []), meal]
    };
    setPlannedMeals(updatedFull);

    // build id-only map for backend
    const idMap = Object.fromEntries(
      Object.entries(updatedFull).map(([day, meals]) => [
        day,
        meals.map(m => m.id)
      ])
    );

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/planner/`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ plans: idMap })
    })
    .then(res => {
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      return res.json();
    })
    .then(({ plans }) => {
      console.log("Planner saved IDs:", plans);
      // UI already shows full meals, no need to rehydrate here
    })
    .catch(console.error);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile user={user} />;
      case "planner":
        return (
          <MealPlanner
            plannedMeals={plannedMeals}
            setPlannedMeals={setPlannedMeals}
            addMeal={addMeal}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        );
      case "add_recipe":
        return <AddRecipe />;
      case "my_recipes":
        return <MyRecipes />;
      case "explore":
        return <ExploreRecipes />;
      default:
        return null;
    }
  };

  const tabs = [
    ["profile",    "👤 Profile"],
    ["planner",    "📅 Planner"],
    ["add_recipe", "➕ Add Recipe"],
    ["my_recipes", "📋 My Recipes"],
    ["explore",    "🌎 Explore"]
  ];

  return (
    <div className="dashboard-container">
      <nav className="tab-nav">
        {tabs.map(([key, label]) => (
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
      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}

export default DashboardTabs;
