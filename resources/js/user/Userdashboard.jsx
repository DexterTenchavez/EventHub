import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Userdashboard({ events = [], setEvents, currentUser }) {
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
                body: `${event.title} on ${new Date(event.date).toLocaleDateString()} at ${getTimeRange(event)}`,
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

  const formatTimeDisplay = (timeValue) => {
    if (!timeValue) return 'Time not set';
    
    if (timeValue.includes('-')) {
      const timeParts = timeValue.split('-');
      const startTime = formatTimeDisplay(timeParts[0].trim());
      const endTime = formatTimeDisplay(timeParts[1].trim());
      return `${startTime} - ${endTime}`;
    }
    
    const timeParts = timeValue.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1] || '00';
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeRange = (event) => {
    if (event.start_time && event.end_time) {
      const startTime = formatTimeDisplay(event.start_time);
      const endTime = formatTimeDisplay(event.end_time);
      return `${startTime} - ${endTime}`;
    } else if (event.time && event.time.includes('-')) {
      return formatTimeDisplay(event.time);
    } else if (event.time) {
      return formatTimeDisplay(event.time);
    }
    return 'Time not set';
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let startTime = null;
    let endTime = null;
    
    if (event.start_time && event.end_time) {
      const [startHours, startMinutes] = event.start_time.split(':').map(Number);
      const [endHours, endMinutes] = event.end_time.split(':').map(Number);
      
      startTime = new Date(eventDate);
      startTime.setHours(startHours, startMinutes, 0, 0);
      
      endTime = new Date(eventDate);
      endTime.setHours(endHours, endMinutes, 0, 0);
    } 
    else if (event.time && event.time.includes('-')) {
      const timeParts = event.time.split('-');
      const startPart = timeParts[0].trim();
      const endPart = timeParts[1].trim();
      
      const [startHours, startMinutes] = startPart.split(':').map(Number);
      const [endHours, endMinutes] = endPart.split(':').map(Number);
      
      startTime = new Date(eventDate);
      startTime.setHours(startHours, startMinutes, 0, 0);
      
      endTime = new Date(eventDate);
      endTime.setHours(endHours, endMinutes, 0, 0);
    }
    
    if (startTime && endTime) {
      if (now < startTime) {
        return "upcoming";
      } else if (now >= startTime && now <= endTime) {
        return "present";
      } else {
        return "past";
      }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return "present";
    } else if (eventDate > today) {
      return "upcoming";
    } else {
      return "past";
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
         <Link to="/profile" className="profile-link" onClick={handleNavClick}>
          <span className="profile-icon">👤</span>
          Profile
        </Link>
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
            <Link to="/past-events" onClick={handleNavClick}>Events History</Link>
          </li>
          
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
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
              const status = getEventStatus(event);
              const isRegistered = event.registrations?.some(r => r.email === currentUser.email);

              return (
                <div className="event-card" key={event.id}>
                  <h3>{event.title}</h3>
                  <p><strong>Category:</strong> {event.category}</p>
                  <p><strong>Date & Time:</strong> {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} at {getTimeRange(event)}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  
                  {/* FIXED: Scrollable description area */}
                  <div className="event-description-container">
                    <div className="event-description-label">Description:</div>
                    <div className="event-description-scroll">
                      <p className="event-description-text">{event.description}</p>
                    </div>
                  </div>
                  
                  <div className="event-card-footer">
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${status}`}>
                        {status === "upcoming" ? "Upcoming" : 
                         status === "present" ? "Happening Now" : 
                         "Past Event"}
                      </span>
                    </p>

                    {status === "upcoming" && (
                      <button
                        onClick={() => handleRegisterToggle(event.id)}
                        className={isRegistered ? "cancel-btn" : "register-btn"}
                      >
                        {isRegistered ? "Cancel Registration" : "Register Now"}
                      </button>
                    )}

                    {status === "present" && (
                      <p className="present-event-message">Event is currently happening - Registration closed</p>
                    )}

                    {status === "past" && (
                      <p className="past-event-message">This event has already passed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}