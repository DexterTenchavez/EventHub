import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "./authentication-css/Signup.css"

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
    barangay: barangays[0],
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
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/register", formData);
      
      // SweetAlert2 Success
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
        console.error("Server error:", error.response.data);
        
        // Handle different error types
        if (error.response.data.errors) {
          // Laravel validation errors
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors)[0][0]; // Get first error message
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error("No response:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error("Error:", error.message);
        errorMessage = "Error: " + error.message;
      }
      
      // SweetAlert2 Error
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
    <div className="sign-up">
      <div className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        <form className="signup-form" onSubmit={handleRegister}>
          <input
            className="signup-input"
            type="text"
            placeholder="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange} 
            required
            disabled={loading}
          />
          <input
            className="signup-input"
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}  
            required
            disabled={loading}
          />
          <input
            className="signup-input"
            type="text"
            placeholder="Contact Number"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <select className="signup-select" name="sex" value={formData.sex} onChange={handleChange} required disabled={loading}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
         
          <input
            className="signup-input"
            type="text"
            placeholder="Birthdate (MM/DD/YYYY)"
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
         <select className="signup-select" name="barangay" value={formData.barangay} onChange={handleChange} required disabled={loading}>
            <option value="" disabled>Select Barangay</option>
            {barangays.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>
          <select className="signup-select" name="purok" value={formData.purok} onChange={handleChange} required disabled={loading}>
            {puroks.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
          <input
            className="signup-input"
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          {/* Password input with eye icon */}
          <div className="password-input-container">
            <input
              className="signup-input password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
          
          <button className="signup-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
      <p className="signup-login-text">
        Already have an account? <Link className="signup-login-link" to="/">Login</Link> here
      </p>
    </div>
  );
}