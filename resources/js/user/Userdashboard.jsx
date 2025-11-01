import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

export default function Userdashboard({ events = [], setEvents, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTitles, setExpandedTitles] = useState({});

  // Category images mapping
  const categoryImages = {
    "Barangay Assembly": "/images/barangay_asssembly.jpg",
    "Medical Mission": "/images/Medical_mission.jpg",
    "Vaccination Drive": "/images/Vaccination.jpg",
    "Farming Seminar": "/images/Farmer_seminar.jpg",
    "Town Fiesta": "/images/Town_fiesta.jpg",
    "Sports Tournament": "/images/SportsFestival.jpg",
    "Educational Seminar": "/images/Education_seminar.jpg",
    "Civil Registration": "/images/civil_reg.jpg",
    "Voters Registration": "/images/Voter_reg.jpg",
    "Clean-up Drive": "/images/cleanup.jpg",
    "Wedding": "/images/wedding.jpg",
    "Tree Planting": "/images/treep_planting.jpg",
    "Dental Mission": "/images/dentalhealth.jpg",
    "Nutrition Program": "/images/nutrition.jpg",
    "TESDA Training": "/images/tesda courses.jpg",
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

  // Rate limiting: max 5 actions per minute
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

  if (!currentUser) return <p>Loading...</p>;

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

  const showCancellationReasonModal = (eventId) => {
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

  const handleRegisterToggle = async (eventId, cancellationReason = null, reasonType = null) => {
    if (!canPerformAction()) return;

    try {
      const token = localStorage.getItem('token');
      const event = events.find((e) => e.id === eventId);
      const isRegistered = event.registrations?.some(r => r.email === currentUser.email);

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
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Operation failed',
        icon: 'error',
        confirmButtonColor: '#4FC3F7'
      });
    }
  };

  const getReasonText = (reason, reasonType) => {
    const reasonMap = {
      'health': 'Health Issues',
      'injury': 'Injury',
      'schedule_conflict': 'Schedule Conflict',
      'personal_reasons': 'Personal Reasons',
      'other': reason
    };
    return reasonMap[reasonType] || reason;
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
        <h2>Available Events</h2>

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
            {Object.keys(barangayGroups).map(barangay => (
              <div key={barangay} className="barangay-group">
                <div className="barangay-header">
                  {barangay} ({barangayGroups[barangay].length} events)
                </div>
                <div className="event-card-container">
                  {barangayGroups[barangay].map(event => {
                    const status = getEventStatus(event);
                    const isRegistered = event.registrations?.some(r => r.email === currentUser.email);
                    const categoryImage = getCategoryImage(event.category);
                    const isTitleExpanded = expandedTitles[event.id];
                    const needsSeeMore = event.title.length > 50; // Show "See More" if title is long

                    return (
                      <div className="event-card" key={event.id}>
                        {/* Event Image */}
                        <div 
                          className="event-card-image"
                          style={{
                            backgroundImage: `url(${categoryImage})`
                          }}
                        ></div>
                        
                        <div className="event-card-content">
                          {/* Event Title with See More functionality */}
                          <div className="event-card-title-container">
                            <h3 className={`event-card-title ${isTitleExpanded ? 'expanded' : ''}`}>
                              {event.title}
                            </h3>
                            {needsSeeMore && (
                              <button
                                className="see-more-btn"
                                onClick={() => toggleTitleExpansion(event.id)}
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
                                 status === "present" ? "Started" : 
                                 "Past Event"}
                              </span>
                            </p>

                            {status === "upcoming" && (
                              <button
                                onClick={() => isRegistered ? showCancellationReasonModal(event.id) : handleRegisterToggle(event.id)}
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
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}