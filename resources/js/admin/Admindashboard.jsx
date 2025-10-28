import "./admin-css/admindashboard.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function Admindashboard({ events, setEvents, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "Tech Conference",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:8000/api/events", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:8000/api/users", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchEvents();
    fetchUsers();
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      category: "Tech Conference",
    });
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.description) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7',
        background: '#FFF3E0',
        color: '#E65100',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        time: `${formData.startTime} - ${formData.endTime}`,
        location: formData.location,
        category: formData.category,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`http://localhost:8000/api/events/${editId}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(prev => prev.map(ev => ev.id === editId ? res.data.event : ev));
          Swal.fire({
          title: '✅ Event Updated!',
          text: 'Your event has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } else {
        res = await axios.post("http://localhost:8000/api/events", payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(prev => [...(prev || []), res.data.event]);
        Swal.fire({
          title: '🎉 Event Created!',
          text: 'Your event has been created successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
        
        const newEvents = JSON.parse(localStorage.getItem('newEvents') || '[]');
        newEvents.push(res.data.event);
        localStorage.setItem('newEvents', JSON.stringify(newEvents));
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error:", err);
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        let errorMessage = "Please fix the following errors:\n\n";
        Object.keys(errors).forEach(key => {
          errorMessage += `• ${key}: ${errors[key].join(', ')}\n`;
        });
        Swal.fire({
          title: 'Validation Error',
          html: errorMessage.replace(/\n/g, '<br>'),
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      } else if (err.response?.data?.message) {
       Swal.fire({
          title: 'Error',
          text: err.response.data.message,
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      } else {
       Swal.fire({
          title: 'Error',
          text: "Failed to submit event.",
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const eventDate = new Date(event.date);
    const dateString = eventDate.toISOString().slice(0, 10);
    const startTime = event.start_time || '';
    const endTime = event.end_time || '';
    
    setFormData({
      title: event.title,
      description: event.description,
      date: dateString,
      startTime: startTime,
      endTime: endTime,
      location: event.location,
      category: event.category,
    });
    setEditId(event.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
   const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4FC3F7',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#FFF3E0',
      color: '#E65100'
    });

    if (result.isConfirmed) { 
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents((prev) => (prev || []).filter((ev) => ev.id !== id));
        Swal.fire({
          title: '✅ Deleted!',
          text: 'Event has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } catch (err) {
        console.error(err);
       Swal.fire({
          title: 'Error',
          text: "Failed to delete event",
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      }
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

  const eventsWithStatus = (events || []).map((event) => {
    return { ...event, status: getEventStatus(event) };
  });

  const getTimeRange = (event) => {
    if (event.start_time && event.end_time) {
      const startTime = formatTimeDisplay(event.start_time);
      const endTime = formatTimeDisplay(event.end_time);
      return `${startTime} - ${endTime}`;
    } 
    else if (event.time && event.time.includes('-')) {
      return formatTimeDisplay(event.time);
    }
    else if (event.time) {
      return formatTimeDisplay(event.time);
    }
    return 'Time not set';
  };

  const toggleAttendance = async (eventId, registrationId, attendance) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:8000/api/registrations/${registrationId}/attendance`, {
        attendance: attendance
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (attendance === 'absent') {
        const registration = selectedEvent.registrations.find(reg => reg.id === registrationId);
        if (registration && registration.user_id) {
          try {
            await axios.post(`http://localhost:8000/api/users/${registration.user_id}/penalty`, {}, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (penaltyError) {
            console.error("Error adding penalty:", penaltyError);
          }
        }
      }

      setSelectedEvent(prev => ({
        ...prev,
        registrations: prev.registrations.map(reg =>
          reg.id === registrationId ? { ...reg, attendance } : reg
        )
      }));

      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              registrations: event.registrations.map(reg =>
                reg.id === registrationId ? { ...reg, attendance } : reg
              )
            }
          : event
      ));

     Swal.fire({
        title: '✅ Attendance Updated!',
        text: `User marked as ${attendance}${attendance === 'absent' ? ' and penalty added' : ''}!`,
        icon: 'success',
        confirmButtonColor: '#4FC3F7',
        background: '#E3F2FD',
        color: '#01579B',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error("Error updating attendance:", err);
      let errorMessage = "Failed to update attendance. ";
      if (err.response?.status === 404) {
        errorMessage += "Registration not found.";
      } else if (err.response?.status === 500) {
        errorMessage += "Server error.";
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message;
      }
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE',
        color: '#C62828',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/events/${event.id}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSelectedEvent({
        ...event,
        registrations: res.data,
      });
    } catch (err) {
      console.error("Error loading registrations:", err);
       Swal.fire({
        title: 'Error',
        text: "Failed to load registrations.",
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE',
        color: '#C62828',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('Token');
      localStorage.removeItem('AUTH_TOKEN');

      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }

      onLogout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('Token');
      localStorage.removeItem('AUTH_TOKEN');
      onLogout();
      window.location.href = "/";
    }
  };

  const getUserDetails = (email) => {
    if (!users || !Array.isArray(users)) {
      return { barangay: 'N/A', purok: 'N/A' };
    }
    
    const user = users.find(u => u.email === email);
    return user ? { 
      barangay: user.barangay || 'N/A', 
      purok: user.purok || 'N/A' 
    } : { 
      barangay: 'N/A', 
      purok: 'N/A' 
    };
  };

  return (
    <div className="body">
      <div className="topbars">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub</h3>
  <button className="logout-btn" onClick={handleLogout}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#100e0fff" style={{marginRight: '8px'}}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
  <span className="logout-text">Logout</span>
</button>
      </div>

      <div className={`sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li className="currentpages">
            <Link to="/admin-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
          <li>
            <Link to="/users-penalties" onClick={handleNavClick}>👥⚠️ Users & Penalties</Link>
          </li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

     

        <div className="admin-section">
          <button className="admin-btn-primary" onClick={openCreateModal}>+ Create Event</button>
          
          <h2>All Events</h2>
          
          {eventsWithStatus.length === 0 ? (
            <div className="empty-state">
              <p>No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="events-card-container">
              {eventsWithStatus.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h3 className="event-card-title">{event.title}</h3>
                    <span className={`table-status event-card-status ${event.status}`}>
                      {event.status === "upcoming" ? "Upcoming" : 
                      event.status === "present" ? "Started" : 
                      "Past Event"}
                    </span>
                  </div>
                  
                  <div className="event-card-details">
                    <div className="event-card-detail">
                      <span className="event-card-label">Date:</span>
                      <span className="event-card-value">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="event-card-detail">
                      <span className="event-card-label">Time:</span>
                      <span className="event-card-value">{getTimeRange(event)}</span>
                    </div>
                    <div className="event-card-detail">
                      <span className="event-card-label">Location:</span>
                      <span className="event-card-value">{event.location}</span>
                    </div>
                    <div className="event-card-detail">
                      <span className="event-card-label">Category:</span>
                      <span className="event-card-value">{event.category}</span>
                    </div>
                  </div>
                  
                  <div className="event-description-container">
                    <div className="event-description-label">Description:</div>
                    <div className="event-description-scroll">
                      <p className="event-description-text">{event.description}</p>
                    </div>
                  </div>
                  
                  <div className="event-card-actions">
                    <button 
                      className="table-btn edit"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>
                    <button 
                      className="table-btn registrations"
                      onClick={() => handleViewRegistrations(event)}
                    >
                      Attendance
                    </button>
                    <button 
                      className="table-btn delete"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="admin-modal-overlay" onClick={() => !loading && setShowModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{isEditing ? "Edit Event" : "Create Event"}</h2>
                <button 
                  className="admin-modal-close" 
                  onClick={() => !loading && setShowModal(false)}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
              <div className="admin-form">
                {loading && (
                  <div className="modal-loading-overlay">
                    <div className="modal-loading-spinner"></div>
                    <p>{isEditing ? "Updating Event..." : "Creating Event..."}</p>
                  </div>
                )}
                
                <div className={loading ? "form-content loading" : "form-content"}>
                  <div className="admin-form-group">
                    <label>Title *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Select a category</option>
                      <optgroup label="Professional">
                        <option value="Tech Conference">Tech Conference</option>
                        <option value="Business Summit">Business Summit</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Networking Event">Networking Event</option>
                      </optgroup>
                      <optgroup label="Entertainment">
                        <option value="Music Festival">Music Festival</option>
                        <option value="Concert">Concert</option>
                        <option value="Art Exhibition">Art Exhibition</option>
                        <option value="Film Screening">Film Screening</option>
                      </optgroup>
                      <optgroup label="Sports & Wellness">
                        <option value="Sports Tournament">Sports Tournament</option>
                        <option value="Marathon">Marathon</option>
                        <option value="Yoga Class">Yoga Class</option>
                        <option value="Fitness Competition">Fitness Competition</option>
                      </optgroup>
                      <optgroup label="Community">
                        <option value="Charity Event">Charity Event</option>
                        <option value="Community Meeting">Community Meeting</option>
                        <option value="Cultural Festival">Cultural Festival</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Description *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="2"
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Location *</label>
                    <select 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Select a location</option>
                      <option value="Anibongan">Anibongan</option>
                      <option value="Babag">Babag</option>
                      <option value="Cagawasan">Cagawasan</option>
                      <option value="Cagawitan">Cagawitan</option>
                      <option value="Caluasan">Caluasan</option>
                      <option value="Candelaria">Candelaria</option>
                      <option value="Can-oling">Can-oling</option>
                      <option value="Estaca">Estaca</option>
                      <option value="La Esperanza">La Esperanza</option>
                      <option value="Liberty">Liberty</option>
                      <option value="Magcagong">Magcagong</option>
                      <option value="Malibago">Malibago</option>
                      <option value="Mampas">Mampas</option>
                      <option value="Napo">Napo</option>
                      <option value="Poblacion">Poblacion</option>
                      <option value="San Isidro">San Isidro</option>
                      <option value="San Jose">San Jose</option>
                      <option value="San Miguel">San Miguel</option>
                      <option value="San Roque">San Roque</option>
                      <option value="San Vicente">San Vicente</option>
                      <option value="Santo Rosario">Santo Rosario</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Santa Lucia">Santa Lucia</option>
                      <option value="Santa Rosa">Santa Rosa</option>
                      <option value="Santo Niño">Santo Niño</option>
                      <option value="Santo Tomas">Santo Tomas</option>
                      <option value="Santo Niño de Panglao">Santo Niño de Panglao</option>
                      <option value="Taytay">Taytay</option>
                      <option value="Tigbao">Tigbao</option>
                    </select>
                  </div>
                  <div className="admin-form-actions">
                    <button 
                      className="admin-btn-cancel" 
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      className={`admin-btn-submit ${loading ? 'loading' : ''}`} 
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="button-spinner"></span>
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditing ? "Update" : "Create"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Registrations for {selectedEvent.title}</h2>
                <button className="admin-modal-close" onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              <div className="admin-form">
                {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
                  <div>
                    <p><strong>Total Registrations:</strong> {selectedEvent.registrations.length}</p>
                    <div className="table-container">
                      <table className="admin-table responsive-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Barangay</th>
                            <th>Purok</th>
                            <th>Attendance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEvent.registrations.map((reg) => (
                            <tr key={reg.id}>
                              <td data-label="Name">{reg.name}</td>
                              <td data-label="Email">{reg.email}</td>
                              <td data-label="Barangay">{getUserDetails(reg.email).barangay}</td>
                              <td data-label="Purok">{getUserDetails(reg.email).purok}</td>
                              <td data-label="Attendance" className={
                                reg.attendance === 'present' ? 'status-present' :
                                reg.attendance === 'absent' ? 'status-absent' : 'status-pending'
                              }>
                                {reg.attendance || "Pending"}
                              </td>
                              <td data-label="Actions" className="attendance-actions">
                                <button 
                                  className="btn-present"
                                  onClick={() => toggleAttendance(selectedEvent.id, reg.id, "present")}
                                  disabled={reg.attendance === 'present'}
                                >
                                  Present
                                </button>
                                <button 
                                  className="btn-absent"
                                  onClick={() => toggleAttendance(selectedEvent.id, reg.id, "absent")}
                                  disabled={reg.attendance === 'absent'}
                                >
                                  Absent
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p>No registrations yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
     
    </div>
  );
}