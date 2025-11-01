import "./user-css/eventsparticipate.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EventsParticipate({ events = [], currentUser, onLogout }) {
  const [participationHistory, setParticipationHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [expandedTitles, setExpandedTitles] = useState({});

 const categoryImages = {
    "Barangay Assembly": "/images/barangay_asssembly.jpg",
    "Medical Mission": "/images/Medical_mission.jpg",
    "Vaccination Drive": "/images/Vaccination.jpg",
    "Farming Seminar": "/images/Farmer_seminar.jpeg",
    "Town Fiesta": "/images/Town_fiesta.jpg",
    "Sports Tournament": "/images/SportsFestival.jpg",
    "Educational Seminar": "/images/Education_seminar.jpg",
    "Civil Registration": "/images/civil_reg.jpg",
    "Voters Registration": "/images/Voter_reg.avif",
    "Clean-up Drive": "/images/cleanup.jpg",
    "Wedding": "/images/wedding.jpg",
    "Tree Planting": "/images/treep_planting.jpg",
    "Dental Mission": "/images/dentalhealth.jpg",
    "Nutrition Program": "/images/nutrition.jpg",
    "TESDA Training": "/images/tesdacourses.jpg",
    "Palarong Barangay": "/images/palarong_barangay.jpg",
    "4Ps Payout": "/images/4ps.jpg",
    "Christmas Party": "/images/christmas.jpg",
    "Other": "/images/other.jpg",
  };

  const getCategoryImage = (category) => {
    // If no category provided, use default
    if (!category) {
      return "/images/other.jpg";
    }
    
    // Direct match
    if (categoryImages[category]) {
      return categoryImages[category];
    }
    
    // Check if it's one of the predefined categories (case insensitive)
    const normalizedCategory = category.toLowerCase();
    const predefinedCategory = Object.keys(categoryImages).find(
      key => key.toLowerCase() === normalizedCategory
    );
    
    if (predefinedCategory) {
      return categoryImages[predefinedCategory];
    }
    
    // Default to "Other" image for any custom categories
    return categoryImages["Other"] || "/images/other.jpg";
  };


  // Toggle title expansion
  const toggleTitleExpansion = (eventId) => {
    setExpandedTitles(prev => ({
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

  // Load notification count from API
  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const notifications = await response.json();
          const unreadCount = notifications.filter(notif => !notif.is_read).length;
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error('Error loading notification count:', error);
      }
    };

    loadNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="logo-title-container">
          <img 
            src="/images/logo.jpg" 
            alt="EventHub Logo" 
            className="topbar-logo"
          />
          <h3 className="title">EventHub</h3>
        </div>
        <div className="topbar-right">
          <Link to="/notifications" className="notification-link" onClick={handleNavClick}>
            <span className="notification-icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </Link>
          <Link to="/profile" className="profile-link" onClick={handleNavClick}>
            <span className="profile-icon">👤</span>
          
          </Link>
        </div>
      </div>

      <div className={`user-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li><Link to="/user-dashboard" onClick={handleNavClick}>🏠 Home</Link></li>
          <li><Link to="/upcoming-events" onClick={handleNavClick}>📅 Upcoming Events</Link></li>
          <li className="user-currentpage"><Link to="/past-events" onClick={handleNavClick}>📚 My Events History</Link></li>
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
              {participationHistory.map((item) => {
                const categoryImage = getCategoryImage(item.eventCategory);
                const isTitleExpanded = expandedTitles[item.eventId];
                const needsSeeMore = item.eventTitle.length > 50;
                
                return (
                  <div key={item.eventId} className="participation-card">
                    {/* Event Image */}
                    <div 
                      className="event-card-image"
                      style={{
                        backgroundImage: `url(${categoryImage})`
                      }}
                    ></div>
                    
                    <div className="event-card-content">
                      <div className="card-header">
                        {/* Event Title with See More functionality */}
                        <div className="event-card-title-container">
                          <h3 className={`event-card-title ${isTitleExpanded ? 'expanded' : ''}`}>
                            {item.eventTitle}
                          </h3>
                          {needsSeeMore && (
                            <button
                              className="see-more-btn"
                              onClick={() => toggleTitleExpansion(item.eventId)}
                            >
                              {isTitleExpanded ? 'See Less' : 'See More'}
                            </button>
                          )}
                        </div>
                        {getAttendanceBadge(item.attendance)}
                      </div>
                      
                      <div className="card-details">
                        <p><strong>Category:</strong> {item.eventCategory}</p>
                        <p><strong>Date:</strong> {new Date(item.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}</p>
                        <p><strong>Location:</strong> {item.eventLocation}</p>
                        
                        <div className="event-description-container">
                          <div className="event-description-label">Description:</div>
                          <div className="event-description-scroll">
                            <p className="event-description-text">{item.eventDescription}</p>
                          </div>
                        </div>
                        
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}