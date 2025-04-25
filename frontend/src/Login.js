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
        localStorage.setItem("token", data.access_token); // ✅ Save token

        // Now fetch the user's profile with the token
        const profileRes = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`
          }
        });

        const profile = await profileRes.json();

        if (profileRes.ok) {
          setUser(profile); // ✅ Store the actual user info in App
          setMessage("✅ Logged in");
        } else {
          setMessage(`❌ Failed to get profile: ${profile.detail}`);
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
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="button" type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
