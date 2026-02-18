import React, { useState } from "react";
const API_BASE =
  process.env.REACT_APP_API_BASE || "https://foodbot-backend.onrender.com";
function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: email,
        email,
        password,
        dietary_preferences: "none",
      }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      setMessage("✅ Registered! Now login.");
      setIsRegistering(false);
    } else {
      setMessage(data.detail || "Registration failed");
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Registered! Now login.");
      setIsRegistering(false);
    } else {
      setMessage(data.detail || "Registration failed");
    }
  };

  return (
    <div className="container">
      <h1>{isRegistering ? "Register" : "Login"}</h1>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="button" type="submit">
          {isRegistering ? "Create Account" : "Login"}
        </button>
      </form>
      <p>{message}</p>

      <p>
        {isRegistering ? (
          <span>
            Already have an account?{" "}
            <button onClick={() => setIsRegistering(false)}>Login</button>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <button onClick={() => setIsRegistering(true)}>Register</button>
          </span>
        )}
      </p>
    </div>
  );
}

export default Login;
