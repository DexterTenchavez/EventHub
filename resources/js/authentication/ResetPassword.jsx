import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const email = searchParams.get('email');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!resetToken) {
      toast.error("Please enter the reset code from your email");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/reset-password", {
        token: resetToken,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      toast.success(res.data.message);
      setResetSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid reset code or user not found");
      } else if (error.response?.status === 422) {
        toast.error("Please check your input and try again.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="login-container">
        <h1 className="login-title">DAGOHOY EVENTHUB</h1>
        <div className="error-message">
          <h3>Reset Password</h3>
          <p>Please enter your email and the reset code from your email.</p>
          <div style={{marginTop: '20px'}}>
            <input
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Link to="/forgot-password" className="login-link">
            Request New Reset Code
          </Link>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="login-container">
        <h1 className="login-title">DAGOHOY EVENTHUB</h1>
        <div className="email-sent-message">
          <div className="success-icon">✓</div>
          <h3>Password Reset Successful</h3>
          <p>Your password has been reset successfully.</p>
          <Link to="/login" className="login-link">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1 className="login-title">DAGOHOY EVENTHUB</h1>
      <p className="login-txt">Reset Your Password</p>
      
      <form className="login-form" onSubmit={handleResetPassword}>
        <p className="forgot-password-instructions">
          Enter the reset code from your email and your new password for <strong>{email}</strong>
        </p>
        
        <input
          className="login-input"
          type="text"
          placeholder="Enter reset code from email"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          required
          disabled={loading}
        />
        
        <input
          className="login-input"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="5"
          disabled={loading}
        />
        
        <input
          className="login-input"
          type="password"
          placeholder="Confirm New Password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          minLength="5"
          disabled={loading}
        />
        
        <button 
          className="login-btn" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      
      <p className="login-text">
        Remember your password? <Link className="login-link" to="/">Login</Link> here
      </p>
      
      <p className="login-text">
        Need a new reset code? <Link className="login-link" to="/forgot-password">Request New Code</Link>
      </p>
    </div>
  );
}