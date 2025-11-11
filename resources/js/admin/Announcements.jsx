import "./admin-css/announcements.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';

const MaterialIcons = {
  Announcement: '📢',
  Back: '←',
  Info: 'ℹ️',
  Warning: '⚠️',
  Emergency: '🚨', // Added emergency icon
  People: '👥',
  Location: '📍',
  Home: '🏠',
  Users: '👥⚠️'
};

export default function Announcements({ currentUser, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Announcement types with Emergency instead of Success
  const announcementTypes = [
    { value: 'info', label: 'Information', icon: MaterialIcons.Info },
    { value: 'warning', label: 'Warning', icon: MaterialIcons.Warning },
    { value: 'emergency', label: 'Emergency Alert', icon: MaterialIcons.Emergency }
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      // Enhanced success message with email stats
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

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        target_users: "all",
        barangay: ""
      });

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
      case 'info': return '#2196F3';
      case 'warning': return '#FF9800';
      case 'emergency': return '#F44336'; // Red for emergency
      default: return '#9C27B0';
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

  return (
    <div className="body">
      {/* Top Bar - Same as AdminDashboard */}
      <div className="topbars">
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
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#100e0fff" style={{marginRight: '8px'}}>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar - Same as AdminDashboard */}
      <div className={`sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/admin-dashboard" onClick={handleNavClick}>
              {MaterialIcons.Home} Home
            </Link>
          </li>
          <li className="currentpages">
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
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="admin-section">
        <div className="announcements-container">
          <div className="announcements-header-section">
            <div className="announcements-header-content">
              <h1>{MaterialIcons.Announcement} Send Announcement</h1>
              <p>Broadcast important messages to all users or specific barangays. Notifications will be sent via in-app alerts and email.</p>
            </div>
          </div>

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
                  />
                </div>

                <div className="announcements-form-group">
                  <label>Type *</label>
                  <div className="announcements-type-options">
                    {announcementTypes.map(type => (
                      <label 
                        key={type.value}
                        className={`announcements-type-option ${formData.type === type.value ? 'selected' : ''}`}
                        style={formData.type === type.value ? { borderColor: getTypeColor(type.value) } : {}}
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
                        <span className="announcements-type-icon" style={{ color: getTypeColor(type.value) }}>
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
                  '📤 Send Announcement'
                )}
              </button>
            </div>
            </form>

            <div className="announcements-preview-section">
              <h3>Preview</h3>
              <div 
                className="announcements-preview-card" 
                style={{ borderLeftColor: getTypeColor(formData.type) }}
                data-type={formData.type}
              >
                <div className="announcements-preview-header">
                  <span className="announcements-preview-icon" style={{ color: getTypeColor(formData.type) }}>
                    {getTypeIcon(formData.type)}
                  </span>
                  <div className="announcements-preview-title">
                    <strong>{formData.title || "Announcement Title"}</strong>
                    <span className="announcements-preview-type" style={{ color: getTypeColor(formData.type) }}>
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
        </div>
      </div>
    </div>
  );
}