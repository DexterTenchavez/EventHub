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
    <div className="password-reset-container">
      <h1 className="password-reset-title">DAGOHOY EVENTHUB</h1>
      <p className="password-reset-subtitle">Reset Your Password</p>
      
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
  );
}