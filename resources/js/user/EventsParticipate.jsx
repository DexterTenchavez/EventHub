import "./user-css/eventsparticipate.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EventsParticipate({ events = [], currentUser, onLogout }) {
  const [participationHistory, setParticipationHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'present', 'absent', 'pending'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userFeedback, setUserFeedback] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});

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

  // Toggle feedback expansion
  const toggleFeedbackExpansion = (eventId, e) => {
    e?.stopPropagation();
    setExpandedFeedback(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  // Load user feedback from localStorage
  useEffect(() => {
    const loadUserFeedback = () => {
      const feedbackMap = {};
      events.forEach(event => {
        const storedFeedback = localStorage.getItem(`feedback_${event.id}_${currentUser?.id}`);
        if (storedFeedback) {
          feedbackMap[event.id] = JSON.parse(storedFeedback);
        }
      });
      setUserFeedback(feedbackMap);
    };

    if (currentUser && events.length > 0) {
      loadUserFeedback();
    }
  }, [events, currentUser]);

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


  // Add this function to UserDashboard, UpcomingEvents, and EventsParticipate components
const getProfilePicture = () => {
  if (!currentUser) return generateDefaultAvatar('User');
  
  const savedProfilePic = localStorage.getItem(`profilePicture_${currentUser.id}`);
  if (savedProfilePic) {
    return savedProfilePic;
  }
  return generateDefaultAvatar(currentUser.name);
};

const generateDefaultAvatar = (name) => {
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#4caf50"/><text x="16" y="18" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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

  // Filter events based on selected status
  const filteredEvents = participationHistory.filter(item => {
    if (filterStatus === 'all') return true;
    return item.attendance === filterStatus;
  });

  // Handle stat card click
  const handleStatCardClick = (status) => {
    setFilterStatus(status);
  };

  // Get counts for each status
  const getStatusCount = (status) => {
    if (status === 'all') return participationHistory.length;
    return participationHistory.filter(item => item.attendance === status).length;
  };

  // Check if a stat card is active
  const isStatCardActive = (status) => {
    return filterStatus === status;
  };

  // Function to check if feedback comment needs expansion
  const needsFeedbackExpansion = (comment, eventId) => {
    if (!comment) return false;
    const isExpanded = expandedFeedback[eventId];
    return comment.length > 100 && !isExpanded;
  };

  // Function to get truncated feedback comment
  const getTruncatedFeedback = (comment, eventId) => {
    if (!comment) return '';
    const isExpanded = expandedFeedback[eventId];
    if (isExpanded || comment.length <= 100) {
      return comment;
    }
    return comment.substring(0, 100) + '...';
  };

  // Event Details Modal Functions
  const openEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
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
    <img 
      src={getProfilePicture()} 
      alt="Profile" 
      className="profile-picture-icon"
    />
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
              <div 
                className={`stat-card ${isStatCardActive('all') ? 'active' : ''}`}
                onClick={() => handleStatCardClick('all')}
              >
                <h3>Total Events</h3>
                <p className="stat-number">{getStatusCount('all')}</p>
                {isStatCardActive('all') && <div className="stat-indicator">✓</div>}
              </div>
              <div 
                className={`stat-card present ${isStatCardActive('present') ? 'active' : ''}`}
                onClick={() => handleStatCardClick('present')}
              >
                <h3>Present</h3>
                <p className="stat-number">{getStatusCount('present')}</p>
                {isStatCardActive('present') && <div className="stat-indicator">✓</div>}
              </div>
              <div 
                className={`stat-card absent ${isStatCardActive('absent') ? 'active' : ''}`}
                onClick={() => handleStatCardClick('absent')}
              >
                <h3>Absent</h3>
                <p className="stat-number">{getStatusCount('absent')}</p>
                {isStatCardActive('absent') && <div className="stat-indicator">✓</div>}
              </div>
              <div 
                className={`stat-card pending ${isStatCardActive('pending') ? 'active' : ''}`}
                onClick={() => handleStatCardClick('pending')}
              >
                <h3>Pending</h3>
                <p className="stat-number">{getStatusCount('pending')}</p>
                {isStatCardActive('pending') && <div className="stat-indicator">✓</div>}
              </div>
            </div>

            {/* Filter indicator */}
            {filterStatus !== 'all' && (
              <div className="filter-indicator">
                <span>Showing: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} events </span>
                <button 
                  className="clear-filter-btn"
                  onClick={() => setFilterStatus('all')}
                >
                  Show All
                </button>
              </div>
            )}

            <div className="history-list">
              {filteredEvents.length === 0 ? (
                <div className="empty-filter-state">
                  <h3>No {filterStatus} events found</h3>
                  <p>You don't have any events with {filterStatus} status.</p>
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setFilterStatus('all')}
                  >
                    Show All Events
                  </button>
                </div>
              ) : (
                filteredEvents.map((item) => {
                  const categoryImage = getCategoryImage(item.eventCategory);
                  const isTitleExpanded = expandedTitles[item.eventId];
                  const needsSeeMore = item.eventTitle.length > 50;
                  const hasGivenFeedback = userFeedback[item.eventId];
                  
                  return (
                    <div 
                      key={item.eventId} 
                      className="participation-card clickable"
                      onClick={() => openEventDetails(item)}
                    >
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTitleExpansion(item.eventId);
                                }}
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

                            {/* Feedback Status - SIMPLIFIED for cards */}
                            {hasGivenFeedback && (
                              <div className="feedback-submitted">
                                <span className="feedback-check">✅</span>
                                <span>Feedback Submitted</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetails}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.eventTitle}</h2>
              <button className="close-btn" onClick={closeEventDetails}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={getCategoryImage(selectedEvent.eventCategory)} 
                  alt={selectedEvent.eventCategory}
                />
              </div>
              
              <div className="modal-details">
                <div className="detail-row">
                  <strong>Category:</strong>
                  <span>{selectedEvent.eventCategory}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Location:</strong>
                  <span>{selectedEvent.eventLocation}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Attendance Status:</strong>
                  <span style={{ color: getAttendanceColor(selectedEvent.attendance), fontWeight: 'bold' }}>
                    {selectedEvent.attendance.charAt(0).toUpperCase() + selectedEvent.attendance.slice(1)}
                  </span>
                </div>
                
                {selectedEvent.registeredAt && (
                  <div className="detail-row">
                    <strong>Registered On:</strong>
                    <span>{new Date(selectedEvent.registeredAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="detail-row full-width">
                  <strong>Description:</strong>
                  <div className="modal-description">
                    {selectedEvent.eventDescription}
                  </div>
                </div>

                {/* Feedback Section in Modal */}
                {userFeedback[selectedEvent.eventId] && (
                  <div className="detail-row full-width">
                    <strong>Your Feedback:</strong>
                    <div className="feedback-submitted-modal">
                      <div className="feedback-header">
                        <span className="feedback-check">✅</span>
                        <span>Rating: {userFeedback[selectedEvent.eventId].rating}★</span>
                      </div>
                      {userFeedback[selectedEvent.eventId].comment && (
                        <div className="feedback-comment-container-modal">
                          <div className="feedback-comment-preview-modal">
                            <p><strong>Your comment:</strong> "{getTruncatedFeedback(userFeedback[selectedEvent.eventId].comment, selectedEvent.eventId)}"</p>
                            {needsFeedbackExpansion(userFeedback[selectedEvent.eventId].comment, selectedEvent.eventId) && (
                              <button
                                className="feedback-see-more-btn"
                                onClick={(e) => toggleFeedbackExpansion(selectedEvent.eventId, e)}
                              >
                                {expandedFeedback[selectedEvent.eventId] ? 'See Less' : 'See More'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}