import "./user-css/Profile.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Profile({ currentUser, onLogout }) {
  const [userStats, setUserStats] = useState({
    penalties: 0,
    registeredEvents: 0,
    attendedEvents: 0,
    missedEvents: 0,
    upcomingEvents: 0
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

  const fetchUserData = async () => {
    setUserStats({
      penalties: currentUser.penalties || 0,
      registeredEvents: 5,
      attendedEvents: 3,
      missedEvents: 1,
      upcomingEvents: 1
    });
    setLoading(false);
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
    if (userStats.penalties >= 3) return { status: "Banned", color: "#ff5252", message: "You cannot register for events" };
    if (userStats.penalties >= 2) return { status: "High Risk", color: "#ff9800", message: "One more penalty will result in ban" };
    if (userStats.penalties >= 1) return { status: "Warning", color: "#ffca28", message: "Be careful with event attendance" };
    return { status: "Good Standing", color: "#4caf50", message: "No penalties on record" };
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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <Link to="/user-dashboard" className="back-btn">
          <span>← Back</span>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="profile-main">
        {/* Left Column - Profile Info */}
        <div className="left-column">
          <div className="profile-card">
            <div className="profile-picture-section">
              <div className="profile-picture-container">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
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
          </div>
        </div>

        {/* Right Column - All Personal Info */}
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