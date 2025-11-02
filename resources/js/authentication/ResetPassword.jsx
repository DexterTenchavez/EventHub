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
        toast.error(error.response.data.message || "Invalid reset code or code has expired");
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
        <div className="password-reset-content">
          <div className="password-reset-form-side">
            <div className="password-reset-form-container">
              <div className="password-reset-header">
                <div className="password-reset-logo">
                  <img src="/images/logo.jpg" alt="EventHub Logo" className="password-reset-logo-img" />
                  <h1 className="password-reset-app-name">DAGOHOY EVENTHUB</h1>
                </div>
                <h2 className="password-reset-title">Reset Password</h2>
              </div>
              <div className="password-error-message">
                <h3 className="password-error-title">Reset Required</h3>
                <p className="password-reset-instructions">
                  Please request a password reset code first.
                </p>
                <Link to="/forgot-password" className="password-reset-btn" style={{display: 'inline-block', marginTop: '20px', textDecoration: 'none'}}>
                  Request Reset Code
                </Link>
              </div>
            </div>
          </div>
          <div className="password-reset-hero-side">
            <div className="password-reset-video-container">
              <video autoPlay muted loop playsInline className="password-reset-video">
                <source src="/images/videos.webm" type="video/webm" />
              </video>
              <div className="password-reset-hero-content">
                <h3 className="password-reset-hero-title">Dagohoy EventHub: Your Community Connection</h3>
                <p className="password-reset-hero-subtitle">Experience the heartbeat of Dagohoy through our centralized event platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-content">
          <div className="password-reset-form-side">
            <div className="password-reset-form-container">
              <div className="password-reset-header">
                <div className="password-reset-logo">
                  <img src="/images/logo.jpg" alt="EventHub Logo" className="password-reset-logo-img" />
                  <h1 className="password-reset-app-name">DAGOHOY EVENTHUB</h1>
                </div>
                <h2 className="password-reset-title">Password Reset</h2>
              </div>
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
          </div>
          <div className="password-reset-hero-side">
            <div className="password-reset-video-container">
              <video autoPlay muted loop playsInline className="password-reset-video">
                <source src="/images/videos.webm" type="video/webm" />
              </video>
              <div className="password-reset-hero-content">
                <h3 className="password-reset-hero-title">Dagohoy EventHub: Your Community Connection</h3>
                <p className="password-reset-hero-subtitle">Experience the heartbeat of Dagohoy through our centralized event platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="password-reset-subtitle">Create your new password</p>
            </div>
            
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
                onChange={(e) => setResetToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                maxLength="6"
                pattern="[0-9]{6}"
                inputMode="numeric"
              />
              
              <input
                className="password-reset-input"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
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