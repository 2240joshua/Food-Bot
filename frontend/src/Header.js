import React from "react";
import "./Header.css";  // optional if you want to style later

function Header({ onLogout }) {
  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li><a href="#profile">Profile</a></li>
          <li><a href="#planner">Meal Planner</a></li>
          <li><a href="#tracker">Nutrition Tracker</a></li>
          <li><a href="#recommendations">Recommendations</a></li>
          <li><button onClick={onLogout} className="logout-button">Logout</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
