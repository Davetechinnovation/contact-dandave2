import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CoolAlert from "./CoolAlert"; // Custom alert component
import "../styles/login.css";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true); // Toggle between login & signup
  const [username, setUsername] = useState(""); // Username
  const [email, setEmail] = useState(""); // Email
  const [password, setPassword] = useState(""); // Password
  const [identifier, setIdentifier] = useState(""); // Accepts either email or username for login
  const [error, setError] = useState(""); // Error messages
  const [alertMessage, setAlertMessage] = useState(""); // Success messages
  const [showAlert, setShowAlert] = useState(false); // Alert visibility
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // For navigation

  const Loader = () => (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Processing...</p>
    </div>
  );


  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const response = await fetch("https://contact-dandave.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
  
      setAlertMessage(`🎉 Account for ${username} created successfully! Please log in.`);
      setShowAlert(true);
  
      // Clear fields
      setUsername("");
      setEmail("");
      setPassword("");
  
      setTimeout(() => setShowLogin(true), 2800);
    } catch (err) {
      console.error("Signup Error:", err.message);
      setError(err.message);
      setTimeout(() => setError(""), 2800);
    } finally {
      setLoading(false);
    }
  };

  

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://contact-dandave.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to log user in please try again after few minutes`);

      localStorage.setItem("token", data.token);

      setAlertMessage(`🎉 ${data.username} logged in successfully!`);
      setShowAlert(true);

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {loading && <Loader />}
      {showAlert && <CoolAlert message={alertMessage} onClose={() => setShowAlert(false)} />}

      {/* Login Form */}
      {showLogin ? (
        <div className="loginform">
          <div className="toggle-buttons">
            <button onClick={() => setShowLogin(true)} className={showLogin ? "active" : ""}>
              Login
            </button>
            <button onClick={() => setShowLogin(false)} className={!showLogin ? "active" : ""}>
              Sign Up
            </button>
          </div>

          <h2>Log in</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        // Signup Form
        <div className="signupform">
          <div className="toggle-buttons">
            <button onClick={() => setShowLogin(true)} className={showLogin ? "active" : ""}>
              Login
            </button>
            <button onClick={() => setShowLogin(false)} className={!showLogin ? "active" : ""}>
              Sign Up
            </button>
          </div>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Username (required)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Auth;
