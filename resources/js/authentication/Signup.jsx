import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaVenusMars, FaCalendar, FaMapMarker, FaHome, FaLock } from 'react-icons/fa';
import "./authentication-css/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const barangays = [
    "Anibongan", "Babag", "Cagawasan", "Cagawitan", "Caluasan",
    "Candelaria", "Can-oling", "Estaca", "La Esperanza", "Liberty",
    "Magcagong", "Malibago", "Mampas", "Napo", "Poblacion",
    "San Isidro", "San Jose", "San Miguel", "San Roque", "San Vicente",
    "Santo Rosario", "Santa Cruz", "Santa Fe", "Santa Lucia", "Santa Rosa",
    "Santo Niño", "Santo Tomas", "Santo Niño de Panglao", "Taytay", "Tigbao"
  ];

  const puroks = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    sex: "Male",
    dob: "",
    barangay: "",
    purok: puroks[0],
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (!formData.name || !formData.email || !formData.contactNo || !formData.dob || !formData.barangay || !formData.username || !formData.password) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7',
        background: '#FFF3E0',
        color: '#E65100',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/register", formData);
      
      Swal.fire({
        title: '🎉 Registration Successful!',
        text: 'Please login to continue.',
        icon: 'success',
        confirmButtonColor: '#4FC3F7',
        background: '#E3F2FD',
        color: '#01579B',
        confirmButtonText: 'Go to Login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/");
        }
      });
      
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response) {
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors)[0][0];
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = "Error: " + error.message;
      }
      
      Swal.fire({
        title: 'Registration Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE',
        color: '#C62828',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        {/* Left Side - Video */}
        <div className="signup-hero-side">
          <div className="signup-video-container">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="signup-video"
            >
              <source src="/images/videos.webm" type="video/webm" />
            </video>
            <div className="signup-video-overlay"></div>
            <div className="signup-hero-content">
              <h3 className="signup-hero-title">Start Your Event Journey in Dagohoy</h3>
              <p className="signup-hero-subtitle">Sign up now to unlock access to hundreds of local events, activities, and community gatherings across all 31 barangays. Whether you're interested in sports tournaments, educational seminars, medical missions, or cultural celebrations, your perfect community experience awaits.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="signup-form-side">
          <div className="signup-form-container">
            <div className="signup-header">
              <div className="signup-logo">
                <img src="/images/logo.jpg" alt="EventHub Logo" className="signup-logo-img" />
                <h1 className="signup-app-name">DAGOHOY EVENTHUB</h1>
              </div>
              <h2 className="signup-title">Create Account</h2>
              <p className="signup-subtitle">Sign up to join our community</p>
            </div>

            <form className="signup-form" onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter contact number"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <div className="input-with-icon">
                    <FaVenusMars className="input-icon" />
                    <select 
                      className="form-input"
                      name="sex" 
                      value={formData.sex} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Birthdate</label>
                  <div className="input-with-icon">
                    <FaCalendar className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/DD/YYYY"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      onFocus={(e) => {
                        e.target.type = 'date';
                        e.target.showPicker?.();
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.type = 'text';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Barangay</label>
                  <div className="input-with-icon">
                    <FaMapMarker className="input-icon" />
                    <select 
                      className="form-input"
                      name="barangay" 
                      value={formData.barangay} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="" disabled>Select Barangay</option>
                      {barangays.map((b, idx) => (
                        <option key={idx} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purok</label>
                  <div className="input-with-icon">
                    <FaHome className="input-icon" />
                    <select 
                      className="form-input"
                      name="purok" 
                      value={formData.purok} 
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      {puroks.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Choose a username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Create a password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <button className="signup-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="signup-loading-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="signup-footer">
              <p className="signup-text">
                Already have an account?{" "}
                <Link to="/" className="signup-link">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}