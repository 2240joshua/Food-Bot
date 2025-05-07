import React, { useState } from "react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      const profileRes = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const profile = await profileRes.json();
      if (profileRes.ok) {
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
      }
    } else {
      setMessage(data.detail || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/users/", {
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
