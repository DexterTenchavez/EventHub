import "./user-css/Notifications.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Notifications({ currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Listen for new events
    const checkForNewEvents = () => {
      const newEvents = localStorage.getItem('newEvents');
      if (newEvents) {
        const events = JSON.parse(newEvents);
        events.forEach(event => {
          createEventNotification(event);
        });
        localStorage.removeItem('newEvents');
      }
    };

    checkForNewEvents();
    const interval = setInterval(checkForNewEvents, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const createEventNotification = (event) => {
    const newNotification = {
      id: Date.now(),
      title: 'New Event Created! 🎉',
      message: `A new event "${event.title}" has been scheduled for ${new Date(event.date).toLocaleDateString()}. Check it out!`,
      is_read: false,
      type: 'success',
      created_at: new Date().toISOString(),
      event_id: event.id
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setSampleData();
    }
    setLoading(false);
  };

  const setSampleData = () => {
    const sampleNotifications = [
      {
        id: 1,
        title: 'Welcome to EventHub! 🎉',
        message: 'Thank you for registering with EventHub. We\'re excited to have you on board!',
        is_read: false,
        type: 'info',
        created_at: new Date().toISOString(),
        event_id: null
      }
    ];
    setNotifications(sampleNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(sampleNotifications));
  };

  const saveNotifications = (updatedNotifications) => {
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, is_read: true } : notif
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, is_read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  if (!currentUser) return <p>Loading user...</p>;

  return (
    <div>
      <div className="user-topbar">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub</h3>
        <Link to="/profile" className="profile-link" onClick={handleNavClick}>
          <span className="profile-icon">👤</span>
          Profile
        </Link>
      </div>

      <div className={`user-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/user-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
          <li>
            <Link to="/upcoming-events" onClick={handleNavClick}>📅 Upcoming Events</Link>
          </li>
          <li>
            <Link to="/past-events" onClick={handleNavClick}>📚 My Events History</Link>
          </li>
          <li className="user-currentpage">
            <Link to="/notifications" onClick={handleNavClick}>
              🔔 Notifications 
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </Link>
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
        <div className="notifications-header">
          <h2>Notifications</h2>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Mark All as Read
              </button>
            )}
            <button 
              className="refresh-btn" 
              onClick={loadNotifications}
              style={{padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ccc'}}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-notification-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>When events are created, you'll see notifications here.</p>
          </div>
        ) : (
          <div className="notifications-container">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-date">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                 {notification.event_id && (
                    <div className="notification-event">
                        <span className="event-badge">Event Related</span>
                        <Link 
                        to={`/events/${notification.event_id}`} 
                        className="event-link"
                        onClick={handleNavClick}
                        >
                        View Event
                        </Link>
                    </div>
                    )}
                </div>
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button 
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </button>
                  )}
                  <button 
                    className="delete-notification-btn"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}