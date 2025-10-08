import "./admin-css/admindashboard.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Admindashboard({ events, setEvents, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // For viewing registrations
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Tech Conference",
  });

  // Fetch events
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

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal to create new event
  const openCreateModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      category: "Tech Conference",
    });
  };

  // Open modal to edit event
  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      category: event.category,
    });
    setEditId(event.id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.location || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      let res;
      if (isEditing) {
        res = await axios.put(`http://localhost:8000/api/events/${editId}`, formData);
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editId ? res.data.event : ev))
        );
        alert("Event updated successfully!");
      } else {
        res = await axios.post("http://localhost:8000/api/events", formData);
        setEvents((prev) => [...(prev || []), res.data.event]);
        alert("Event created successfully!");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit event");
    }
  };

  // Delete event
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

  // Determine event status
  const today = new Date();
  const eventsWithStatus = (events || []).map((event) => {
    const eventDate = new Date(event.date);
    let status = "";
    if (eventDate.toDateString() === today.toDateString()) status = "present";
    else if (eventDate > today) status = "upcoming";
    else status = "past";
    return { ...event, status };
  });

  // Toggle attendance
  const toggleAttendance = (eventId, userId, attendance) => {
    setEvents((prev) =>
      (prev || []).map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              registrations: ev.registrations.map((r) =>
                r.id === userId ? { ...r, attendance } : r
              ),
            }
          : ev
      )
    );
  };

  const handleViewRegistrations = async (event) => {
  try {
    const res = await axios.get(`http://localhost:8000/api/events/${event.id}/registrations`);
    setSelectedEvent({
      ...event,
      registrations: res.data,
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load registrations.");
  }
};


  return (
    <div className="body">
      <div className="topbars">
        <h3 className="title">EventHub</h3>
        <Link to="/" onClick={onLogout}>Logout</Link>
      </div>

      <div className="sidebars">
        <ul>
          <li className="currentpages">
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
        </ul>
      </div>

      <div className="admin-content">
        <h1 className="admin-title">Admin Dashboard</h1>

        {/* Events List */}
        <div className="admin-section">
          <h2>All Events</h2>
          {eventsWithStatus.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            eventsWithStatus.map((event) => (
              <div key={event.id} className="admin-section">
                <h3>{event.title} ({event.status})</h3>
                <p>{event.description}</p>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
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

        {/* Create/Edit Event Modal */}
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{isEditing ? "Edit Event" : "Create Event"}</h2>
                <button onClick={() => setShowModal(false)}>×</button>
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
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
                <div className="admin-form-group">
                  <label>Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="admin-form-actions">
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                  <button onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Modal */}
        {selectedEvent && (
          <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Registrations for {selectedEvent.title}</h2>
                <button onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              <div className="admin-form">
                {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
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
                          <td>{reg.attendance || "Pending"}</td>
                          <td>
                            <button onClick={() => toggleAttendance(selectedEvent.id, reg.id, "present")}>Present</button>
                            <button onClick={() => toggleAttendance(selectedEvent.id, reg.id, "absent")}>Absent</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No registrations yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="admin-section">
          <button className="admin-btn-primary" onClick={openCreateModal}>+ Create Event</button>
        </div>
      </div>
    </div>
  );
}
