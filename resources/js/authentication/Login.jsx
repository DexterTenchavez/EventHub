import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/login.css";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      clearExistingAuth();

      const res = await axios.post("http://localhost:8000/api/login", { 
        email, 
        password 
      });

      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
      toast.success(res.data.message);

      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
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
    <div className="auth-container">
      <div className="auth-split-screen">
        {/* Left Side - Form */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <div className="logo">
                <img src="/images/logo.jpg" alt="EventHub Logo" className="logo-img" />
                <h1 className="app-name">DAGOHOY EVENTHUB</h1>
              </div>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your account to continue</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot your password?
                </Link>
              </div>

             <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
            </form>

            <div className="auth-footer">
              <p className="auth-text">
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link">Sign up here</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Video */}
        <div className="auth-hero-side">
          <div className="hero-video-container">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="hero-video"
            >
              <source src="/images/videos.webm" type="video/webm" />
            </video>
            <div className="video-overlay"></div>
         <div className="hero-content">
          <h3 className="hero-title">Dagohoy EventHub: Your Community Connection</h3>
          <p className="hero-subtitle">Experience the heartbeat of Dagohoy through our centralized<br/>
             event platform. <br/>
             Whether you're looking for medical missions, barangay assemblies, sports competitions, or cultural celebrations, 
             <br/>we bring all local activities to your fingertips. Join thousands of residents in staying connected, informed, and engaged with your community's vibrant social calendar.</p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}