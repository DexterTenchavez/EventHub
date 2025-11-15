import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

export default function Userdashboard({ events = [], setEvents, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTitles, setExpandedTitles] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [userFeedback, setUserFeedback] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});
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
    if (!category) return "/images/other.jpg";
    
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

  const getUserBarangay = () => {
    return currentUser?.barangay || 
           currentUser?.location || 
           currentUser?.address?.barangay || 
           'Unknown';
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

  const toggleTitleExpansion = (eventId, e) => {
    e?.stopPropagation();
    setExpandedTitles(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const toggleFeedbackExpansion = (eventId, e) => {
    e?.stopPropagation();
    setExpandedFeedback(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

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
    
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const groupEventsByBarangay = () => {
    const filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = {};
    filteredEvents.forEach(event => {
      const barangay = event.location || 'Unknown';
      if (!grouped[barangay]) {
        grouped[barangay] = [];
      }
      grouped[barangay].push(event);
    });
    return grouped;
  };

  const barangayGroups = groupEventsByBarangay();

  const getSortedBarangays = (groups) => {
    const userBarangay = getUserBarangay();
    const barangays = Object.keys(groups);
    
    return barangays.sort((a, b) => {
      if (a === userBarangay) return -1;
      if (b === userBarangay) return 1;
      return a.localeCompare(b);
    });
  };

  const sortedBarangays = getSortedBarangays(barangayGroups);

  const openEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  const openFeedbackModal = (event) => {
    if (!canPerformAction()) return;
    
    // Check if user already gave feedback
    if (userFeedback[event.id]) {
      Swal.fire({
        title: 'Feedback Already Submitted',
        text: `You already submitted ${userFeedback[event.id].rating}★ feedback for this event.`,
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
      await axios.post(`http://localhost:8000/api/events/${selectedEvent.id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const feedbackData = {
        event_id: selectedEvent.id,
        rating: feedbackRating,
        comment: feedbackComment,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`feedback_${selectedEvent.id}_${currentUser.id}`, JSON.stringify(feedbackData));
      
      setUserFeedback(prev => ({
        ...prev,
        [selectedEvent.id]: feedbackData
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
        const feedbackData = {
          event_id: selectedEvent.id,
          rating: feedbackRating,
          comment: feedbackComment,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`feedback_${selectedEvent.id}_${currentUser.id}`, JSON.stringify(feedbackData));
        
        setUserFeedback(prev => ({
          ...prev,
          [selectedEvent.id]: feedbackData
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

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let startTime = null;
    let endTime = null;
    
    if (event.start_time && event.end_time) {
      startTime = parseTimeToDate(formatTimeDisplay(event.start_time), eventDate);
      endTime = parseTimeToDate(formatTimeDisplay(event.end_time), eventDate);
      
      if (startTime && endTime) {
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
      }
    } 
    else if (event.time && event.time.includes('-')) {
      const timeParts = event.time.split('-');
      const startPart = timeParts[0].trim();
      const endPart = timeParts[1].trim();
      
      startTime = parseTimeToDate(formatTimeDisplay(startPart), eventDate);
      endTime = parseTimeToDate(formatTimeDisplay(endPart), eventDate);
      
      if (startTime && endTime) {
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
      }
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

  const parseTimeToDate = (timeString, baseDate) => {
    if (!timeString) return null;
    
    const time = timeString.trim();
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let finalHours = hours;
    
    if (period === 'PM' && hours < 12) {
      finalHours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      finalHours = 0;
    }
    
    const date = new Date(baseDate);
    date.setHours(finalHours, minutes || 0, 0, 0);
    return date;
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

  // Get user attendance status for an event
  const getUserAttendanceStatus = (event) => {
    if (!event.registrations || !Array.isArray(event.registrations)) {
      return 'not_registered';
    }
    
    const userRegistration = event.registrations.find(reg => reg.email === currentUser.email);
    if (!userRegistration) {
      return 'not_registered';
    }
    
    return userRegistration.attendance || 'pending';
  };

  // Check if user can give feedback for an event
  const canGiveFeedback = (event) => {
    const eventStatus = getEventStatus(event);
    const attendanceStatus = getUserAttendanceStatus(event);
    
    // Only allow feedback for past events where user was marked as present
    return eventStatus === 'past' && attendanceStatus === 'present';
  };

  const showCancellationReasonModal = (eventId, e) => {
    e?.stopPropagation();
    Swal.fire({
      title: 'Cancel Registration',
      html: `
        <p>Please select your reason for cancellation:</p>
        <select id="cancellation-reason" class="swal2-select">
          <option value="">Select a reason</option>
          <option value="health">Health Issues</option>
          <option value="injury">Injury</option>
          <option value="schedule_conflict">Schedule Conflict</option>
          <option value="personal_reasons">Personal Reasons</option>
          <option value="other">Other</option>
        </select>
        <textarea id="other-reason" class="swal2-textarea" placeholder="Please specify other reason..." style="display: none; margin-top: 10px; width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm Cancellation',
      cancelButtonText: 'Keep Registration',
      preConfirm: () => {
        const reason = document.getElementById('cancellation-reason').value;
        const otherReason = document.getElementById('other-reason').value;
        
        if (!reason) {
          Swal.showValidationMessage('Please select a cancellation reason');
          return false;
        }
        
        if (reason === 'other' && !otherReason.trim()) {
          Swal.showValidationMessage('Please specify your reason');
          return false;
        }
        
        return {
          reason: reason === 'other' ? otherReason : reason,
          reasonType: reason
        };
      },
      didOpen: () => {
        const reasonSelect = document.getElementById('cancellation-reason');
        const otherTextarea = document.getElementById('other-reason');
        
        reasonSelect.addEventListener('change', (e) => {
          if (e.target.value === 'other') {
            otherTextarea.style.display = 'block';
          } else {
            otherTextarea.style.display = 'none';
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleRegisterToggle(eventId, result.value.reason, result.value.reasonType);
      }
    });
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

  const handleRegisterToggle = async (eventId, cancellationReason = null, reasonType = null, e) => {
    e?.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      const event = events.find((e) => e.id === eventId);
      
      const isRegistered = event.registrations && Array.isArray(event.registrations)
        ? event.registrations.some(r => r.email === currentUser.email)
        : false;

      let res;
      if (isRegistered) {
        res = await axios.post(`http://localhost:8000/api/events/${eventId}/unregister`, { 
          email: currentUser.email,
          cancellation_reason: reasonType || cancellationReason
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`http://localhost:8000/api/events/${eventId}/register`, {
          name: currentUser.name,
          email: currentUser.email,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (res.data.event) {
        setEvents(prevEvents =>
          prevEvents.map(ev =>
            ev.id === eventId ? res.data.event : ev
          )
        );
      } else {
        const eventsRes = await axios.get("http://localhost:8000/api/events");
        setEvents(eventsRes.data);
      }

      Swal.fire({
        title: isRegistered ? 'Cancelled!' : 'Registered!',
        text: isRegistered ? 'Registration cancelled.' : 'Successfully registered!',
        icon: 'success',
        confirmButtonColor: '#4FC3F7'
      });

    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      
      if (err.response?.status === 429) {
        Swal.fire({
          title: 'Registration Limit Reached',
          text: err.response?.data?.message || 'Too many registration attempts.',
          icon: 'warning',
          confirmButtonColor: '#4FC3F7'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Operation failed',
          icon: 'error',
          confirmButtonColor: '#4FC3F7'
        });
      }
    }
  };

  const needsFeedbackExpansion = (comment, eventId) => {
    if (!comment) return false;
    const isExpanded = expandedFeedback[eventId];
    return comment.length > 100 && !isExpanded;
  };

  const getTruncatedFeedback = (comment, eventId) => {
    if (!comment) return '';
    const isExpanded = expandedFeedback[eventId];
    if (isExpanded || comment.length <= 100) {
      return comment;
    }
    return comment.substring(0, 100) + '...';
  };

  // Get attendance badge color
  const getAttendanceBadge = (attendance) => {
    switch (attendance) {
      case 'present':
        return <span className="attendance-badge present">Present</span>;
      case 'absent':
        return <span className="attendance-badge absent">Absent</span>;
      case 'pending':
        return <span className="attendance-badge pending">Pending</span>;
      default:
        return null;
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
          <li className="user-currentpage">
            <Link to="/user-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
          <li>
            <Link to="/upcoming-events" onClick={handleNavClick}>📅 Upcoming Events</Link>
          </li>
          <li>
            <Link to="/past-events" onClick={handleNavClick}>📚 My Events History</Link>
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
        <h1>Available Events</h1>

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events by title, description, location, or category..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              Search
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events available</h3>
            <p>Please wait for the admin to create some events!</p>
          </div>
        ) : Object.keys(barangayGroups).length === 0 ? (
          <div className="empty-state">
            <p>No events found matching your search.</p>
          </div>
        ) : (
          <div className="events-container">
            {sortedBarangays.map(barangay => (
              <div key={barangay} className="barangay-group">
                <div className="barangay-header">
                  {barangay === getUserBarangay() ? (
                    <>
                      <span className="user-barangay-badge">Your Barangay</span>
                      {barangay} ({barangayGroups[barangay].length} events)
                    </>
                  ) : (
                    `${barangay} (${barangayGroups[barangay].length} events)`
                  )}
                </div>
                <div className="event-card-container">
                  {barangayGroups[barangay].map(event => {
                    const status = getEventStatus(event);
                    const isRegistered = event.registrations && Array.isArray(event.registrations)
                      ? event.registrations.some(r => r.email === currentUser.email)
                      : false;
                    const categoryImage = getCategoryImage(event.category);
                    const isTitleExpanded = expandedTitles[event.id];
                    const needsSeeMore = event.title.length > 50;
                    const hasGivenFeedback = userFeedback[event.id];
                    const attendanceStatus = getUserAttendanceStatus(event);
                    const canSubmitFeedback = canGiveFeedback(event);

                    return (
                      <div 
                        className="event-card clickable" 
                        key={event.id}
                        onClick={() => openEventDetails(event)}
                      >
                        <div 
                          className="event-card-image"
                          style={{
                            backgroundImage: `url(${categoryImage})`
                          }}
                        ></div>
                        
                        <div className="event-card-content">
                          <div className="event-card-title-container">
                            <h3 className={`event-card-title ${isTitleExpanded ? 'expanded' : ''}`}>
                              {event.title}
                            </h3>
                            {needsSeeMore && (
                              <button
                                className="see-more-btn"
                                onClick={(e) => toggleTitleExpansion(event.id, e)}
                              >
                                {isTitleExpanded ? 'See Less' : 'See More'}
                              </button>
                            )}
                          </div>
                          
                          <p><strong>Category:</strong> {event.category}</p>
                          <p><strong>Date & Time:</strong> {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} at {getTimeRange(event)}</p>
                          <p><strong>Location:</strong> {event.location}</p>
                          
                          {/* Show attendance status if registered */}
                          {isRegistered && (
                            <div className="attendance-status">
                              <strong>Your Status:</strong> 
                              {getAttendanceBadge(attendanceStatus)}
                            </div>
                          )}
                          
                          <div className="event-description-container">
                            <div className="event-description-label">Description:</div>
                            <div className="event-description-scroll">
                              <p className="event-description-text">{event.description}</p>
                            </div>
                          </div>
                          
                          <div className="event-card-footer">
                            <p><strong>Event Status:</strong> 
                              <span className={`status-badge ${status}`}>
                                {status === "upcoming" ? "Upcoming" : 
                                 status === "present" ? "Started" : 
                                 "Past Event"}
                              </span>
                            </p>

                            {status === "upcoming" && (
                              <button
                                onClick={(e) => isRegistered ? showCancellationReasonModal(event.id, e) : handleRegisterToggle(event.id, null, null, e)}
                                className={isRegistered ? "cancel-btn" : "register-btn"}
                              >
                                {isRegistered ? "Cancel Registration" : "Register Now"}
                              </button>
                            )}

                            {status === "present" && (
                              <p className="present-event-message">Event is currently happening - Registration closed</p>
                            )}

                            {status === "past" && isRegistered && (
                              hasGivenFeedback ? (
                                <div className="feedback-submitted">
                                  <span className="feedback-check">✅</span>
                                  <span>Feedback Submitted</span>
                                </div>
                              ) : canSubmitFeedback ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFeedbackModal(event);
                                  }}
                                  className="feedback-btn"
                                >
                                  📝 Give Feedback
                                </button>
                              ) : (
                                <p className="feedback-not-allowed-message">
                                  {attendanceStatus === 'absent' 
                                    ? "Cannot give feedback - Marked as absent" 
                                    : attendanceStatus === 'pending'
                                    ? "Cannot give feedback - Attendance pending"
                                    : "Cannot give feedback"}
                                </p>
                              )
                            )}

                            {status === "past" && !isRegistered && (
                              <p className="past-event-message">This event has already passed</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && !feedbackModalOpen && (
        <div className="modal-overlay" onClick={closeEventDetails}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="close-btn" onClick={closeEventDetails}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={getCategoryImage(selectedEvent.category)} 
                  alt={selectedEvent.category}
                />
              </div>
              
              <div className="modal-details">
                <div className="detail-row">
                  <strong>Category:</strong>
                  <span>{selectedEvent.category}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Time:</strong>
                  <span>{getTimeRange(selectedEvent)}</span>
                </div>
                
                <div className="detail-row">
                  <strong>Location:</strong>
                  <span>{selectedEvent.location}</span>
                </div>

                {/* Show attendance status in modal if registered */}
                {selectedEvent.registrations && Array.isArray(selectedEvent.registrations) && 
                 selectedEvent.registrations.some(r => r.email === currentUser.email) && (
                  <div className="detail-row">
                    <strong>Your Status:</strong>
                    {getAttendanceBadge(getUserAttendanceStatus(selectedEvent))}
                  </div>
                )}
                
                <div className="detail-row full-width">
                  <strong>Description:</strong>
                  <div className="modal-description">
                    {selectedEvent.description}
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="status-info">
                    <strong>Event Status:</strong>
                    <span className={`status-badge ${getEventStatus(selectedEvent)}`}>
                      {getEventStatus(selectedEvent) === "upcoming" ? "Upcoming" : 
                       getEventStatus(selectedEvent) === "present" ? "Started" : 
                       "Past Event"}
                    </span>
                  </div>

                  {getEventStatus(selectedEvent) === "upcoming" && (
                    <button
                      onClick={() => {
                        const isRegistered = selectedEvent.registrations && Array.isArray(selectedEvent.registrations)
                          ? selectedEvent.registrations.some(r => r.email === currentUser.email)
                          : false;
                        if (isRegistered) {
                          showCancellationReasonModal(selectedEvent.id);
                        } else {
                          handleRegisterToggle(selectedEvent.id);
                        }
                        closeEventDetails();
                      }}
                      className={selectedEvent.registrations && Array.isArray(selectedEvent.registrations) && selectedEvent.registrations.some(r => r.email === currentUser.email) ? "cancel-btn" : "register-btn"}
                    >
                      {selectedEvent.registrations && Array.isArray(selectedEvent.registrations) && selectedEvent.registrations.some(r => r.email === currentUser.email) ? "Cancel Registration" : "Register Now"}
                    </button>
                  )}

                  {getEventStatus(selectedEvent) === "past" && 
                   selectedEvent.registrations && Array.isArray(selectedEvent.registrations) && 
                   selectedEvent.registrations.some(r => r.email === currentUser.email) && (
                    userFeedback[selectedEvent.id] ? (
                      <div className="feedback-submitted-modal">
                        <div className="feedback-header">
                          <span className="feedback-check">✅</span>
                          <span>Feedback Submitted ({userFeedback[selectedEvent.id].rating}★)</span>
                        </div>
                        {userFeedback[selectedEvent.id].comment && (
                          <div className="feedback-comment-container-modal">
                            <div className="feedback-comment-preview-modal">
                              <p><strong>Your comment:</strong> "{getTruncatedFeedback(userFeedback[selectedEvent.id].comment, selectedEvent.id)}"</p>
                              {needsFeedbackExpansion(userFeedback[selectedEvent.id].comment, selectedEvent.id) && (
                                <button
                                  className="feedback-see-more-btn"
                                  onClick={(e) => toggleFeedbackExpansion(selectedEvent.id, e)}
                                >
                                  {expandedFeedback[selectedEvent.id] ? 'See Less' : 'See More'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : canGiveFeedback(selectedEvent) ? (
                      <button
                        onClick={() => {
                          closeEventDetails();
                          openFeedbackModal(selectedEvent);
                        }}
                        className="feedback-btn"
                      >
                        📝 Give Feedback
                      </button>
                    ) : (
                      <p className="feedback-not-allowed-message-modal">
                        {getUserAttendanceStatus(selectedEvent) === 'absent' 
                          ? "Cannot give feedback - You were marked as absent" 
                          : getUserAttendanceStatus(selectedEvent) === 'pending'
                          ? "Cannot give feedback - Your attendance is still pending"
                          : "Cannot give feedback for this event"}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeFeedbackModal}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Event Feedback</h2>
              <button className="close-btn" onClick={closeFeedbackModal}>×</button>
            </div>
            
            <div className="feedback-content">
              <div className="event-info">
                <h3>{selectedEvent.title}</h3>
                <p>{selectedEvent.category} • {new Date(selectedEvent.date).toLocaleDateString()}</p>
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