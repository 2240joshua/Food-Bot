import React, { useEffect, useState } from "react";
import './App.css';
import Login from "./Login";
import Header from "./Header";
import DashboardTabs from "./DashboardTabs";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (token) {
      fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.id) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          }
        });
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
        <>
          <Header onLogout={handleLogout} />
          <DashboardTabs user={user} onLogout={handleLogout} />
        </>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
