import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./user-css/EventDetails.css";

export default function EventDetails({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else if (response.status === 404) {
        setError("Event not found");
      } else {
        setError("Failed to load event");
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Time not specified";
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/upcoming-events')} className="back-btn">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-container">
        <div className="empty-state">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/upcoming-events')} className="back-btn">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="event-title">{event.title}</h1>
      </div>

      <div className="event-details-content">
        <div className="event-info-card">
          <div className="event-info-grid">
            <div className="info-item">
              <span className="info-label">📅 Date</span>
              <span className="info-value">{formatDate(event.date)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">⏰ Time</span>
              <span className="info-value">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">📍 Location</span>
              <span className="info-value">{event.location}</span>
            </div>
            {event.category && (
              <div className="info-item">
                <span className="info-label">🏷️ Category</span>
                <span className="info-value category-badge">{event.category}</span>
              </div>
            )}
          </div>
        </div>

        <div className="event-description-card">
          <h3>About this Event</h3>
          <p className="description-text">{event.description}</p>
        </div>

        <div className="event-stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{event.registrations?.length || 0}</span>
              <span className="stat-label">Registered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {event.registrations?.filter(r => r.attendance === 'attended').length || 0}
              </span>
              <span className="stat-label">Attended</span>
            </div>
          </div>
        </div>

        <div className="event-actions">
          <Link to="/upcoming-events" className="btn-secondary">
            View All Events
          </Link>
          {currentUser?.role === 'user' && (
            <Link 
              to={`/event-register/${event.id}`} 
              className="btn-primary"
            >
              Register for Event
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}