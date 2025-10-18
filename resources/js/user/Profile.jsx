// Profile.jsx
import "./user-css/Profile.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Profile({ currentUser, onLogout }) {
  const [userStats, setUserStats] = useState({
    penalties: 0,
    registeredEvents: 0,
    attendedEvents: 0,
    missedEvents: 0,
    upcomingEvents: 0
  });
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
      loadProfilePicture();
    }
  }, [currentUser]);

  const loadProfilePicture = () => {
    // Try to load profile picture from localStorage
    const savedProfilePic = localStorage.getItem(`profilePicture_${currentUser.id}`);
    if (savedProfilePic) {
      setProfilePicture(savedProfilePic);
    } else {
      // Set default profile picture based on user's name
      setProfilePicture(generateDefaultAvatar(currentUser.name));
    }
  };

  const generateDefaultAvatar = (name) => {
    // Generate initials for default avatar
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    // Create a simple SVG avatar with initials
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#4caf50" />
        <text x="50" y="55" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user events and statistics
      const eventsRes = await axios.get("http://localhost:8000/api/events");
      const userRes = await axios.get("http://localhost:8000/api/users");
      
      console.log("All events:", eventsRes.data); // Debug log
      console.log("Current user:", currentUser); // Debug log
      
      const currentUserData = userRes.data.find(u => u.id === currentUser.id);
      const allEvents = eventsRes.data;
      
      // Calculate user statistics
      const userRegistrations = allEvents.flatMap(event => 
        event.registrations?.filter(reg => reg.userId === currentUser.id || reg.email === currentUser.email) || []
      );
      
      console.log("User registrations:", userRegistrations); // Debug log
      
      const registeredEvents = userRegistrations.length;
      const attendedEvents = userRegistrations.filter(reg => reg.attendance === 'present').length;
      const missedEvents = userRegistrations.filter(reg => reg.attendance === 'absent').length;
      
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > new Date() && 
               event.registrations?.some(reg => 
                 reg.userId === currentUser.id || reg.email === currentUser.email
               );
      }).length;

      setUserStats({
        penalties: currentUserData?.penalties || 0,
        registeredEvents,
        attendedEvents,
        missedEvents,
        upcomingEvents
      });

      // Get user's registered events with details - FIXED EVENT NAME ACCESS
      const userEventDetails = allEvents.filter(event => 
        event.registrations?.some(reg => 
          reg.userId === currentUser.id || reg.email === currentUser.email
        )
      ).map(event => {
        const registration = event.registrations.find(reg => 
          reg.userId === currentUser.id || reg.email === currentUser.email
        );
        
        // FIX: Handle both 'title' and 'name' fields for event name
        const eventName = event.title || event.name || 'Unnamed Event';
        const eventDate = event.date || event.eventDate;
        const eventLocation = event.location || event.venue || 'Location not specified';
        
        console.log("Event data:", { 
          id: event.id, 
          title: event.title, 
          name: event.name, 
          finalName: eventName 
        }); // Debug log
        
        return {
          id: event.id,
          name: eventName, // Use the properly resolved event name
          date: eventDate,
          location: eventLocation,
          userAttendance: registration?.attendance || 'pending'
        };
      });

      console.log("User event details:", userEventDetails); // Debug log
      setUserEvents(userEventDetails);
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        
        // Save to localStorage
        localStorage.setItem(`profilePicture_${currentUser.id}`, imageData);
        setProfilePicture(imageData);
        
        // Here you can also send the image to your backend if you have one
        // await axios.post(`http://localhost:8000/api/users/${currentUser.id}/profile-picture`, {
        //   profilePicture: imageData
        // });
        
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
      setUploading(false);
    }
  };

  const removeProfilePicture = () => {
    localStorage.removeItem(`profilePicture_${currentUser.id}`);
    setProfilePicture(generateDefaultAvatar(currentUser.name));
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

  const getPenaltyStatus = () => {
    if (userStats.penalties >= 3) return { status: "Banned", color: "#ff5252", message: "You cannot register for events" };
    if (userStats.penalties >= 2) return { status: "High Risk", color: "#ff9800", message: "One more penalty will result in ban" };
    if (userStats.penalties >= 1) return { status: "Warning", color: "#ffca28", message: "Be careful with event attendance" };
    return { status: "Good Standing", color: "#4caf50", message: "No penalties on record" };
  };

  const penaltyStatus = getPenaltyStatus();

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

       <div className="back-container">
        <Link to="/user-dashboard" className="back-btn">
          <span className="back-icon">←</span>
          Back to Dashboard
        </Link>
      </div>
      
        <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <h1>User Profile</h1>
          <div className="user-info-card">
            <div className="user-basic-info">
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="profile-picture"
                    onError={(e) => {
                      e.target.src = generateDefaultAvatar(currentUser.name);
                    }}
                  />
                  <div className="profile-picture-overlay">
                    <label htmlFor="profile-picture-upload" className="upload-button">
                      {uploading ? 'Uploading...' : '📷'}
                    </label>
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="profile-picture-actions">
                  <label htmlFor="profile-picture-upload" className="change-picture-btn">
                    {uploading ? 'Uploading...' : 'Change Picture'}
                  </label>
                  <button 
                    type="button" 
                    className="remove-picture-btn"
                    onClick={removeProfilePicture}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="user-details">
                <h2>{currentUser.name}</h2>
                <p>{currentUser.email}</p>
                <div className="user-status" style={{ color: penaltyStatus.color }}>
                  Status: {penaltyStatus.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Penalty Status</h2>
          <div className="penalty-status-card" style={{ borderLeftColor: penaltyStatus.color }}>
            <div className="penalty-indicator">
              <div className="penalty-count" style={{ color: penaltyStatus.color }}>
                {userStats.penalties} / 3 Penalties
              </div>
              <div className="penalty-message">{penaltyStatus.message}</div>
            </div>
            <div className="penalty-progress">
              <div 
                className="penalty-bar" 
                style={{ 
                  width: `${(userStats.penalties / 3) * 100}%`,
                  backgroundColor: penaltyStatus.color
                }}
              ></div>
            </div>
            {userStats.penalties >= 3 && (
              <div className="ban-notice">
                ⚠️ You are currently banned from registering for new events.
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2>Event Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{userStats.registeredEvents}</div>
              <div className="stat-label">Total Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.attendedEvents}</div>
              <div className="stat-label">Events Attended</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.missedEvents}</div>
              <div className="stat-label">Events Missed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.upcomingEvents}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Your Events</h2>
          {userEvents.length > 0 ? (
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {userEvents.slice(0, 5).map((event) => (
                    <tr key={event.id}>
                      <td>{event.name}</td> {/* This should now display correctly */}
                      <td>{formatDate(event.date)}</td>
                      <td>{event.location}</td>
                      <td>
                        <span className={`attendance-status ${event.userAttendance}`}>
                          {event.userAttendance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userEvents.length > 5 && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#ccc' }}>
                  Showing 5 of {userEvents.length} events
                </div>
              )}
            </div>
          ) : (
            <div className="no-events">
              You haven't registered for any events yet.
            </div>
          )}
        </div>

       <div className="profile-section">
  <h2>Account Information</h2>
  <div className="account-info">
    <div className="info-item">
      <label>User ID:</label>
      <span>{currentUser.id}</span>
    </div>
    <div className="info-item">
      <label>Email:</label>
      <span>{currentUser.email}</span>
    </div>
    <div className="info-item">
      <label>Username:</label>
      <span>{currentUser.username || 'Not set'}</span>
    </div>
    <div className="info-item">
      <label>Full Name:</label>
      <span>{currentUser.name}</span>
    </div>
    <div className="info-item">
      <label>Contact Number:</label>
      <span>{currentUser.contactNo || 'Not provided'}</span>
    </div>
    <div className="info-item">
      <label>Sex:</label>
      <span>{currentUser.sex ? currentUser.sex.charAt(0).toUpperCase() + currentUser.sex.slice(1) : 'Not specified'}</span>
    </div>
    <div className="info-item">
      <label>Date of Birth:</label>
      <span>{currentUser.dob ? formatDate(currentUser.dob) : 'Not provided'}</span>
    </div>
    <div className="info-item">
      <label>Barangay:</label>
      <span>{currentUser.barangay || 'Not specified'}</span>
    </div>
    <div className="info-item">
      <label>Purok:</label>
      <span>{currentUser.purok || 'Not specified'}</span>
    </div>
    <div className="info-item">
  <label>Member Since:</label>
  <span>{currentUser.created_at ? formatDate(currentUser.created_at) : 'N/A'}</span>
</div>
    <div className="info-item">
      <label>Account Type:</label>
      <span>{currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Standard User'}</span>
    </div>
    <div className="info-item">
      <label>Penalties:</label>
      <span>{currentUser.penalties || 0}</span>
    </div>
  </div>
</div>
      </div>

      
    </div>
  );
}