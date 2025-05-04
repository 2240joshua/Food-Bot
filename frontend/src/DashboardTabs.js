import React, { useState } from "react";
import MealSearch from "./MealSearch";
import UploadMeal from "./UploadMeal";
import MyUploads from "./MyUploads";
import UserProfile from "./UserProfile";
import MealPlanner from "./MealPlanner";
import AddRecipe from "./AddRecipe";
import MyRecipes from "./MyRecipes";
import ExploreRecipes from "./ExploreRecipes";

function DashboardTabs({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [plannedMeals, setPlannedMeals] = useState({});

  const addMeal = (meal) => {
    setPlannedMeals((prev) => {
      const dayMeals = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: [...dayMeals, meal],
      };
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile user={user} />;
      case "search":
        return <MealSearch onAddMeal={addMeal} />;
      case "upload":
        return <UploadMeal />;
      case "uploads":
        return <MyUploads onAddMeal={addMeal} />;
      case "planner":
        return (
          <MealPlanner
            plannedMeals={plannedMeals}
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

  return (
    <div>
      <nav className="tab-nav">
        <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>👤 Profile</button>
        <button className={activeTab === "search" ? "active" : ""} onClick={() => setActiveTab("search")}>🔍 Meal Search</button>
        <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>📤 Upload Meal</button>
        <button className={activeTab === "uploads" ? "active" : ""} onClick={() => setActiveTab("uploads")}>📦 My Uploads</button>
        <button className={activeTab === "planner" ? "active" : ""} onClick={() => setActiveTab("planner")}>📅 Planner</button>
        <button className={activeTab === "add_recipe" ? "active" : ""} onClick={() => setActiveTab("add_recipe")}>➕ Add Recipe</button>
        <button className={activeTab === "my_recipes" ? "active" : ""} onClick={() => setActiveTab("my_recipes")}>📋 My Recipes</button>
        <button className={activeTab === "explore" ? "active" : ""} onClick={() => setActiveTab("explore")}>🌎 Explore</button>
        <button onClick={onLogout}>🚪 Logout</button>
      </nav>

      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default DashboardTabs;
