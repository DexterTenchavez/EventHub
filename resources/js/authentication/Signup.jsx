import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/register", formData);
      alert("Registration successful! Please login.");
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      navigate("/");
    }catch (error) {
  if (error.response) {

    console.error("Server error:", error.response.data);
    alert("Registration failed: " + JSON.stringify(error.response.data));
  } else if (error.request) {

    console.error("No response:", error.request);
    alert("No response from server. Check your API URL.");
  } else {
   
    console.error("Error:", error.message);
    alert("Error: " + error.message);
  }
}


  };
  return (
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
    />
    <input
      className="signup-input"
      type="email"
      placeholder="Email"
      name="email"
      value={formData.email}
      onChange={handleChange}  
      required
    />
    <input
      className="signup-input"
      type="text"
      placeholder="Contact Number"
      name="contactNo"
      value={formData.contactNo}
      onChange={handleChange}
      required
    />
    <select className="signup-select" name="sex" value={formData.sex} onChange={handleChange} required>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
    <input
      className="signup-input"
      type="date"
      name="dob"
      value={formData.dob}
      onChange={handleChange}
      required
    />
    <select className="signup-select" name="barangay" value={formData.barangay} onChange={handleChange} required>
      {barangays.map((b, idx) => (
        <option key={idx} value={b}>{b}</option>
      ))}
    </select>
    <select className="signup-select" name="purok" value={formData.purok} onChange={handleChange} required>
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
    />
    <input
      className="signup-input"
      type="password"
      placeholder="Password"
     name="password"
      value={formData.password}
      onChange={handleChange}
      required
    />
    <button className="signup-btn" type="submit">Register</button>
  </form>
  
  <p className="signup-login-text">
    Already have an account? <Link className="signup-login-link" to="/">Login</Link> here
  </p>
</div>

  );
}
