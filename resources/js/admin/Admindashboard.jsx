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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Tech Conference",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/events");
        console.log("Raw event data:", res.data);
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Close mobile menu when clicking on a link
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
      time: "",
      location: "",
      category: "Tech Conference",
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
      alert("Please fill in all required fields including time");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category,
      };

      console.log("Sending payload:", payload);

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
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit event");
    }
  };

  const handleEdit = (event) => {
    const eventDate = new Date(event.date);
    const dateString = eventDate.toISOString().slice(0, 10);
    
    const timeString = event.time || "";
    
    setFormData({
      title: event.title,
      description: event.description,
      date: dateString,
      time: timeString,
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventsWithStatus = (events || []).map((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    let status = "";
    if (eventDate.getTime() === today.getTime()) status = "present";
    else if (eventDate.getTime() > today.getTime()) status = "upcoming";
    else status = "past";

    return { ...event, status };
  });

  const formatTimeDisplay = (timeValue) => {
    if (!timeValue) return 'Time not set';
    
    const timeParts = timeValue.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // FIXED: Update attendance and save to backend
  const toggleAttendance = async (eventId, registrationId, attendance) => {
    try {
      console.log("=== ATTENDANCE UPDATE DEBUG ===");
      console.log("Registration ID:", registrationId);
      console.log("Attendance:", attendance);
      
      // Use the correct endpoint and data format
      const res = await axios.put(`http://localhost:8000/api/registrations/${registrationId}/attendance`, {
        attendance: attendance
      });

      console.log("✅ Backend response:", res.data);

      // If marking as absent, add penalty to user
      if (attendance === 'absent') {
        const registration = selectedEvent.registrations.find(reg => reg.id === registrationId);
        if (registration && registration.user_id) {
          console.log("Adding penalty for user:", registration.user_id);
          try {
            await axios.post(`http://localhost:8000/api/users/${registration.user_id}/penalty`);
            console.log("✅ Penalty added successfully");
          } catch (penaltyError) {
            console.error("❌ Error adding penalty:", penaltyError);
            // Continue even if penalty fails - attendance was still updated
          }
        }
      }

      // Update frontend state
      setSelectedEvent(prev => ({
        ...prev,
        registrations: prev.registrations.map(reg =>
          reg.id === registrationId ? { ...reg, attendance } : reg
        )
      }));

      // Update events list
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

      alert(`✅ User marked as ${attendance}${attendance === 'absent' ? ' and penalty added' : ''}!`);
    } catch (err) {
      console.error("❌ Error updating attendance:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // Show specific error message
      let errorMessage = "Failed to update attendance. ";
      if (err.response?.status === 404) {
        errorMessage += "Registration not found.";
      } else if (err.response?.status === 500) {
        errorMessage += "Server error. Check your backend.";
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
      console.log("Loading registrations for event:", event.id);
      const res = await axios.get(`http://localhost:8000/api/events/${event.id}/registrations`);
      console.log("Registrations loaded:", res.data);
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
        <Link to="/" onClick={handleLogout}>Logout</Link>
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

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="admin-content">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-section">
          <div className="admin-section">
            <button className="admin-btn-primary" onClick={openCreateModal}>+ Create Event</button>
          </div>
          <h2>All Events</h2>
          {eventsWithStatus.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            eventsWithStatus.map((event) => (
              <div key={event.id} className="admin-section">
                <h3>{event.title} <span className={`admin-status-badge ${event.status}`}>{event.status}</span></h3>
                <p>{event.description}</p>
                <p>
                  Date & Time:{" "}
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {formatTimeDisplay(event.time)}
                </p>
                <p>Location: {event.location}</p>
                <p>Category: {event.category}</p>

                <div className="admin-actions">
                  <button onClick={() => handleEdit(event)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(event.id)}>🗑️ Delete</button>
                  <button onClick={() => handleViewRegistrations(event)}>👥 View Registrations</button>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{isEditing ? "Edit Event" : "Create Event"}</h2>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="admin-form">
                <div className="admin-form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Tech Conference">Tech Conference</option>
                    <option value="Music Festival">Music Festival</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" />
                </div>
                <div className="admin-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="admin-form-actions">
                  <button className="admin-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="admin-btn-submit" onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Registrations for {selectedEvent.title}</h2>
                <button className="admin-modal-close" onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              <div className="admin-form">
                {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
                  <div>
                    <p><strong>Total Registrations:</strong> {selectedEvent.registrations.length}</p>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Attendance</th>
                          <th>Toggle Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEvent.registrations.map((reg) => (
                          <tr key={reg.id}>
                            <td>{reg.name}</td>
                            <td>{reg.email}</td>
                            <td className={
                              reg.attendance === 'present' ? 'status-present' :
                              reg.attendance === 'absent' ? 'status-absent' : 'status-pending'
                            }>
                              {reg.attendance || "Pending"}
                            </td>
                            <td className="attendance-actions">
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