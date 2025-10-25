import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/login.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear any existing auth data before login
  const clearExistingAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("Token");
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("currentUser");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      // Clear any existing tokens first
      clearExistingAuth();

      const res = await axios.post("http://localhost:8000/api/login", { 
        email, 
        password 
      });

      // ✅ Save token consistently as "token"
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      
      setCurrentUser(res.data.user);

      // Use toast instead of alert for better UX
      toast.success(res.data.message);

      // Navigate based on role
      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Login failed. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        
        {/* Password input with eye icon */}
        <div className="password-input-container">
          <input
            className="login-input password-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            disabled={loading}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="forgot-password-container">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div>
        
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