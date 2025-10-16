import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./authentication/SignUp";
import React from "react";
import Login from "./authentication/Login";
import Admindashboard from "./admin/Admindashboard";
import Userspenalties from "./admin/Userspenalties";
import Userdashboard from "./user/Userdashboard";
import Pastevents from "./user/Pastevents";
import Upcomingevents from "./user/Upcomingevents";
import Profile from "./user/Profile";

export default function App() {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    console.log("Stored user from localStorage:", storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  if (loading) {
    return <div className="loading">Loading application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            currentUser ? (
              currentUser.role === "admin" ? (
                <Admindashboard
                  events={events}
                  setEvents={setEvents}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route 
          path="/users-penalties" 
          element={
            currentUser ? (
              currentUser.role === "admin" ? (
                <Userspenalties 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* User Routes */}
        <Route
          path="/user-dashboard"
          element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Userdashboard
                  events={events}
                  setEvents={setEvents}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route 
          path="/past-events" 
          element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Pastevents currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/upcoming-events" 
          element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Upcomingevents currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/profile" 
          element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Profile currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        // In App.js, temporarily add this route for testing:
<Route 
  path="/test-penalties" 
  element={
    <div>
      <h1>Test Page - Users Penalties</h1>
      <p>If you can see this, routing is working.</p>
      <button onClick={() => window.history.back()}>Go Back</button>
    </div>
  } 
/>
      </Routes>
    </Router>
  );
}