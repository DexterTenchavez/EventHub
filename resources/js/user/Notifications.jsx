import "./user-css/Notifications.css";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const MaterialIcons = {
  Notifications: '🔔',
  ArrowBack: '←',
  CheckCircle: '✅',
  Warning: '⚠️',
  Info: 'ℹ️',
  Emergency: '🚨',
  Delete: '🗑️',
  Event: '📅',
  Schedule: '⏰',
  Refresh: '🔄',
  Archive: '📁',
  Settings: '⚙️'
};

export default function Notifications({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const getToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('auth_token');
  };

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to break long words
  const breakLongWords = (text, maxWordLength = 20) => {
    if (!text) return '';
    return text.split(' ').map(word => {
      if (word.length > maxWordLength) {
        return word.match(new RegExp(`.{1,${maxWordLength}}`, 'g')).join(' ');
      }
      return word;
    }).join(' ');
  };

  const loadNotifications = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      const token = getToken();
      
      if (!token) {
        toast.error('Please log in to view notifications');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        toast.error('Session expired. Please log in again.');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data || []);
      
      if (showToast) {
        toast.success('Notifications updated');
      }
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      if (!error.message.includes('Failed to fetch')) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveEventNotificationToDB = async (event, status, minutes = null) => {
    try {
      const token = getToken();
      if (!token) return;

      const timeText = status === 'starts soon' 
        ? `"${event.title}" starts in ${minutes} minutes! Get ready to attend.`
        : `"${event.title}" has started! Join now!`;

      const title = status === 'starts soon' ? `Event Starting Soon ⏰` : `Event Started! 🎉`;

      const response = await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          title: title,
          message: timeText,
          type: 'warning'
        })
      });

      if (response.ok) {
        console.log('Event notification saved to database');
        loadNotifications();
      } else {
        console.error('Failed to save notification to database');
      }
    } catch (error) {
      console.error('Error saving notification to DB:', error);
    }
  };

  const checkUpcomingEvents = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const eventsResponse = await fetch('http://localhost:8000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        const now = new Date();

        for (const event of events) {
          if (event.registrations?.some(reg => reg.email === currentUser?.email)) {
            const eventDate = new Date(event.date);
            
            let eventDateTime = new Date(eventDate);
            if (event.start_time) {
              const [hours, minutes] = event.start_time.split(':').map(Number);
              eventDateTime.setHours(hours, minutes, 0, 0);
            }

            const timeUntilEvent = eventDateTime.getTime() - now.getTime();
            const minutesUntilEvent = Math.floor(timeUntilEvent / (1000 * 60));

            if (minutesUntilEvent > 0 && minutesUntilEvent <= 30) {
              const notificationKey = `event-${event.id}-starts-soon`;
              const lastNotified = localStorage.getItem(notificationKey);
              
              if (!lastNotified || (now - new Date(lastNotified)) > 60000) {
                const existingNotification = notifications.find(notif => 
                  notif.event_id === event.id && 
                  notif.title.includes('Starting Soon')
                );
                
                if (!existingNotification) {
                  await saveEventNotificationToDB(event, 'starts soon', minutesUntilEvent);
                  localStorage.setItem(notificationKey, now.toISOString());
                }
              }
            }
            
            if (minutesUntilEvent <= 0 && minutesUntilEvent >= -10) {
              const notificationKey = `event-${event.id}-started`;
              const lastNotified = localStorage.getItem(notificationKey);
              
              if (!lastNotified || (now - new Date(lastNotified)) > 60000) {
                const existingNotification = notifications.find(notif => 
                  notif.event_id === event.id && 
                  notif.title.includes('Started')
                );
                
                if (!existingNotification) {
                  await saveEventNotificationToDB(event, 'started');
                  localStorage.setItem(notificationKey, now.toISOString());
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Event check failed:', error);
    }
  };

  const markAsRead = async (notificationId, fromList = false) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true } 
              : notif
          )
        );
        
        if (!fromList) {
          toast.success('Marked as read');
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            is_read: true 
          }))
        );
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        toast.success('Notification deleted');
        
        if (selectedNotification && selectedNotification.id === notificationId) {
          setViewMode('list');
          setSelectedNotification(null);
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // FIXED: Archive function - only marks as read, doesn't move to archive filter
  const archiveNotification = async (notificationId) => {
    try {
      await markAsRead(notificationId, true);
      toast.success('Notification archived');
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(() => {
      loadNotifications();
      checkUpcomingEvents();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      checkUpcomingEvents();
    }
  }, [currentUser]);

  // FIXED: Filter logic - "archived" should only show read notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (activeFilter) {
      case 'unread':
        return !notification.is_read;
      case 'events':
        return notification.event_id;
      case 'system':
        return !notification.event_id;
      case 'archived':
        return notification.is_read;
      default:
        return true;
    }
  });

  // FIXED: Count logic for archived
  const unreadCount = notifications.filter(notif => !notif.is_read).length;
  const archivedCount = notifications.filter(notif => notif.is_read).length;
  const eventCount = notifications.filter(notif => notif.event_id).length;
  const systemCount = notifications.filter(notif => !notif.event_id).length;

  const filters = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'events', label: 'Events', count: eventCount },
    { key: 'system', label: 'System', count: systemCount },
    { key: 'archived', label: 'Archived', count: archivedCount }
  ];

  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedNotification(null);
    } else {
      navigate(-1);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setViewMode('detail');
    
    if (!notification.is_read) {
      markAsRead(notification.id, true);
    }
  };

  // UPDATED: Enhanced notification type handling
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return MaterialIcons.CheckCircle;
      case 'warning': return MaterialIcons.Warning;
      case 'emergency': return MaterialIcons.Emergency;
      case 'info': return MaterialIcons.Info;
      default: return MaterialIcons.Notifications;
    }
  };

  // UPDATED: Enhanced colors for different types
  const getNotificationColor = (type) => {
    switch(type) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'emergency': return '#f44336';
      case 'info': return '#2196f3';
      default: return '#9c27b0';
    }
  };

  // UPDATED: Get background color for notification types
  const getNotificationBackground = (type) => {
    switch(type) {
      case 'success': return 'linear-gradient(135deg, #4caf50, #66bb6a)';
      case 'warning': return 'linear-gradient(135deg, #ff9800, #ffb74d)';
      case 'emergency': return 'linear-gradient(135deg, #f44336, #ef5350)';
      case 'info': return 'linear-gradient(135deg, #2196f3, #42a5f5)';
      default: return 'linear-gradient(135deg, #667eea, #764ba2)';
    }
  };

  // UPDATED: Get type label
  const getTypeLabel = (type) => {
    switch(type) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'emergency': return 'Emergency Alert';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const formatEventDateTime = (event) => {
    if (!event || !event.date) return 'Date not set';
    
    try {
      const date = new Date(event.date);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      let timePart = '';
      if (event.start_time) {
        const [hours, minutes] = event.start_time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        timePart = ` at ${displayHour}:${minutes} ${ampm}`;
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + timePart;
    } catch (error) {
      return 'Date not set';
    }
  };

  const NotificationDetail = () => {
    if (!selectedNotification) return null;

    return (
      <div className="mui-detail-view">
        <div 
          className="mui-detail-header"
          style={{ background: getNotificationBackground(selectedNotification.type) }}
        >
          <button className="mui-back-button" onClick={() => setViewMode('list')}>
            {MaterialIcons.ArrowBack}
          </button>
          <div className="mui-detail-icon">
            {getNotificationIcon(selectedNotification.type)}
          </div>
          <div className="mui-detail-title">
            <div className="mui-notification-type-badge">
              {getTypeLabel(selectedNotification.type)}
            </div>
            <h2 className="mui-text-wrap">{selectedNotification.title}</h2>
            <p className="mui-detail-time">
              {formatRelativeTime(selectedNotification.created_at)}
            </p>
          </div>
          <div className="mui-detail-actions-top">
            <button 
              className="mui-button mui-button-text"
              onClick={() => archiveNotification(selectedNotification.id)}
            >
              {MaterialIcons.Archive} Archive
            </button>
            <button 
              className="mui-button mui-button-text mui-button-error"
              onClick={() => deleteNotification(selectedNotification.id)}
            >
              {MaterialIcons.Delete} Delete
            </button>
          </div>
        </div>

        <div className="mui-detail-content">
          <div className="mui-detail-message">
            <div className="mui-message-header">
              <span className="mui-sender">EventHub System</span>
              <span className="mui-time">{formatRelativeTime(selectedNotification.created_at)}</span>
            </div>
            <div className="mui-message-body">
              <p className="mui-text-wrap">{selectedNotification.message}</p>
            </div>
          </div>

          {selectedNotification.event && (
            <div className="mui-event-details">
              <h3>Event Details</h3>
              <div className="mui-event-info">
                <div className="mui-event-field">
                  <strong>Event:</strong>
                  <span className="mui-text-wrap">{selectedNotification.event.title}</span>
                </div>
                <div className="mui-event-field">
                  <strong>Date & Time:</strong>
                  <span className="mui-text-wrap">{formatEventDateTime(selectedNotification.event)}</span>
                </div>
                {selectedNotification.event.location && (
                  <div className="mui-event-field">
                    <strong>Location:</strong>
                    <span className="mui-text-wrap">{selectedNotification.event.location}</span>
                  </div>
                )}
                {selectedNotification.event.description && (
                  <div className="mui-event-field">
                    <strong>Description:</strong>
                    <span className="mui-text-wrap mui-description">
                      {breakLongWords(selectedNotification.event.description)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const NotificationList = () => (
    <>
      <div className="mui-tabs">
        {filters.map(filter => (
          <button
            key={filter.key}
            className={`mui-tab ${activeFilter === filter.key ? 'mui-tab-active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            <span>{filter.label}</span>
            {filter.count > 0 && <span className="mui-badge">{filter.count}</span>}
          </button>
        ))}
      </div>

      <div className="mui-toolbar">
        <div className="mui-toolbar-left">
          <button 
            className="mui-button mui-button-text"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
        <div className="mui-toolbar-right">
          <button 
            className="mui-button mui-button-outlined"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : `${MaterialIcons.Refresh} Refresh`}
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="mui-empty-state">
          <div className="mui-empty-icon">{MaterialIcons.Notifications}</div>
          <h3>No notifications</h3>
          <p>
            {activeFilter === 'all' 
              ? "You're all caught up! No new notifications." 
              : activeFilter === 'unread'
              ? "No unread notifications"
              : `No ${activeFilter} notifications found.`
            }
          </p>
        </div>
      ) : (
        <div className="mui-list">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`mui-list-item ${!notification.is_read ? 'mui-unread' : ''} mui-notification-type-${notification.type}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="mui-list-item-icon" style={{ color: getNotificationColor(notification.type) }}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="mui-list-item-content">
                <div className="mui-list-item-header">
                  <div className="mui-list-item-title-section">
                    <h4 className="mui-list-item-title mui-text-ellipsis" title={notification.title}>
                      {truncateText(notification.title, 60)}
                    </h4>
                    <span className="mui-notification-type-tag" style={{ 
                      backgroundColor: getNotificationColor(notification.type) + '20',
                      color: getNotificationColor(notification.type),
                      border: `1px solid ${getNotificationColor(notification.type)}40`
                    }}>
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                  <span className="mui-list-item-time">{formatRelativeTime(notification.created_at)}</span>
                </div>
                <p className="mui-list-item-message mui-text-ellipsis" title={notification.message}>
                  {truncateText(notification.message, 80)}
                </p>
                <div className="mui-list-item-meta">
                  {notification.event_id && (
                    <span className="mui-event-tag">
                      {MaterialIcons.Event} Event
                    </span>
                  )}
                  <div className="mui-list-item-actions">
                    <button 
                      className="mui-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(notification.id);
                      }}
                      title="Archive"
                    >
                      {MaterialIcons.Archive}
                    </button>
                    <button 
                      className="mui-action-btn mui-action-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                    >
                      {MaterialIcons.Delete}
                    </button>
                  </div>
                </div>
              </div>
              {!notification.is_read && (
                <div 
                  className="mui-unread-indicator" 
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                  title="Unread"
                ></div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="mui-notifications">
      <div className="mui-header">
        <button className="mui-back-button" onClick={handleBack}>
          {MaterialIcons.ArrowBack}
        </button>
        <div className="mui-header-content">
          <h1>Notifications</h1>
          <p>
            {viewMode === 'detail' 
              ? 'Notification Details' 
              : `${notifications.length} messages • ${unreadCount} unread`
            }
          </p>
        </div>
        <div className="mui-header-actions">
          {viewMode === 'list' && (
            <button className="mui-button mui-button-outlined" onClick={() => loadNotifications(true)}>
              {refreshing ? '...' : MaterialIcons.Refresh}
            </button>
          )}
        </div>
      </div>

      <div className="mui-content">
        {loading ? (
          <div className="mui-loading">
            <div className="mui-spinner"></div>
            <p>Loading your notifications...</p>
          </div>
        ) : viewMode === 'detail' ? (
          <NotificationDetail />
        ) : (
          <NotificationList />
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}