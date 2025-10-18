import "./admin-css/admindashboard.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

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
        const res = await axios.get("http://localhost:8000/api/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/users");
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
      alert("Please fill in all required fields including start and end time");
      return;
    }

    setLoading(true);

    try {
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
        res = await axios.put(`http://localhost:8000/api/events/${editId}`, payload);
        setEvents(prev => prev.map(ev => ev.id === editId ? res.data.event : ev));
        alert("Event updated successfully!");
      } else {
        res = await axios.post("http://localhost:8000/api/events", payload);
        setEvents(prev => [...(prev || []), res.data.event]);
        alert("Event created successfully!");
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
        alert(errorMessage);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to submit event.");
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
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:8000/api/events/${id}`);
        setEvents((prev) => (prev || []).filter((ev) => ev.id !== id));
        alert("Event deleted successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to delete event");
      }
    }
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

  const eventsWithStatus = (events || []).map((event) => {
    return { ...event, status: getEventStatus(event) };
  });

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
      const res = await axios.put(`http://localhost:8000/api/registrations/${registrationId}/attendance`, {
        attendance: attendance
      });

      if (attendance === 'absent') {
        const registration = selectedEvent.registrations.find(reg => reg.id === registrationId);
        if (registration && registration.user_id) {
          try {
            await axios.post(`http://localhost:8000/api/users/${registration.user_id}/penalty`);
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

      alert(`User marked as ${attendance}${attendance === 'absent' ? ' and penalty added' : ''}!`);
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
      alert(errorMessage);
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/events/${event.id}/registrations`);
      setSelectedEvent({
        ...event,
        registrations: res.data,
      });
    } catch (err) {
      console.error("Error loading registrations:", err);
      alert("Failed to load registrations.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert(res.data.message);
      localStorage.removeItem('token');
      onLogout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out.");
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
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
      </div>

      <div className={`sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li className="currentpages">
            <Link to="/admin-dashboard" onClick={handleNavClick}>Dashboard</Link>
          </li>
          <li>
            <Link to="/users-penalties" onClick={handleNavClick}>Users & Penalties</Link>
          </li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="admin-content">
        <h1 className="admin-title">Admin Dashboard</h1>

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
                      event.status === "present" ? "Happening Now" : 
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
                      <option value="Tech Conference">Tech Conference</option>
                      <option value="Music Festival">Music Festival</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Description *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="4"
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
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange}
                      disabled={loading}
                    />
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
    </div>
  );
}