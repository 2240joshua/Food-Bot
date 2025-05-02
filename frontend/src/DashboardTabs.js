import React, { useState } from "react";
import MealSearch from "./MealSearch";
import UploadMeal from "./UploadMeal";
import MyUploads from "./MyUploads";
import UserProfile from "./UserProfile";
import MealPlanner from "./MealPlanner";

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
        return (
          <MealSearch
            onAddMeal={(meal) => addMeal(meal)}
          />
        );

      case "upload":
        return <UploadMeal />;

      case "uploads":
        return (
          <MyUploads
            onAddMeal={(meal) => addMeal(meal)}
          />
        );

      case "planner":
        return (
          <MealPlanner
            plannedMeals={plannedMeals}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        );

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
        <button onClick={onLogout}>🚪 Logout</button>
      </nav>

      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default DashboardTabs;
