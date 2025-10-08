import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./authentication-css/login.css";

export default function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/login", { email, password });

      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      setCurrentUser(res.data.user); 

      alert(res.data.message);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/user-dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-btn" type="submit">Login</button>
      </form>
      <p className="login-text">
        Don't have an account? <Link className="login-link" to="/signup">Sign Up</Link> here
      </p>
    </div>
  );
}
