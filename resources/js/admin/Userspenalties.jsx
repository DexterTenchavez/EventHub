import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./admin-css/userspenalties.css";

const barangaysWithPuroks = {
  "Anibongan": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Babag": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Cagawasan": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Cagawitan": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Caluasan": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Candelaria": ["Purok 1", "Purok 2", "Purok 3", "Purok 4"],
  "Can-oling": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Estaca": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "La Esperanza": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Liberty": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Magcagong": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Malibago": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Mampas": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Napo": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Poblacion": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "San Isidro": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "San Jose": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "San Miguel": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "San Roque": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "San Vicente": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santo Rosario": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santa Cruz": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santa Fe": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santa Lucia": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santa Rosa": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santo Niño": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santo Tomas": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Santo Niño de Panglao": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Taytay": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
  "Tigbao": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"]
};

const barangays = Object.keys(barangaysWithPuroks);

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default function Userspenalties({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [groupBy, setGroupBy] = useState('all');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedPurok, setSelectedPurok] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      fetchAllData();
    } else {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You must be an admin to view this page.',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchUsers(),
        fetchEvents()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      
      if (err.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonText: 'OK'
        }).then(() => {
          handleLogout();
        });
      } else if (err.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: 'You do not have permission to access this page.',
          confirmButtonText: 'OK'
        });
      } else {
        setError("Failed to load data");
        Swal.fire({
          icon: 'error',
          title: 'Loading Failed',
          text: 'Failed to load data. Please check your connection and try again.',
          confirmButtonText: 'Retry'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      throw err;
    }
  };

  const showUserAttendanceDetails = (user) => {
    setSelectedUser(user);
    setShowAttendanceModal(true);
  };

  // Get registrations from events data
  const getAllRegistrations = () => {
    const allRegistrations = [];
    events.forEach(event => {
      if (event.registrations && Array.isArray(event.registrations)) {
        event.registrations.forEach(reg => {
          allRegistrations.push({
            ...reg,
            eventId: event.id,
            eventName: event.title || event.name,
            eventDate: event.date,
            eventLocation: event.location,
            eventStartTime: event.start_time,
            eventEndTime: event.end_time
          });
        });
      }
    });
    return allRegistrations;
  };

  // Get users with their registration data
  const getUsersWithRegistrations = () => {
    const allRegistrations = getAllRegistrations();
    
    return users.map(user => ({
      ...user,
      registrations: allRegistrations.filter(reg => 
        reg.userId === user.id || reg.email === user.email
      ),
      // Calculate attendance stats
      presentCount: allRegistrations.filter(reg => 
        (reg.userId === user.id || reg.email === user.email) && reg.attendance === 'present'
      ).length,
      absentCount: allRegistrations.filter(reg => 
        (reg.userId === user.id || reg.email === user.email) && reg.attendance === 'absent'
      ).length,
      pendingCount: allRegistrations.filter(reg => 
        (reg.userId === user.id || reg.email === user.email) && (!reg.attendance || reg.attendance === 'pending')
      ).length,
    }));
  };

  // Filter users based on grouping and search
  const getFilteredUsers = () => {
    const usersWithRegistrations = getUsersWithRegistrations();
    
    let filtered = usersWithRegistrations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.barangay && user.barangay.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.purok && user.purok.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply group filter
    switch (groupBy) {
      case 'restricted':
        filtered = filtered.filter(u => u.penalties >= 3);
        break;
      case 'with_penalties':
        filtered = filtered.filter(u => u.penalties > 0 && u.penalties < 3);
        break;
      case 'clean':
        filtered = filtered.filter(u => u.penalties === 0);
        break;
      case 'barangay':
        if (selectedBarangay) {
          filtered = filtered.filter(u => u.barangay === selectedBarangay);
          if (selectedPurok) {
            filtered = filtered.filter(u => u.purok === selectedPurok);
          }
        }
        break;
      default:
        // All users
        break;
    }

    return filtered;
  };

  // Get users grouped by barangay for statistics
  const getUsersByBarangay = () => {
    const usersWithRegistrations = getUsersWithRegistrations();
    const barangayStats = {};
    
    barangays.forEach(barangay => {
      barangayStats[barangay] = usersWithRegistrations.filter(u => u.barangay === barangay);
    });
    
    return barangayStats;
  };

  const filteredUsers = getFilteredUsers();
  const barangayStats = getUsersByBarangay();

  // Close mobile menu when clicking on a link
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Add penalty with SweetAlert
  const handleAddPenalty = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      
      const result = await Swal.fire({
        title: 'Add Penalty?',
        text: `This will add a penalty to ${user?.name || 'this user'}. User will be restricted from registering for events after 3 penalties.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Add Penalty',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        background: '#1e1e1e',
        color: 'white'
      });

      if (result.isConfirmed) {
        await api.post(`/users/${id}/penalty`);
        
        Swal.fire({
          icon: 'success',
          title: 'Penalty Added!',
          text: 'Penalty has been successfully added to the user.',
          confirmButtonText: 'OK',
          background: '#1e1e1e',
          color: 'white'
        });
        
        fetchUsers();
      }
    } catch (err) {
      console.error("Error adding penalty:", err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Penalty',
        text: err.response?.data?.message || 'Please try again.',
        confirmButtonText: 'OK',
        background: '#1e1e1e',
        color: 'white'
      });
    }
  };

  // Decrease penalty with SweetAlert
  const handleDecreasePenalty = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      
      const result = await Swal.fire({
        title: 'Remove Penalty?',
        text: `This will remove one penalty from ${user?.name || 'this user'}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove Penalty',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        background: '#1e1e1e',
        color: 'white'
      });

      if (result.isConfirmed) {
        await api.post(`/users/${id}/penalty/decrease`);
        
        Swal.fire({
          icon: 'success',
          title: 'Penalty Removed!',
          text: 'Penalty has been successfully removed from the user.',
          confirmButtonText: 'OK',
          background: '#1e1e1e',
          color: 'white'
        });
        
        fetchUsers();
      }
    } catch (err) {
      console.error("Error decreasing penalty:", err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Remove Penalty',
        text: err.response?.data?.message || 'Please try again.',
        confirmButtonText: 'OK',
        background: '#1e1e1e',
        color: 'white'
      });
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      background: '#1e1e1e',
      color: 'white'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/logout');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        onLogout();
        
        Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          confirmButtonText: 'OK',
          timer: 2000,
          background: '#1e1e1e',
          color: 'white'
        }).then(() => {
          window.location.href = "/";
        });
        
      } catch (error) {
        console.error("Logout failed:", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        onLogout();
        window.location.href = "/";
      }
    }
  };

  // Calculate user statistics
  const getUserStats = () => {
    const totalUsers = users.filter(u => u.role === "user").length;
    const usersWithPenalties = users.filter(u => u.role === "user" && u.penalties > 0 && u.penalties < 3).length;
    const restrictedUsers = users.filter(u => u.role === "user" && u.penalties >= 3).length;
    const cleanUsers = users.filter(u => u.role === "user" && u.penalties === 0).length;
    
    return { totalUsers, usersWithPenalties, restrictedUsers, cleanUsers };
  };

  const userStats = getUserStats();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get available puroks for selected barangay
  const getAvailablePuroks = () => {
    if (!selectedBarangay) return [];
    return barangaysWithPuroks[selectedBarangay] || [];
  };

  // Reset purok when barangay changes
  useEffect(() => {
    setSelectedPurok('');
  }, [selectedBarangay]);

  // Add loading and error states at the beginning of return
  if (loading) {
    return (
      <div className="penalty-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users and penalties data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="penalty-page">
        <div className="error-message">
          <h2>Error Loading Page</h2>
          <p>{error}</p>
          <button onClick={fetchAllData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="penalty-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be an admin to view this page.</p>
          <Link to="/">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="penalty-page">
      <div className="penalty-topbar">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub</h3>
         <button className="logout-btn" onClick={handleLogout}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#100e0fff" style={{marginRight: '8px'}}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
  <span className="logout-text">Logout</span>
</button>
      </div>

      <div className={`penalty-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/admin-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
          <li className="penalty-currentpage">
            <Link to="/users-penalties" onClick={handleNavClick}>👥 Users & Penalties</Link>
          </li>
        </ul>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="penalty-content">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-header">
            <h2>User Management</h2>
            <p>Manage user penalties and monitor attendance status</p>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by name, email, barangay, or purok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              Search
            </button>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Filter Users:</label>
              <select 
                value={groupBy} 
                onChange={(e) => {
                  setGroupBy(e.target.value);
                  setSelectedBarangay('');
                  setSelectedPurok('');
                }}
                className="filter-select"
              >
                <option value="all">👥 All Users</option>
                <option value="restricted">🚫 Restricted Users (3+ penalties)</option>
                <option value="with_penalties">⚠️ Users with Penalties</option>
                <option value="clean">✅ Clean Users</option>
                <option value="barangay">🏘️ By Barangay</option>
              </select>
            </div>

            {groupBy === 'barangay' && (
              <>
                <div className="filter-group">
                  <label>Select Barangay:</label>
                  <select 
                    value={selectedBarangay} 
                    onChange={(e) => setSelectedBarangay(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Barangays</option>
                    {barangays.map(barangay => (
                      <option key={barangay} value={barangay}>{barangay}</option>
                    ))}
                  </select>
                </div>

                {selectedBarangay && (
                  <div className="filter-group">
                    <label>Select Purok:</label>
                    <select 
                      value={selectedPurok} 
                      onChange={(e) => setSelectedPurok(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Puroks</option>
                      {getAvailablePuroks().map(purok => (
                        <option key={purok} value={purok}>{purok}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Barangay Statistics */}
        {groupBy === 'barangay' && !selectedBarangay && (
          <div className="penalty-section">
            <div className="section-header">
              <h2>🏘️ Barangay Statistics</h2>
              <p>Click on a barangay to view its users</p>
            </div>
            <div className="barangay-stats-grid">
              {barangays.map(barangay => {
                const barangayUsers = barangayStats[barangay] || [];
                const totalUsers = barangayUsers.length;
                const restrictedUsers = barangayUsers.filter(u => u.penalties >= 3).length;
                
                if (totalUsers === 0) return null;
                
                return (
                  <div key={barangay} className="barangay-stat-card">
                    <h4>{barangay}</h4>
                    <div className="barangay-numbers">
                      <div className="barangay-total">{totalUsers} users</div>
                      {restrictedUsers > 0 && (
                        <div className="barangay-restricted">{restrictedUsers} restricted</div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedBarangay(barangay);
                        setGroupBy('barangay');
                      }}
                      className="view-barangay-btn"
                    >
                      👁️ View Users
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="penalty-section">
          <div className="section-header">
            <h2>
              {groupBy === 'barangay' && selectedBarangay ? `🏘️ Users from ${selectedBarangay}` : 
               groupBy === 'restricted' ? '🚫 Restricted Users' :
               groupBy === 'with_penalties' ? '⚠️ Users with Penalties' :
               groupBy === 'clean' ? '✅ Clean Users' : '👥 All Users'} 
              <span className="user-count">({filteredUsers.length} users)</span>
            </h2>
            {searchTerm && (
              <div className="search-indicator">
                🔍 Search: "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="penalty-table-container">
            <table className="penalty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Barangay</th>
                  <th>Purok</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Pending</th>
                  <th>Total</th>
                  <th>Penalties</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter((u) => u.role === "user")
                    .map((u) => {
                      const totalEvents = u.registrations.length;

                      return (
                        <tr key={u.id} className="user-row">
                          <td 
                            className="user-name"
                            onClick={() => showUserAttendanceDetails(u)} 
                          >
                            <div className="name-wrapper">
                              <span className="name">{u.name}</span>
                              <span className="click-hint">👁️ View</span>
                            </div>
                          </td>
                          <td className="user-email">{u.email}</td>
                          <td>
                            <span className="barangay-badge">
                              {u.barangay || 'Not specified'}
                            </span>
                          </td>
                          <td>
                            <span className="purok-badge">
                              {u.purok || 'Not specified'}
                            </span>
                          </td>
                          <td className="attendance-present">
                            <div className="attendance-count">{u.presentCount}</div>
                            <div className="attendance-label">Present</div>
                          </td>
                          <td className="attendance-absent">
                            <div className="attendance-count">{u.absentCount}</div>
                            <div className="attendance-label">Absent</div>
                          </td>
                          <td className="attendance-pending">
                            <div className="attendance-count">{u.pendingCount}</div>
                            <div className="attendance-label">Pending</div>
                          </td>
                          <td className="attendance-total">
                            <div className="attendance-count">{totalEvents}</div>
                            <div className="attendance-label">Total</div>
                          </td>
                          <td className={
                            u.penalties >= 3 ? "penalty-high" :
                            u.penalties > 0 ? "penalty-warning" : "penalty-none"
                          }>
                            {u.penalties}
                          </td>
                          <td>
                            {u.penalties >= 3 ? (
                              <span className="status-banned">🚫 Restricted</span>
                            ) : u.penalties > 0 ? (
                              <span className="status-warning">⚠️ Warning</span>
                            ) : (
                              <span className="status-clean">✅ Clean</span>
                            )}
                          </td>
                          <td className="action-buttons">
                            <button
                              className="add-penalty-btn"
                              onClick={() => handleAddPenalty(u.id)}
                              disabled={u.penalties >= 3}
                              title="Add penalty"
                            >
                              ➕ Penalty
                            </button>
                            <button
                              className="remove-penalty-btn"
                              onClick={() => handleDecreasePenalty(u.id)}
                              disabled={u.penalties <= 0}
                              title="Remove penalty"
                            >
                              ➖ Penalty
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="11" className="no-data">
                      <div className="no-data-content">
                        <div className="no-data-icon">📭</div>
                        <p>No users found in this category</p>
                        {searchTerm && (
                          <button 
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance Overview Modal */}
      {showAttendanceModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                📊 Attendance Overview: {selectedUser.name}
              </h2>
              <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="attendance-summary">
                <div className="summary-cards">
                  <div className="summary-card present">
                    <h4>✅ Present</h4>
                    <div className="summary-count">{selectedUser.presentCount || 0}</div>
                    <p>Events attended</p>
                  </div>
                  <div className="summary-card absent">
                    <h4>❌ Absent</h4>
                    <div className="summary-count">{selectedUser.absentCount || 0}</div>
                    <p>Events missed</p>
                  </div>
                  <div className="summary-card pending">
                    <h4>⏳ Pending</h4>
                    <div className="summary-count">{selectedUser.pendingCount || 0}</div>
                    <p>Awaiting status</p>
                  </div>
                  <div className="summary-card total">
                    <h4>📋 Total</h4>
                    <div className="summary-count">{selectedUser.registrations?.length || 0}</div>
                    <p>All registrations</p>
                  </div>
                </div>
              </div>

              <div className="event-registrations">
                <h3>🎯 Event Registrations</h3>
                {selectedUser.registrations && selectedUser.registrations.length > 0 ? (
                  <div className="registrations-table-container">
                    <table className="registrations-table">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.registrations.map((reg) => (
                          <tr key={reg.id}>
                            <td className="event-name">{reg.eventName || 'Unknown Event'}</td>
                            <td className="event-date">{formatDate(reg.eventDate)}</td>
                            <td className="event-location">{reg.eventLocation || 'N/A'}</td>
                            <td className="event-time">
                              {formatTime(reg.eventStartTime)} - {formatTime(reg.eventEndTime)}
                            </td>
                            <td>
                              <span className={`attendance-status ${reg.attendance}`}>
                                {reg.attendance || 'pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-registrations">
                    <div className="no-data-icon">📭</div>
                    <p>No event registrations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}