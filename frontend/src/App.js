import React, { useEffect, useState } from "react";
import './App.css';
import Login from "./Login";
import UserProfile from "./UserProfile";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dietary_preferences: ""
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [user, setUser] = useState(null);

  // ✅ On first load, check if a token exists and auto-login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.id) {
            setUser(data);
          }
        })
        .catch(err => {
          console.error("Auto-login failed:", err);
        });
    }
  }, []);

  // ✅ Register new user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMessage(`✅ Registered: ${data.name}`);
      } else {
        setResponseMessage(`❌ Error: ${data.detail}`);
      }
    } catch (err) {
      setResponseMessage("❌ Network error");
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div className="container">
          <button onClick={handleLogout} className="button">Logout</button>
          <UserProfile user={user} />
        </div>
      ) : (
        <>
          <Login setUser={setUser} />
          <div className="container">
            <h1>User Registration</h1>
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="input-field"
              /><br />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="input-field"
              /><br />
              <input
                name="dietary_preferences"
                placeholder="Dietary Preferences"
                value={formData.dietary_preferences}
                onChange={(e) =>
                  setFormData({ ...formData, dietary_preferences: e.target.value })
                }
                className="input-field"
              /><br />
              <button type="submit" className="button">Register</button>
            </form>
            <p>{responseMessage}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
