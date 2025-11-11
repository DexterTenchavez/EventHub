import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from "./authentication/SignUp";
import React from "react";
import Login from "./authentication/Login";
import ForgotPassword from './authentication/ForgotPassword';
import ResetPassword from './authentication/ResetPassword';

import Admindashboard from "./admin/Admindashboard";
import Userspenalties from "./admin/Userspenalties";
import Announcements from './admin/Announcements'; // Make sure this path is correct

import Userdashboard from "./user/Userdashboard";
import EventsParticipate from "./user/EventsParticipate";
import Upcomingevents from "./user/Upcomingevents";
import Profile from "./user/Profile";
import Notifications from "./user/Notifications";

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

// ==== UPDATED: Global Event Notification Checker ====
const useGlobalEventNotifications = (currentUser, location) => {
  useEffect(() => {
    // List of paths where notifications should NOT show
    const noNotificationPaths = [
      '/',
      '/signup', 
      '/forgot-password',
      '/reset-password',
      '/admin-dashboard',
      '/announcements', // Updated path
      '/users-penalties'
    ];

    // Check if current path should NOT show notifications
    const shouldNotNotify = noNotificationPaths.includes(location.pathname);
    
    // Only run if: user exists, user is regular user, and we're on a user page
    if (!currentUser || currentUser.role !== "user" || shouldNotNotify) {
      console.log('🔕 Notifications disabled for this page:', location.pathname);
      return;
    }

    console.log('🔔 Notifications ENABLED for user page:', location.pathname);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) return;

        console.log('🔔 Checking for upcoming events...');
        
        const eventsResponse = await fetch('http://localhost:8000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          const now = new Date();
          let foundEvents = false;

          for (const event of events) {
            // Check if user is registered for this event
            const isRegistered = event.registrations?.some(reg => 
              reg.email === currentUser?.email
            );
            
            if (isRegistered) {
              const eventDate = new Date(event.date);
              
              let eventDateTime = new Date(eventDate);
              if (event.start_time) {
                const [hours, minutes] = event.start_time.split(':').map(Number);
                eventDateTime.setHours(hours, minutes, 0, 0);
              }

              const timeUntilEvent = eventDateTime.getTime() - now.getTime();
              const minutesUntilEvent = Math.floor(timeUntilEvent / (1000 * 60));

              console.log(`Event: ${event.title}, Time until: ${minutesUntilEvent} minutes`);

              // Check if event starts soon (1-30 minutes)
              if (minutesUntilEvent > 0 && minutesUntilEvent <= 30) {
                const notificationKey = `event-${event.id}-starts-soon`;
                const lastNotified = localStorage.getItem(notificationKey);
                
                if (!lastNotified) {
                  console.log(`🎯 Event starting soon: ${event.title} in ${minutesUntilEvent} minutes`);
                  showEventNotification(event, 'starts soon', minutesUntilEvent, token);
                  localStorage.setItem(notificationKey, now.toISOString());
                  foundEvents = true;
                }
              }
              
              // Check if event has started (0 to -60 minutes)
              if (minutesUntilEvent <= 0 && minutesUntilEvent >= -60) {
                const notificationKey = `event-${event.id}-started`;
                const lastNotified = localStorage.getItem(notificationKey);
                
                if (!lastNotified) {
                  console.log(`🎯 Event started: ${event.title}`);
                  showEventNotification(event, 'started', null, token);
                  localStorage.setItem(notificationKey, now.toISOString());
                  foundEvents = true;
                }
              }
            }
          }

          if (!foundEvents) {
            console.log('No events needing notifications found');
          }
        }
      } catch (error) {
        console.log('Event check failed:', error);
      }
    };

    const showEventNotification = (event, status, minutes = null, token) => {
      const timeText = status === 'starts soon' 
        ? `"${event.title}" starts in ${minutes} minutes! Get ready to attend.`
        : `"${event.title}" has started! Join now!`;

      const title = status === 'starts soon' ? `Event Starting Soon ⏰` : `Event Started! 🎉`;

      // Show toast notification
      toast.info(`${title}\n${timeText}`, {
        autoClose: 8000,
        position: 'top-right'
      });

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: timeText,
          icon: '/favicon.ico',
          tag: `event-${event.id}-${status}`
        });
      }

      // Also trigger the backend to create a permanent notification
      createPermanentNotification(event, title, timeText, token);
    };

    const createPermanentNotification = async (event, title, message, token) => {
      try {
        const response = await fetch('http://localhost:8000/api/notifications/create-event', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: event.id,
            title: title,
            message: message,
            type: 'warning'
          })
        });

        if (response.ok) {
          console.log('✅ Permanent notification created in database');
        } else {
          console.error('❌ Failed to create permanent notification');
        }
      } catch (error) {
        console.error('Error creating permanent notification:', error);
      }
    };

    // Check immediately when component mounts
    checkUpcomingEvents();

    // Set up interval to check every 30 seconds
    const eventCheckInterval = setInterval(checkUpcomingEvents, 30000);

    return () => {
      clearInterval(eventCheckInterval);
    };
  }, [currentUser, location.pathname]); // Added location.pathname as dependency
};

// Component to get current location
const AppContent = ({ currentUser, events, setEvents, handleLogout, setCurrentUser }) => {
  const location = useLocation();
  
  // Use the global event notification hook with location
  useGlobalEventNotifications(currentUser, location);

  return (
    <Routes>
      <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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

      {/* NEW: Announcements Route */}
      <Route 
        path="/announcements" 
        element={
          currentUser ? (
            currentUser.role === "admin" ? (
              <Announcements 
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
    </Routes>
  );
};

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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <AppContent 
          currentUser={currentUser}
          events={events}
          setEvents={setEvents}
          handleLogout={handleLogout}
          setCurrentUser={setCurrentUser}
        />
      </ErrorBoundary>
    </Router>
  );
}