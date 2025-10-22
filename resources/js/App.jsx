import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./authentication/SignUp";
import React from "react";
import Login from "./authentication/Login";

import Admindashboard from "./admin/Admindashboard";
import Userspenalties from "./admin/Userspenalties";

import Userdashboard from "./user/Userdashboard";
import EventsParticipate from "./user/EventsParticipate";
import Upcomingevents from "./user/Upcomingevents";
import Profile from "./user/Profile";
import Notifications from "./user/Notifications";
import Eventdetails from "./user/Eventdetails";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px 20px', margin: '10px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      <ErrorBoundary>
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
                  <EventsParticipate 
                    events={events} 
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

          <Route path="/notifications" element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Notifications currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } />

          <Route path="/upcoming-events" 
            element={
              currentUser ? (
                currentUser.role === "user" ? (
                  <Upcomingevents 
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

          <Route path="/events/:id" element={
            currentUser ? (
              currentUser.role === "user" ? (
                <Eventdetails currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}