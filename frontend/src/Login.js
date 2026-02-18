import React, { useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE || "https://foodbot-backend.onrender.com";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);

      const profileRes = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const profile = await profileRes.json();

      if (profileRes.ok) {
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
      } else {
        setMessage(
          typeof profile.detail === "string"
            ? profile.detail
            : JSON.stringify(profile.detail)
        );
      }
    } else {
      setMessage(
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail)
      );
    }
  };

  // ---------- REGISTER ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${API_BASE}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: email, // later you can add a real name input
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
      setMessage(
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail)
      );
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
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
            >
              Login
            </button>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
            >
              Register
            </button>
          </span>
        )}
      </p>
    </div>
  );
}

export default Login;
