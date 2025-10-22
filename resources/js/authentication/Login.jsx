import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./authentication-css/login.css";

export default function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/login", { email, password });

      // ✅ FIX: Save both user data AND token
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      localStorage.setItem("auth_token", res.data.token); // Add this line!
      
      setCurrentUser(res.data.user); 

      alert(res.data.message);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/user-dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">DAGOHOY EVENTHUB</h1>
      <p className="login-txt">Login to your Account</p>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          className="login-btn" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="login-text">
        Don't have an account? <Link className="login-link" to="/signup">Sign Up</Link> here
      </p>
    </div>
  );
}