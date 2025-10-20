import "./user-css/eventsparticipate.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EventsParticipate({ events = [], currentUser, onLogout }) {
  const [participationHistory, setParticipationHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (eventId) => {
    setExpandedCards(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  useEffect(() => {
    const fetchParticipationHistory = async () => {
      try {
        const userEvents = events.filter(event => 
          event.registrations?.some(reg => reg.email === currentUser.email)
        );

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
            attendance: registration.attendance || 'pending',
            registeredAt: registration.registered_at || registration.created_at
          };
        });

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
          <li className="user-currentpage"><Link to="/past-events" onClick={handleNavClick}>My Events History</Link></li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
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
              {participationHistory.map((item) => (
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
                    <p className="event-description">
                      <strong>Description:</strong> 
                      <span className={`description-text ${expandedCards[item.eventId] ? 'expanded' : 'collapsed'}`}>
                        {item.eventDescription}
                      </span>
                      {item.eventDescription.length > 100 && (
                        <button 
                          className="read-more-btn"
                          onClick={() => toggleExpand(item.eventId)}
                        >
                          {expandedCards[item.eventId] ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </p>
                    
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