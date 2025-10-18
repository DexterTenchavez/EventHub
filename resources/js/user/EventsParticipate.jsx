import "./user-css/eventsparticipate.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EventsParticipate({ events = [], currentUser, onLogout }) {
  const [participationHistory, setParticipationHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchParticipationHistory = async () => {
      try {
        // Get all events where the user is registered
        const userEvents = events.filter(event => 
          event.registrations?.some(reg => reg.email === currentUser.email)
        );

        // Map events with user's registration details
        const history = userEvents.map(event => {
          const registration = event.registrations.find(reg => reg.email === currentUser.email);
          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventCategory: event.category,
            eventLocation: event.location,
            eventDescription: event.description,
            registrationDate: registration.created_at || event.date,
            attendance: registration.attendance || 'pending', // present, absent, pending
            registeredAt: registration.registered_at || registration.created_at
          };
        });

        // Sort by event date (newest first)
        history.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        setParticipationHistory(history);
      } catch (error) {
        console.error("Error fetching participation history:", error);
      }
    };

    if (currentUser && events.length > 0) {
      fetchParticipationHistory();
    }
  }, [events, currentUser]);

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

  const getAttendanceBadge = (attendance) => {
    switch (attendance) {
      case 'present':
        return <span className="attendance-badge present">Present</span>;
      case 'absent':
        return <span className="attendance-badge absent">Absent</span>;
      default:
        return <span className="attendance-badge pending">Pending</span>;
    }
  };

  const getAttendanceColor = (attendance) => {
    switch (attendance) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#f44336';
      default:
        return '#ff9800';
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
          <li><Link to="/upcoming-events" onClick={handleNavClick}>Upcoming Events</Link></li>
          <li className="user-currentpage"><Link to="/past-events" onClick={handleNavClick}>Events History</Link></li>
          
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
        <h1>My Events History</h1>
        <p className="page-description">Here you can see all the events you've participated in and your attendance status.</p>
        
        {participationHistory.length === 0 ? (
          <div className="empty-state">
            <h3>No Event History</h3>
            <p>You haven't participated in any events yet. Register for upcoming events to build your history!</p>
            <Link to="/upcoming-events" className="browse-events-btn">
              Browse Upcoming Events
            </Link>
          </div>
        ) : (
          <div className="participation-container">
            <div className="stats-summary">
              <div className="stat-card">
                <h3>Total Events</h3>
                <p className="stat-number">{participationHistory.length}</p>
              </div>
              <div className="stat-card">
                <h3>Present</h3>
                <p className="stat-number present">
                  {participationHistory.filter(item => item.attendance === 'present').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Absent</h3>
                <p className="stat-number absent">
                  {participationHistory.filter(item => item.attendance === 'absent').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number pending">
                  {participationHistory.filter(item => item.attendance === 'pending').length}
                </p>
              </div>
            </div>

            <div className="history-list">
              {participationHistory.map((item, index) => (
                <div key={item.eventId} className="participation-card">
                  <div className="card-header">
                    <h3>{item.eventTitle}</h3>
                    {getAttendanceBadge(item.attendance)}
                  </div>
                  
                  <div className="card-content">
                    <p><strong>Category:</strong> {item.eventCategory}</p>
                    <p><strong>Date:</strong> {new Date(item.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</p>
                    <p><strong>Location:</strong> {item.eventLocation}</p>
                    <p><strong>Description:</strong> {item.eventDescription}</p>
                    
                    <div className="participation-details">
                      <p><strong>Your Status:</strong> 
                        <span style={{ color: getAttendanceColor(item.attendance), fontWeight: 'bold', marginLeft: '8px' }}>
                          {item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1)}
                        </span>
                      </p>
                      
                      {item.registeredAt && (
                        <p><strong>Registered On:</strong> {new Date(item.registeredAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}