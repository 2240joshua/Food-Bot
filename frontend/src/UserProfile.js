import React, { useEffect, useState } from "react";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data);
        } else {
          setError(data.detail || "Failed to fetch user");
        }
      } catch (err) {
        setError("❌ Network error while fetching user");
      }
    };

    fetchUser();
  }, []);

  if (error) return <p>❌ {error}</p>;
  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="container">
      <h2>👤 User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Dietary Preferences:</strong> {user.dietary_preferences || "None"}</p>
    </div>
  );
}

export default UserProfile;
