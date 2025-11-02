import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/password-reset.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/forgot-password", {
        email
      });

      toast.success(res.data.message);
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      
      if (error.response?.status === 404) {
        toast.error("Email address not found in our system.");
      } else if (error.response?.status === 422) {
        toast.error("Please enter a valid email address.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.response?.data?.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-content">
        {/* Left Side - Form */}
        <div className="password-reset-form-side">
          <div className="password-reset-form-container">
            <div className="password-reset-header">
              <div className="password-reset-logo">
                <img src="/images/logo.jpg" alt="EventHub Logo" className="password-reset-logo-img" />
                <h1 className="password-reset-app-name">DAGOHOY EVENTHUB</h1>
              </div>
              <h2 className="password-reset-title">Reset Your Password</h2>
              <p className="password-reset-subtitle">We'll help you get back into your account</p>
            </div>
            
            {!emailSent ? (
              <form className="password-reset-form" onSubmit={handleForgotPassword}>
                <p className="password-reset-instructions">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
                
                <input
                  className="password-reset-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                
                <button 
                  className="password-reset-btn" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="password-loading-spinner"></div>
                      Sending Code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            ) : (
              <div className="password-success-message">
                <div className="password-success-icon">✓</div>
                <h3 className="password-success-title">Check Your Email</h3>
                <p className="password-success-text">
                  We've sent a password reset code to:
                </p>
                <div className="password-success-email">{email}</div>
                <p className="password-success-text">
                  Please check your inbox and use the code to reset your password.
                </p>
                
                <div style={{ margin: '25px 0' }}>
                  <Link 
                    to={`/reset-password?email=${encodeURIComponent(email)}`} 
                    className="password-reset-btn"
                    style={{ display: 'inline-block', textDecoration: 'none' }}
                  >
                    Go to Reset Password
                  </Link>
                </div>
                
                <Link to="/" className="password-reset-link">
                  Back to Login
                </Link>
              </div>
            )}
            
            <p className="password-reset-text">
              Remember your password? <Link className="password-reset-link" to="/">Login here</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Video */}
        <div className="password-reset-hero-side">
          <div className="password-reset-video-container">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="password-reset-video"
            >
              <source src="/images/videos.webm" type="video/webm" />
            </video>
            <div className="password-reset-video-overlay"></div>
            <div className="password-reset-hero-content">
              <h3 className="password-reset-hero-title">Dagohoy EventHub: Your Community Connection</h3>
              <p className="password-reset-hero-subtitle">Experience the heartbeat of Dagohoy through our centralized<br/>
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