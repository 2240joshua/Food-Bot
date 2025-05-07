import React, { useEffect, useState } from "react";
import './App.css';
import Login from "./Login";
import DashboardTabs from "./DashboardTabs";

function App() {
  const [user, setUser] = useState(null);

  // On load, check if token + user info exist
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      parsedUser = null;
    }
    
    if (token && parsedUser) {
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div className="container">
          <DashboardTabs user={user} onLogout={handleLogout} />
        </div>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
