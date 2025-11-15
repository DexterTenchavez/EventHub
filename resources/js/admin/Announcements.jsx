import "./admin-css/announcements.css";
import { useState, useEffect, useMemo } from "react";
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

  const loadAnnouncementHistory = async () => {
    try {
      setHistoryLoading(true);
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

  const deleteAnnouncement = async (announcementId, announcementTitle) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Announcement?',
        html: `Are you sure you want to permanently delete "<strong>${announcementTitle}</strong>"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete permanently!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        try {
          await axios.delete(`http://localhost:8000/api/notifications/announcements/${announcementId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          setAnnouncementHistory(prev => 
            prev.filter(announcement => announcement.id !== announcementId)
          );

          Swal.fire({
            title: 'Deleted!',
            text: 'Announcement has been permanently deleted.',
            icon: 'success',
            confirmButtonColor: '#4FC3F7'
          });
        } catch (backendError) {
          console.error('Backend delete error:', backendError);
          Swal.fire({
            title: 'Error',
            text: 'Failed to delete announcement from server',
            icon: 'error',
            confirmButtonColor: '#4FC3F7'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete announcement',
        icon: 'error',
        confirmButtonColor: '#4FC3F7'
      });
    }
  };

  const deleteAllAnnouncements = async () => {
  if (announcementHistory.length === 0) {
    Swal.fire({
      title: 'No Announcements',
      text: 'There are no announcements to delete.',
      icon: 'info',
      confirmButtonColor: '#4FC3F7'
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: 'Delete All Announcements?',
      html: `Are you sure you want to delete <strong>all ${announcementHistory.length} announcements</strong> from history?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem('token');
      
      // Call the backend API to delete all announcements
      await axios.delete('http://localhost:8000/api/notifications/announcements/delete-all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Clear from frontend
      setAnnouncementHistory([]);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'All announcements have been permanently deleted.',
        icon: 'success',
        confirmButtonColor: '#4FC3F7'
      });
    }
  } catch (error) {
    console.error('Error deleting all announcements:', error);
    Swal.fire({
      title: 'Error',
      text: 'Failed to delete announcements',
      icon: 'error',
      confirmButtonColor: '#4FC3F7'
    });
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

      const successMessage = `
        <div style="text-align: left;">
          <p>Your announcement has been sent successfully!</p>
          <p><strong>Sent to:</strong> ${response.data.sent_to}</p>
          ${response.data.emails_sent !== undefined ? 
            `<p><strong>Emails Sent:</strong> ${response.data.emails_sent}</p>` : ''}
          ${response.data.emails_failed > 0 ? 
            `<p style="color: orange;"><strong>Emails Failed:</strong> ${response.data.emails_failed}</p>` : ''}
        </div>
      `;

      Swal.fire({
        title: '✅ Announcement Sent!',
        html: successMessage,
        icon: 'success',
        confirmButtonColor: '#4FC3F7'
      });

      setFormData({
        title: "",
        message: "",
        type: "info",
        target_users: "all",
        barangay: ""
      });
      
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
        confirmButtonColor: '#4FC3F7'
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

  // Memoized compose component
  const composeContent = useMemo(() => (
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
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
                  data-type={type.value}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, target_users: e.target.value }))}
                  disabled={loading}
                />
                <span className="announcements-target-icon">{MaterialIcons.People}</span>
                <div className="announcements-target-info">
                  <div className="announcements-target-label">All Users</div>
                  <div className="announcements-target-description">Send to all registered users</div>
                </div>
              </label>

              <label className={`announcements-target-option ${formData.target_users === 'specific_barangay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="target_users"
                  value="specific_barangay"
                  checked={formData.target_users === 'specific_barangay'}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_users: e.target.value }))}
                  disabled={loading}
                />
                <span className="announcements-target-icon">{MaterialIcons.Location}</span>
                <div className="announcements-target-info">
                  <div className="announcements-target-label">Specific Barangay</div>
                  <div className="announcements-target-description">Send to users in a specific barangay</div>
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
                onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
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
    </div>
  ), [formData, loading, announcementTypes, barangays, handleSubmit]);

  const historyContent = useMemo(() => (
    <div className="announcements-history-section">
      <div className="announcements-history-header">
        <h3>{MaterialIcons.History} Announcement History</h3>
        <div className="announcements-history-actions">
          {announcementHistory.length > 0 && (
            <button 
              className="announcements-delete-all-btn"
              onClick={deleteAllAnnouncements}
              disabled={historyLoading}
            >
              {MaterialIcons.Delete} Delete All
            </button>
          )}
          <button 
            className="announcements-refresh-btn"
            onClick={loadAnnouncementHistory}
            disabled={historyLoading}
          >
            {historyLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
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
            <div key={announcement.id} className="announcements-history-card" data-type={announcement.type}>
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
                <button 
                  className="announcements-delete-btn"
                  onClick={() => deleteAnnouncement(announcement.id, announcement.title)}
                  title="Delete announcement from history"
                >
                  {MaterialIcons.Delete}
                </button>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ), [announcementHistory, historyLoading, deleteAnnouncement, deleteAllAnnouncements, loadAnnouncementHistory, getTypeIcon, formatDate]);

  return (
    <div className="announcements-body">
      <div className="announcements-topbar">
        <button 
          className="announcements-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <div className="announcements-logo-title-container">
          <img src="/images/logo.jpg" alt="EventHub Logo" className="topbar-logo" />
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
        <div className="announcements-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="announcements-admin-section">
        <div className="announcements-container">
          <div className="announcements-header-section">
            <div className="announcements-header-content">
              <h1>{MaterialIcons.Announcement} Send Announcement</h1>
              <p>Broadcast important messages to all users or specific barangays.</p>
            </div>
          </div>

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

          {activeTab === 'compose' ? composeContent : historyContent}
        </div>
      </div>
    </div>
  );
}