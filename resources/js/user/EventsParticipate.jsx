import "./user-css/eventsparticipate.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

export default function EventsParticipate({ events = [], currentUser, onLogout }) {
  const [participationHistory, setParticipationHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userFeedback, setUserFeedback] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [lastActionTime, setLastActionTime] = useState(0);
  const [actionCount, setActionCount] = useState(0);

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
    if (!category) {
      return "/images/other.jpg";
    }
    
    if (categoryImages[category]) {
      return categoryImages[category];
    }
    
    const normalizedCategory = category.toLowerCase();
    const predefinedCategory = Object.keys(categoryImages).find(
      key => key.toLowerCase() === normalizedCategory
    );
    
    if (predefinedCategory) {
      return categoryImages[predefinedCategory];
    }
    
    return categoryImages["Other"] || "/images/other.jpg";
  };

  // Rate limiting function
  const canPerformAction = () => {
    const now = Date.now();
    const timeDiff = now - lastActionTime;
    
    if (timeDiff > 60000) {
      setActionCount(0);
      setLastActionTime(now);
      return true;
    }
    
    if (actionCount >= 5) {
      Swal.fire({
        title: 'Action Limit Reached',
        text: 'Please wait a minute before performing more actions.',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7'
      });
      return false;
    }
    
    setActionCount(prev => prev + 1);
    setLastActionTime(now);
    return true;
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
            registeredAt: registration.registered_at || registration.created_at,
            // Add the full event object for feedback functionality
            fullEvent: event
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

  // Feedback Modal Functions
  const openFeedbackModal = (event) => {
    if (!canPerformAction()) return;
    
    // Check if user already gave feedback
    if (userFeedback[event.eventId]) {
      Swal.fire({
        title: 'Feedback Already Submitted',
        text: `You already submitted ${userFeedback[event.eventId].rating}★ feedback for this event.`,
        icon: 'info',
        confirmButtonColor: '#4FC3F7'
      });
      return;
    }
    
    setSelectedEvent(event);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedEvent(null);
  };

  const handleStarClick = (rating) => {
    setFeedbackRating(rating);
  };

  const submitFeedback = async () => {
    if (!feedbackRating) {
      Swal.fire({
        title: 'Rating Required',
        text: 'Please select a rating before submitting feedback.',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/events/${selectedEvent.eventId}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Save feedback to localStorage and state
      const feedbackData = {
        event_id: selectedEvent.eventId,
        rating: feedbackRating,
        comment: feedbackComment,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`feedback_${selectedEvent.eventId}_${currentUser.id}`, JSON.stringify(feedbackData));
      
      setUserFeedback(prev => ({
        ...prev,
        [selectedEvent.eventId]: feedbackData
      }));

      Swal.fire({
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully.',
        icon: 'success',
        confirmButtonColor: '#4FC3F7'
      });

      closeFeedbackModal();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      
      if (err.response?.status === 409) {
        // User already submitted feedback - update local state
        const feedbackData = {
          event_id: selectedEvent.eventId,
          rating: feedbackRating,
          comment: feedbackComment,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`feedback_${selectedEvent.eventId}_${currentUser.id}`, JSON.stringify(feedbackData));
        
        setUserFeedback(prev => ({
          ...prev,
          [selectedEvent.eventId]: feedbackData
        }));

        Swal.fire({
          title: 'Feedback Already Submitted',
          text: 'You have already submitted feedback for this event.',
          icon: 'info',
          confirmButtonColor: '#4FC3F7'
        });
        
        closeFeedbackModal();
      } else {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Failed to submit feedback. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4FC3F7'
        });
      }
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

                            {/* Feedback Status */}
                            {hasGivenFeedback ? (
                              <div className="feedback-submitted">
                                <span className="feedback-check">✅</span>
                                <span>Feedback Submitted</span>
                              </div>
                            ) : (
                              // Only show feedback button for past events where user was present
                              item.attendance === 'present' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFeedbackModal(item);
                                  }}
                                  className="feedback-btn"
                                >
                                  📝 Give Feedback
                                </button>
                              )
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
      {selectedEvent && !feedbackModalOpen && (
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
                {userFeedback[selectedEvent.eventId] ? (
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
                ) : (
                  // Only show feedback button for past events where user was present
                  selectedEvent.attendance === 'present' && (
                    <div className="detail-row full-width">
                      <strong>Give Feedback:</strong>
                      <button
                        onClick={() => {
                          closeEventDetails();
                          openFeedbackModal(selectedEvent);
                        }}
                        className="feedback-btn"
                      >
                        📝 Give Feedback
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeFeedbackModal}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Event Feedback</h2>
              <button className="close-btn" onClick={closeFeedbackModal}>×</button>
            </div>
            
            <div className="feedback-content">
              <div className="event-info">
                <h3>{selectedEvent.eventTitle}</h3>
                <p>{selectedEvent.eventCategory} • {new Date(selectedEvent.eventDate).toLocaleDateString()}</p>
              </div>
              
              <div className="rating-section">
                <label>How would you rate this event?</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= feedbackRating ? 'active' : ''}`}
                      onClick={() => handleStarClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="rating-text">
                  {feedbackRating === 0 && 'Select a rating'}
                  {feedbackRating === 1 && 'Poor'}
                  {feedbackRating === 2 && 'Fair'}
                  {feedbackRating === 3 && 'Good'}
                  {feedbackRating === 4 && 'Very Good'}
                  {feedbackRating === 5 && 'Excellent'}
                </p>
              </div>
              
              <div className="comment-section">
                <label>Your Comments (Optional):</label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience, suggestions, or any comments about the event..."
                  rows="4"
                />
              </div>
              
              <div className="feedback-actions">
                <button onClick={closeFeedbackModal} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={submitFeedback} className="submit-feedback-btn">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}