import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Upcomingevents({ events = [], setEvents, currentUser, onLogout }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const filteredEvents = events.filter(event => getEventStatus(event) === "upcoming");
    setUpcomingEvents(filteredEvents);
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
        alert("You have successfully registered for this event!");
      }

      // Refresh events to get updated data
      const eventsRes = await axios.get("http://localhost:8000/api/events");
      setEvents(eventsRes.data);
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update registration. Please try again.");
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
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

  if (!currentUser) return <p>Loading...</p>;

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
          <li><Link to="/user-dashboard" onClick={handleNavClick}>Dashboard</Link></li>
          <li className="user-currentpage"><Link to="/upcoming-events" onClick={handleNavClick}>Upcoming Events</Link></li>
          <li><Link to="/past-events" onClick={handleNavClick}>My Events History</Link></li>
         
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="user-content">
        <h1>Upcoming Events</h1>
        
        {upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No upcoming events</h3>
            <p>There are no upcoming events at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="event-card-container">
            {upcomingEvents.map(event => {
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
                      <span className="status-badge upcoming">Upcoming</span>
                    </p>

                    <button
                      onClick={() => handleRegisterToggle(event.id)}
                      className={isRegistered ? "cancel-btn" : "register-btn"}
                    >
                      {isRegistered ? "Cancel Registration" : "Register Now"}
                    </button>
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