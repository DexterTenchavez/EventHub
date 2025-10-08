import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./authentication/SignUp";
import React from "react";
import Login from "./authentication/Login";
import Admindashboard from "./admin/Admindashboard";
import Userdashboard from "./user/Userdashboard";
import Pastevents from "./user/Pastevents";
import Upcomingevents from "./user/Upcomingevents";
import Profile from "./user/Profile";

export default function App() {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/admin-dashboard"
          element={
            currentUser ? (
              currentUser.role === "admin" ? (
                <Admindashboard
                  events={events}
                  setEvents={setEvents}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <div>Loading...</div>
            )
          }
        />

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
                <Navigate to="/" />
              )
            ) : (
              <div>Loading...</div>
            )
          }
        />

        <Route path="/past-events" element={<Pastevents />} />
        <Route path="/upcoming-events" element={<Upcomingevents />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
