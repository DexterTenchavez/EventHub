import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./authentication-css/password-reset.css";

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
      <div className="password-reset-container">
        <h1 className="password-reset-title">DAGOHOY EVENTHUB</h1>
        <div className="password-error-message">
          <h3 className="password-error-title">Reset Password</h3>
          <p className="password-reset-instructions">
            Please request a password reset code first.
          </p>
          <Link to="/forgot-password" className="password-reset-link">
            Request Reset Code
          </Link>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="password-reset-container">
        <h1 className="password-reset-title">DAGOHOY EVENTHUB</h1>
        <div className="password-success-message">
          <div className="password-success-icon">✓</div>
          <h3 className="password-success-title">Password Reset Successful</h3>
          <p className="password-success-text">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <div style={{ marginTop: '25px' }}>
            <Link to="/" className="password-reset-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <h1 className="password-reset-title">DAGOHOY EVENTHUB</h1>
      <p className="password-reset-subtitle">Reset Your Password</p>
      
      <form className="password-reset-form" onSubmit={handleResetPassword}>
        <p className="password-reset-instructions">
          Enter the reset code from your email and your new password for:
        </p>
        <div className="password-success-email" style={{ marginBottom: '20px' }}>
          {email}
        </div>
        
        <input
          className="password-reset-input"
          type="text"
          placeholder="Enter 6-digit reset code"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          required
          disabled={loading}
          maxLength="6"
        />
        
        <input
          className="password-reset-input"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
          disabled={loading}
        />
        
        <input
          className="password-reset-input"
          type="password"
          placeholder="Confirm new password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          minLength="6"
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
      
      <p className="password-reset-text">
        Remember your password? <Link className="password-reset-link" to="/">Login here</Link>
      </p>
      
      <p className="password-reset-text">
        Need a new reset code? <Link className="password-reset-link" to="/forgot-password">Request New Code</Link>
      </p>
    </div>
  );
}