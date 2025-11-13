import "./admin-css/announcements.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';

const MaterialIcons = {
  Announcement: '📢',
  Back: '←',
  Info: 'ℹ️',
  Warning: '⚠️',
  Emergency: '🚨',
  People: '👥',
  Location: '📍',
  Home: '🏠',
  Users: '👥⚠️',
  History: '📋',
  Send: '📤',
  Delete: '🗑️'
};

export default function Announcements({ currentUser, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    target_users: "all",
    barangay: ""
  });

  const barangays = [
    "Anibongan", "Babag", "Cagawasan", "Cagawitan", "Caluasan", 
    "Candelaria", "Can-oling", "Estaca", "La Esperanza", "Liberty",
    "Magcagong", "Malibago", "Mampas", "Napo", "Poblacion",
    "San Isidro", "San Jose", "San Miguel", "San Roque", "San Vicente",
    "Santo Rosario", "Santa Cruz", "Santa Fe", "Santa Lucia", "Santa Rosa",
    "Santo Niño", "Santo Tomas", "Santo Niño de Panglao", "Taytay", "Tigbao"
  ];

  const announcementTypes = [
    { value: 'info', label: 'Information', icon: MaterialIcons.Info },
    { value: 'warning', label: 'Warning', icon: MaterialIcons.Warning },
    { value: 'emergency', label: 'Emergency Alert', icon: MaterialIcons.Emergency }
  ];

  // Load announcement history
  const loadAnnouncementHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/notifications/announcements/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAnnouncementHistory(response.data || []);
    } catch (error) {
      console.error('Error loading announcement history:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load announcement history',
        icon: 'error',
        confirmButtonColor: '#4FC3F7'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadAnnouncementHistory();
    }
  }, [activeTab]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Debug logging to see what's happening
  console.log('Input change:', name, value);
  
  setFormData(prev => {
    const newFormData = {
      ...prev,
      [name]: value
    };
    console.log('New form data:', newFormData);
    return newFormData;
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in title and message',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7'
      });
      return;
    }

    if (formData.target_users === 'specific_barangay' && !formData.barangay) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select a barangay',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_users: formData.target_users,
        ...(formData.target_users === 'specific_barangay' && { barangay: formData.barangay })
      };

      const response = await axios.post('http://localhost:8000/api/notifications/announcement', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const successMessage = response.data.emails_sent !== undefined ? 
        `
          <div style="text-align: left;">
            <p>Your announcement has been sent successfully!</p>
            <p><strong>Notifications Created:</strong> ${response.data.sent_to}</p>
            <p><strong>Emails Sent:</strong> ${response.data.emails_sent}</p>
            ${response.data.emails_failed > 0 ? 
              `<p style="color: orange;"><strong>Emails Failed:</strong> ${response.data.emails_failed}</p>` : 
              ''}
            <p><strong>Title:</strong> ${formData.title}</p>
            <p><strong>Type:</strong> ${formData.type}</p>
          </div>
        ` :
        `
          <div style="text-align: left;">
            <p>Your announcement has been sent successfully!</p>
            <p><strong>Sent to:</strong> ${response.data.sent_to}</p>
            <p><strong>Title:</strong> ${formData.title}</p>
            <p><strong>Type:</strong> ${formData.type}</p>
          </div>
        `;

      Swal.fire({
        title: '✅ Announcement Sent!',
        html: successMessage,
        icon: response.data.emails_failed > 0 ? 'warning' : 'success',
        confirmButtonColor: '#4FC3F7',
        background: '#E3F2FD'
      });

      // Reset form and reload history
      setFormData({
        title: "",
        message: "",
        type: "info",
        target_users: "all",
        barangay: ""
      });
      
      // Load updated history
      loadAnnouncementHistory();
      setActiveTab('history');

    } catch (error) {
      console.error('Error sending announcement:', error);
      
      let errorMessage = "Failed to send announcement. ";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage += "You don't have permission to send announcements.";
      } else {
        errorMessage += "Please try again.";
      }

      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'info': return MaterialIcons.Info;
      case 'warning': return MaterialIcons.Warning;
      case 'emergency': return MaterialIcons.Emergency;
      default: return MaterialIcons.Announcement;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'info': return '#4299e1';
      case 'warning': return '#ed8936';
      case 'emergency': return '#f56565';
      default: return '#667eea';
    }
  };

  const getTypeBackground = (type) => {
    switch(type) {
      case 'info': return '#f0f9ff';
      case 'warning': return '#fff5f0';
      case 'emergency': return '#fff0f0';
      default: return '#f8faff';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const AnnouncementCompose = () => (
    <div className="announcements-main-content">
      <form onSubmit={handleSubmit} className="announcements-form-container">
        <div className="announcements-form-section">
          <h3>Announcement Details</h3>
          
          <div className="announcements-form-group">
            <label>Title *</label>
           <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title..."
              maxLength="255"
              disabled={loading}
              onKeyPress={(e) => {
                // Allow all characters including spaces
                // This ensures spaces work properly
              }}
            />
            <div className="announcements-char-count">{formData.title.length}/255</div>
          </div>

          <div className="announcements-form-group">
            <label>Message *</label>
           <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your announcement message..."
              rows="6"
              disabled={loading}
              onKeyDown={(e) => {
                // This helps capture all input including spaces
                if (e.key === ' ') {
                  e.preventDefault();
                  const { selectionStart, selectionEnd } = e.target;
                  const newValue = formData.message.substring(0, selectionStart) + ' ' + formData.message.substring(selectionEnd);
                  setFormData(prev => ({
                    ...prev,
                    message: newValue
                  }));
                  // Set cursor position after space
                  setTimeout(() => {
                    e.target.selectionStart = selectionStart + 1;
                    e.target.selectionEnd = selectionStart + 1;
                  }, 0);
                }
              }}
            />
          </div>

          <div className="announcements-form-group">
            <label>Type *</label>
            <div className="announcements-type-options">
              {announcementTypes.map(type => (
                <label 
                  key={type.value}
                  className={`announcements-type-option ${formData.type === type.value ? 'selected' : ''}`}
                  data-type={type.value}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span className="announcements-type-icon">
                    {type.icon}
                  </span>
                  <span className="announcements-type-label">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="announcements-form-section">
          <h3>Audience</h3>
          
          <div className="announcements-form-group">
            <label>Target Users *</label>
            <div className="announcements-target-options">
              <label className={`announcements-target-option ${formData.target_users === 'all' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="target_users"
                  value="all"
                  checked={formData.target_users === 'all'}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="announcements-target-icon">{MaterialIcons.People}</span>
                <div className="announcements-target-info">
                  <div className="announcements-target-label">All Users</div>
                  <div className="announcements-target-description">Send to all registered users via in-app and email</div>
                </div>
              </label>

              <label className={`announcements-target-option ${formData.target_users === 'specific_barangay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="target_users"
                  value="specific_barangay"
                  checked={formData.target_users === 'specific_barangay'}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="announcements-target-icon">{MaterialIcons.Location}</span>
                <div className="announcements-target-info">
                  <div className="announcements-target-label">Specific Barangay</div>
                  <div className="announcements-target-description">Send to users in a specific barangay via in-app and email</div>
                </div>
              </label>
            </div>
          </div>

          {formData.target_users === 'specific_barangay' && (
            <div className="announcements-form-group">
              <label>Select Barangay *</label>
              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select a barangay</option>
                {barangays.map(barangay => (
                  <option key={barangay} value={barangay}>{barangay}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="announcements-form-actions">
          <button className="announcements-submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="announcements-button-spinner"></div>
                Sending...
              </>
            ) : (
              `${MaterialIcons.Send} Send Announcement`
            )}
          </button>
        </div>
      </form>

      <div className="announcements-preview-section">
        <h3>Preview</h3>
        <div 
          className="announcements-preview-card" 
          data-type={formData.type}
        >
          <div className="announcements-preview-header">
            <span className="announcements-preview-icon">
              {getTypeIcon(formData.type)}
            </span>
            <div className="announcements-preview-title">
              <strong>{formData.title || "Announcement Title"}</strong>
              <span className="announcements-preview-type">
                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </span>
            </div>
          </div>
          <div className="announcements-preview-message">
            {formData.message || "Your announcement message will appear here..."}
          </div>
          <div className="announcements-preview-audience">
            <strong>To:</strong> {
              formData.target_users === 'all' 
                ? 'All Users' 
                : formData.barangay 
                  ? `Users in ${formData.barangay}`
                  : 'Specific Barangay (not selected)'
            }
          </div>
          <div className="announcements-preview-delivery">
            <strong>Delivery:</strong> In-app notification + Email
          </div>
        </div>
      </div>
    </div>
  );

  const AnnouncementHistory = () => (
    <div className="announcements-history-section">
      <div className="announcements-history-header">
        <h3>{MaterialIcons.History} Announcement History</h3>
        <button 
          className="announcements-refresh-btn"
          onClick={loadAnnouncementHistory}
          disabled={historyLoading}
        >
          {historyLoading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {historyLoading ? (
        <div className="announcements-history-loading">
          <div className="announcements-spinner"></div>
          <p>Loading announcement history...</p>
        </div>
      ) : announcementHistory.length === 0 ? (
        <div className="announcements-history-empty">
          <div className="announcements-empty-icon">{MaterialIcons.Announcement}</div>
          <h4>No announcements sent yet</h4>
          <p>Your sent announcements will appear here</p>
        </div>
      ) : (
        <div className="announcements-history-list">
          {announcementHistory.map(announcement => (
            <div 
              key={announcement.id}
              className="announcements-history-card"
              data-type={announcement.type}
            >
              <div className="announcements-history-header-info">
                <div className="announcements-history-title-section">
                  <span className="announcements-history-type-icon">
                    {getTypeIcon(announcement.type)}
                  </span>
                  <div className="announcements-history-title-content">
                    <h4>{announcement.title}</h4>
                    <div className="announcements-history-meta">
                      <span className="announcements-history-type">
                        {announcement.type}
                      </span>
                      <span className="announcements-history-date">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="announcements-history-message">
                {announcement.message}
              </div>
              
              <div className="announcements-history-footer">
                <div className="announcements-history-audience">
                  <strong>Sent to:</strong> {
                    announcement.target_users === 'all' 
                      ? 'All Users' 
                      : `Users in ${announcement.barangay}`
                  }
                </div>
                <div className="announcements-history-stats">
                  {announcement.emails_sent !== undefined && (
                    <>
                      <span>📧 {announcement.emails_sent} sent</span>
                      {announcement.emails_failed > 0 && (
                        <span className="announcements-failed-count">❌ {announcement.emails_failed} failed</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="announcements-body">
      {/* Top Bar */}
      <div className="announcements-topbar">
        <button 
          className="announcements-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <div className="announcements-logo-title-container">
           <img 
            src="/images/logo.jpg" 
            alt="EventHub Logo" 
            className="topbar-logo"
          />
          <h3 className="announcements-title">EventHub</h3>
        </div>
        
        <div className="announcements-topbar-right">
          <button className="announcements-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#100e0fff" style={{marginRight: '8px'}}>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            <span className="announcements-logout-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`announcements-sidebar ${mobileMenuOpen ? 'announcements-mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/admin-dashboard" onClick={handleNavClick}>
              {MaterialIcons.Home} Home
            </Link>
          </li>
          <li className="announcements-current-page">
            <Link to="/announcements" onClick={handleNavClick}>
              {MaterialIcons.Announcement} Announcement
            </Link>
          </li>
          <li>
            <Link to="/users-penalties" onClick={handleNavClick}>
              {MaterialIcons.Users} Users & Penalties
            </Link>
          </li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="announcements-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="announcements-admin-section">
        <div className="announcements-container">
          <div className="announcements-header-section">
            <div className="announcements-header-content">
              <h1>{MaterialIcons.Announcement} Send Announcement</h1>
              <p>Broadcast important messages to all users or specific barangays. Notifications will be sent via in-app alerts and email.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="announcements-tabs">
            <button 
              className={`announcements-tab ${activeTab === 'compose' ? 'announcements-tab-active' : ''}`}
              onClick={() => setActiveTab('compose')}
            >
              {MaterialIcons.Send} Compose
            </button>
            <button 
              className={`announcements-tab ${activeTab === 'history' ? 'announcements-tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              {MaterialIcons.History} History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'compose' ? <AnnouncementCompose /> : <AnnouncementHistory />}
        </div>
      </div>
    </div>
  );
}