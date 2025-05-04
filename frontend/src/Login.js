import React, { useState } from "react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);

        const profileRes = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`
          }
        });

        const profile = await profileRes.json();

        if (profileRes.ok) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile)); // ✅ STORE USER HERE
          setMessage("✅ Logged in");
        } else {
          setMessage(`❌ ${profile.detail}`);
        }
      } else {
        setMessage(`❌ ${data.detail}`);
      }
    } catch (err) {
      setMessage("❌ Login failed");
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
