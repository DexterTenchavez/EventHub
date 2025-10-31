import "./user-css/Profile.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile({ currentUser, onLogout }) {
  const [userStats, setUserStats] = useState({
    penalties: 0,
    registeredEvents: 0,
    attendedEvents: 0,
    missedEvents: 0,
    upcomingEvents: 0,
    banned_until: null,
    penalty_expires_at: null
  });
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
      loadProfilePicture();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, get the current user data with penalties and ban info
      const userResponse = await axios.get('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.data) {
        const userData = userResponse.data;
        setUserStats({
          penalties: userData.penalties || 0,
          registeredEvents: userData.registered_events || 0,
          attendedEvents: userData.attended_events || 0,
          missedEvents: userData.missed_events || 0,
          upcomingEvents: userData.upcoming_events || 0,
          banned_until: userData.banned_until,
          penalty_expires_at: userData.penalty_expires_at
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to currentUser data from props
      setUserStats({
        penalties: currentUser.penalties || 0,
        registeredEvents: 0,
        attendedEvents: 0,
        missedEvents: 0,
        upcomingEvents: 0,
        banned_until: currentUser.banned_until,
        penalty_expires_at: currentUser.penalty_expires_at
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = () => {
    const savedProfilePic = localStorage.getItem(`profilePicture_${currentUser.id}`);
    if (savedProfilePic) {
      setProfilePicture(savedProfilePic);
    } else {
      setProfilePicture(generateDefaultAvatar(currentUser.name));
    }
  };

  const generateDefaultAvatar = (name) => {
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#4caf50"/><text x="50" y="55" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      localStorage.setItem(`profilePicture_${currentUser.id}`, imageData);
      setProfilePicture(imageData);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    localStorage.removeItem(`profilePicture_${currentUser.id}`);
    setProfilePicture(generateDefaultAvatar(currentUser.name));
  };

  const handleLogout = async () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    onLogout();
    window.location.href = "/";
  };

  const getPenaltyStatus = () => {
    // Check if user is currently banned
    const isBanned = userStats.banned_until && new Date(userStats.banned_until) > new Date();
    
    // Calculate remaining penalty days
    const penaltyExpiresIn = userStats.penalty_expires_at ? 
      Math.ceil((new Date(userStats.penalty_expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    if (isBanned) {
      const banDays = Math.ceil((new Date(userStats.banned_until) - new Date()) / (1000 * 60 * 60 * 24));
      return { 
        status: "Banned", 
        color: "#ff5252", 
        message: `You are banned from event registration for ${banDays} more days`,
        details: `Ban lifts on ${new Date(userStats.banned_until).toLocaleDateString()}`,
        warning: `You have ${userStats.penalties}/3 penalties`
      };
    }
    
    // If not banned, check penalty count
    if (userStats.penalties >= 3) {
      return { 
        status: "Banned", 
        color: "#ff5252", 
        message: "You have 3 penalties and are banned from event registration",
        details: `Penalties expire in ${penaltyExpiresIn} days`,
        warning: "Contact admin to remove penalties"
      };
    }
    if (userStats.penalties >= 2) {
      return { 
        status: "High Risk", 
        color: "#ff9800", 
        message: "One more penalty will result in a 30-day ban",
        details: `Penalties expire in ${penaltyExpiresIn} days`,
        warning: `You have ${userStats.penalties}/3 penalties`
      };
    }
    if (userStats.penalties >= 1) {
      return { 
        status: "Warning", 
        color: "#ffca28", 
        message: "Be careful with event attendance",
        details: `Penalties expire in ${penaltyExpiresIn} days`,
        warning: `You have ${userStats.penalties}/3 penalties`
      };
    }
    return { 
      status: "Good Standing", 
      color: "#4caf50", 
      message: "No penalties on record",
      details: "Keep up the good attendance!",
      warning: ""
    };
  };

  const penaltyStatus = getPenaltyStatus();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Debug function to check current ban status
  const checkBanStatus = () => {
    console.log('Current User Stats:', userStats);
    console.log('Banned Until:', userStats.banned_until);
    console.log('Is Banned:', userStats.banned_until && new Date(userStats.banned_until) > new Date());
    console.log('Current Date:', new Date());
    console.log('Banned Until Date:', userStats.banned_until ? new Date(userStats.banned_until) : 'null');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link to="/user-dashboard" className="back-btn">
          <span>← Back</span>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#100e0fff" style={{marginRight: '8px'}}>
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span className="logout-text">Logout</span>
        </button>
        
        {/* Debug button - remove in production */}
        <button 
          onClick={checkBanStatus} 
          style={{marginLeft: '10px', padding: '5px', fontSize: '12px', display: 'none'}}
        >
          Debug Ban
        </button>
      </div>

      <div className="profile-main">
        <div className="left-column">
          <div className="profile-card">
            <div className="profile-picture-section">
              <div className="profile-picture-container">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
                {uploading && <div className="upload-overlay">Uploading...</div>}
              </div>
              <div className="profile-info-compact">
                <h1>{currentUser.name}</h1>
                <p>{currentUser.email}</p>
                <div className="status-badge" style={{ background: penaltyStatus.color }}>
                  {penaltyStatus.status}
                </div>
              </div>
            </div>

            <div className="profile-actions-compact">
              <label htmlFor="profile-picture-upload" className="action-btn change-btn">
                Change Photo
              </label>
              <input 
                id="profile-picture-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePictureUpload} 
                style={{ display: 'none' }} 
              />
              <button className="action-btn remove-btn" onClick={removeProfilePicture}>
                Remove
              </button>
            </div>

            <div className="stats-compact">
              <div className="stat-compact">
                <div className="stat-number">{userStats.registeredEvents}</div>
                <div className="stat-label">Registered</div>
              </div>
              <div className="stat-compact">
                <div className="stat-number">{userStats.attendedEvents}</div>
                <div className="stat-label">Attended</div>
              </div>
              <div className="stat-compact">
                <div className="stat-number">{userStats.upcomingEvents}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-compact">
                <div className="stat-number">{userStats.penalties}</div>
                <div className="stat-label">Penalties</div>
              </div>
            </div>
          </div>

          <div className="penalty-card-compact">
            <h3>Account Status</h3>
            <div className="penalty-progress-compact">
              <span>{userStats.penalties}/3 penalties</span>
              <div className="progress-bar-compact">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(userStats.penalties / 3) * 100}%`, background: penaltyStatus.color }}
                ></div>
              </div>
            </div>
            <p className="penalty-message">{penaltyStatus.message}</p>
            <p className="penalty-details">{penaltyStatus.details}</p>
            {penaltyStatus.warning && (
              <p className="penalty-warning">{penaltyStatus.warning}</p>
            )}
            
            {userStats.banned_until && (
              <div className="ban-info">
                <strong>Ban End Date:</strong> {formatDate(userStats.banned_until)}
              </div>
            )}
            {userStats.penalty_expires_at && userStats.penalties > 0 && (
              <div className="penalty-info">
                <strong>Penalties Expire:</strong> {formatDate(userStats.penalty_expires_at)}
              </div>
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="personal-info-compact">
            <h2>Personal Information</h2>
            
            <div className="info-grid-compact">
              <div className="info-item-compact">
                <label>Full Name:</label>
                <span>{currentUser.name}</span>
              </div>
              <div className="info-item-compact">
                <label>Email:</label>
                <span>{currentUser.email}</span>
              </div>
              <div className="info-item-compact">
                <label>Contact:</label>
                <span>{currentUser.contactNo || 'Not provided'}</span>
              </div>
              <div className="info-item-compact">
                <label>Date of Birth:</label>
                <span>{formatDate(currentUser.dob)}</span>
              </div>
              <div className="info-item-compact">
                <label>Sex:</label>
                <span>{currentUser.sex ? currentUser.sex.charAt(0).toUpperCase() + currentUser.sex.slice(1) : 'Not specified'}</span>
              </div>
              <div className="info-item-compact">
                <label>Barangay:</label>
                <span>{currentUser.barangay || 'Not specified'}</span>
              </div>
              <div className="info-item-compact">
                <label>Purok:</label>
                <span>{currentUser.purok || 'Not specified'}</span>
              </div>
              <div className="info-item-compact">
                <label>Member Since:</label>
                <span>{formatDate(currentUser.created_at)}</span>
              </div>
              <div className="info-item-compact">
                <label>Account Type:</label>
                <span>{currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}