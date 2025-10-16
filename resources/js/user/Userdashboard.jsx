import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Userdashboard({ events = [], setEvents, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  if (!currentUser) return <p>Loading...</p>;

  const handleRegisterToggle = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const isRegistered = event.registrations?.some(r => r.email === currentUser.email);

    try {
      let res;

      if (isRegistered) {
        res = await axios.post(`http://localhost:8000/api/events/${eventId}/unregister`, { email: currentUser.email });
        alert("You have canceled your registration.");
      } else {
        res = await axios.post(`http://localhost:8000/api/events/${eventId}/register`, {
          name: currentUser.name,
          email: currentUser.email,
        });
      }

      if (res.data.event) {
        setEvents(prevEvents =>
          prevEvents.map(ev =>
            ev.id === eventId ? res.data.event : ev
          )
        );
      } else {
        setEvents(prevEvents =>
          prevEvents.map(ev =>
            ev.id === eventId
              ? {
                  ...ev,
                  registrations: (ev.registrations || []).filter(
                    r => r.email !== currentUser.email
                  ),
                }
              : ev
          )
        );
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update registration. Please try again.");
    }
  };

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const checkNewEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/events");
        const latestEvents = res.data;

        latestEvents.forEach((event) => {
          if (!events.some((e) => e.id === event.id)) {
            if (Notification.permission === "granted") {
              new Notification("New Event Created!", {
                body: `${event.title} on ${new Date(event.date).toLocaleDateString()} at ${formatTimeDisplay(event.time)}`,
                icon: "/favicon.ico",
              });
            }
          }
        });

        setEvents(latestEvents);
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(checkNewEvents, 10000);
    return () => clearInterval(interval);
  }, [events]);

 // Add this to your User Dashboard component
const formatTimeDisplay = (timeValue) => {
  if (!timeValue) return 'Time not set';
  
  const timeParts = timeValue.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

  const handleLogout = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log("Logout response:", res.data);
      alert(res.data.message);

      localStorage.removeItem('token');
      onLogout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div>
      <div className="user-topbar">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub</h3>
        <Link to="/" onClick={handleLogout}>Logout</Link>
      </div>

      <div className={`user-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li className="user-currentpage">
            <Link to="/user-dashboard" onClick={handleNavClick}>Dashboard</Link>
          </li>
          <li>
            <Link to="/upcoming-events" onClick={handleNavClick}>Upcoming Events</Link>
          </li>
          <li>
            <Link to="/past-events" onClick={handleNavClick}>Past Events</Link>
          </li>
          <li>
            <Link to="/profile" onClick={handleNavClick}>Profile</Link>
          </li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 80
          }}
        />
      )}

      <div className="user-content">
        <h1>Welcome, {currentUser.name}!</h1>
        <h2>Available Events</h2>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events available</h3>
            <p>Please wait for the admin to create some events!</p>
          </div>
        ) : (
          <div className="event-card-container">
            {events.map(event => {
              const eventDate = new Date(event.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              eventDate.setHours(0, 0, 0, 0);

              let status = "";
              if (eventDate.getTime() === today.getTime()) status = "present";
              else if (eventDate.getTime() > today.getTime()) status = "upcoming";
              else status = "past";

              const isRegistered = event.registrations?.some(r => r.email === currentUser.email);

              return (
                <div className="event-card" key={event.id}>
                  <h3>{event.title}</h3>
                  <p><strong>Category:</strong> {event.category}</p>
                 <p><strong>Date & Time:</strong> {new Date(event.date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})} at {formatTimeDisplay(event.time)}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Description:</strong> {event.description}</p>
                  <p><strong>Status:</strong> {status}</p>

                  <button
                    onClick={() => handleRegisterToggle(event.id)}
                    className={isRegistered ? "cancel-btn" : "register-btn"}
                  >
                    {isRegistered ? "Cancel Registration" : "Register Now"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}