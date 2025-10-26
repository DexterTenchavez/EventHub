import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/login.css";

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
      
      // Handle different error responses
      if (error.response?.status === 422) {
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
    <div className="login-container">
      <h1 className="login-title">DAGOHOY EVENTHUB</h1>
      <p className="login-txt">Reset Your Password</p>
      
      {!emailSent ? (
        <form className="login-form" onSubmit={handleForgotPassword}>
          <p className="forgot-password-instructions">
            Enter your email address and we'll send you a code to reset your password.
          </p>
          
          <input
            className="login-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <button 
            className="login-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      ) : (
        <div className="email-sent-message">
          <div className="success-icon">✓</div>
          <h3>Check Your Email</h3>
          <p>We've sent a password reset code to <strong>{email}</strong></p>
          <p>Please check your inbox and use the code to reset your password.</p>
          
          {/* ADDED: Direct link to reset password page */}
          <div style={{ margin: '20px 0' }}>
            <Link 
              to={`/reset-password?email=${encodeURIComponent(email)}`} 
              className="login-btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Go to Reset Password Page
            </Link>
          </div>
          
          <Link to="/" className="login-link">
            Back to Login
          </Link>
        </div>
      )}
      
      <p className="login-text">
        Remember your password? <Link className="login-link" to="/">Login</Link> here
      </p>
    </div>
  );
}