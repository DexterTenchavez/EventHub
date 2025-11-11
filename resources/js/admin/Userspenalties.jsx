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
  "Candelaria": ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6", "Purok 7"],
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

// Create axios instance with enhanced debugging
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Enhanced request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: true,
      tokenPreview: token.substring(0, 20) + '...'
    });
  } else {
    console.warn(`⚠️ [REQUEST] ${config.method?.toUpperCase()} ${config.url} - NO TOKEN`);
  }
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [RESPONSE] ${response.status} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [RESPONSE ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.response?.status === 401) {
      console.warn('🛑 Authentication failed, redirecting to login...');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server not responding');
    }
    
    if (error.code === 'NETWORK_ERROR') {
      console.error('🌐 Network error - check server connection');
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
  const [attendanceFilter, setAttendanceFilter] = useState('all');
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
      
      console.log('🔄 Starting data fetch...', {
        currentUser: currentUser?.role,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });

      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Admin privileges required');
      }

      // Use Promise.allSettled to handle individual failures gracefully
      const [usersResult, eventsResult] = await Promise.allSettled([
        fetchUsers(),
        fetchEvents()
      ]);

      console.log('📊 Fetch results:', {
        users: usersResult.status,
        events: eventsResult.status
      });

      // Handle users result
      if (usersResult.status === 'fulfilled') {
        console.log('✅ Users loaded successfully');
      } else {
        console.warn('⚠️ Users fetch failed:', usersResult.reason);
        setUsers([]);
      }

      // Handle events result
      if (eventsResult.status === 'fulfilled') {
        console.log('✅ Events loaded successfully');
      } else {
        console.warn('⚠️ Events fetch failed:', eventsResult.reason);
        setEvents([]);
      }

      // If both failed, show error
      if (usersResult.status === 'rejected' && eventsResult.status === 'rejected') {
        throw new Error('Failed to load both users and events data');
      }

    } catch (err) {
      console.error("💥 Error in fetchAllData:", err);
      const errorMessage = err.message || "Failed to load data. Please check if the server is running.";
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Data Load Error',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>Error:</strong> ${errorMessage}</p>
            <p style="margin-top: 10px; color: #ccc;">
              Check browser console for detailed error information.
            </p>
          </div>
        `,
        confirmButtonText: 'OK',
        background: '#1e1e1e',
        color: 'white'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("🔄 fetchUsers called...");
      console.log("📝 Current user:", currentUser);
      console.log("🔑 Token exists:", localStorage.getItem('token') ? 'YES' : 'NO');
      
      const token = localStorage.getItem('token');
      console.log("🔐 Token content:", token ? `${token.substring(0, 20)}...` : 'MISSING');

      // Test the debug endpoint first
      console.log("🧪 Testing debug endpoint...");
      try {
        const debugRes = await api.get("/debug-auth");
        console.log("✅ Debug endpoint success:", debugRes.data);
      } catch (debugErr) {
        console.error("❌ Debug endpoint failed:", debugErr.response?.data || debugErr.message);
      }

      console.log("📡 Making actual users API call to /api/users...");
      const res = await api.get("/users");
      
      console.log("✅ Users API response received:", {
        status: res.status,
        dataLength: res.data?.length,
        firstUser: res.data?.[0]
      });
      
      setUsers(res.data || []);
      return res.data;
    } catch (err) {
      console.error("💥 Error fetching users:", err);
      console.error("🔍 Error details:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      });
      
      let errorMessage = "Failed to load users";
      if (err.response?.status === 403) {
        const serverMessage = err.response?.data?.message || 'Admin access required';
        const userRole = err.response?.data?.your_role || 'unknown';
        errorMessage = `${serverMessage}. Your role: ${userRole}`;
        
        console.error("🚫 Admin access denied details:", {
          serverMessage,
          userRole,
          requiredRole: 'admin',
          currentUserRole: currentUser?.role
        });
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed - please login again";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - server not responding";
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = "Network error - check server connection";
      }
      
      console.error("📢 Final error message:", errorMessage);
      
      setUsers([]);
      throw err;
    }
  };

  const fetchEvents = async () => {
    try {
      console.log("🔄 fetchEvents called...");
      
      const res = await api.get("/events");
      console.log("✅ Events API response:", {
        status: res.status,
        dataLength: res.data?.length,
        firstEvent: res.data?.[0]
      });
      
      setEvents(res.data || []);
      return res.data;
    } catch (err) {
      console.error("💥 Error fetching events:", err);
      console.error("🔍 Events error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      
      setEvents([]);
      throw err;
    }
  };

  const showUserAttendanceDetails = (user) => {
    setSelectedUser(user);
    setShowAttendanceModal(true);
    setAttendanceFilter('all');
  };

  const getAllRegistrations = () => {
    const allRegistrations = [];
    
    if (!events || !Array.isArray(events)) {
      return allRegistrations;
    }
    
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

  const getUsersWithRegistrations = () => {
    const allRegistrations = getAllRegistrations();
    
    if (!users || !Array.isArray(users)) {
      return [];
    }
    
    return users.map(user => ({
      ...user,
      registrations: allRegistrations.filter(reg => 
        reg.userId === user.id || reg.email === user.email
      ),
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

  const getFilteredUsers = () => {
    const usersWithRegistrations = getUsersWithRegistrations();
    
    let filtered = usersWithRegistrations;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.barangay && user.barangay.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.purok && user.purok.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

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
        break;
    }

    return filtered;
  };

  const getFilteredRegistrations = () => {
    if (!selectedUser || !selectedUser.registrations) return [];
    
    if (attendanceFilter === 'all') {
      return selectedUser.registrations;
    }
    
    return selectedUser.registrations.filter(reg => reg.attendance === attendanceFilter);
  };

  const getUsersByBarangay = () => {
    const usersWithRegistrations = getUsersWithRegistrations();
    const barangayStats = {};
    
    barangays.forEach(barangay => {
      barangayStats[barangay] = usersWithRegistrations.filter(u => u.barangay === barangay);
    });
    
    return barangayStats;
  };

  const filteredUsers = getFilteredUsers();
  const filteredRegistrations = getFilteredRegistrations();
  const barangayStats = getUsersByBarangay();

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

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
      } catch (error) {
        console.error("Logout API call failed:", error);
      } finally {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        onLogout();
        window.location.href = "/";
      }
    }
  };

  const getUserStats = () => {
    if (!users || !Array.isArray(users)) {
      return { totalUsers: 0, usersWithPenalties: 0, restrictedUsers: 0, cleanUsers: 0 };
    }
    
    const totalUsers = users.filter(u => u.role === "user").length;
    const usersWithPenalties = users.filter(u => u.role === "user" && u.penalties > 0 && u.penalties < 3).length;
    const restrictedUsers = users.filter(u => u.role === "user" && u.penalties >= 3).length;
    const cleanUsers = users.filter(u => u.role === "user" && u.penalties === 0).length;
    
    return { totalUsers, usersWithPenalties, restrictedUsers, cleanUsers };
  };

  const userStats = getUserStats();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAvailablePuroks = () => {
    if (!selectedBarangay) return [];
    return barangaysWithPuroks[selectedBarangay] || [];
  };

  useEffect(() => {
    setSelectedPurok('');
  }, [selectedBarangay]);

  const handleSummaryCardClick = (filter) => {
    setAttendanceFilter(filter);
  };

  const isSummaryCardActive = (filter) => {
    return attendanceFilter === filter;
  };

  if (loading) {
    return (
      <div className="penalty-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users and penalties data...</p>
          <button onClick={() => setLoading(false)} style={{marginTop: '10px'}}>
            Cancel Loading
          </button>
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
          <button onClick={() => setError(null)} style={{marginLeft: '10px'}}>
            Continue Anyway
          </button>
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
         <div className="logo-title-container">
    <img 
      src="/images/logo.jpg" 
      alt="EventHub Logo" 
      className="topbar-logo"
    />
    <h3 className="title">EventHub</h3>
  </div>
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
           <li>
            <Link to="/announcements" onClick={handleNavClick}>📢 Announcement</Link>
          </li>
          <li className="penalty-currentpage">
            <Link to="/users-penalties" onClick={handleNavClick}>👥⚠️ Users & Penalties</Link>
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
        <div className="search-filter-section">
          <div className="search-header">
            <h2>User Management</h2>
            <p>Manage user penalties and monitor attendance status</p>
            <div className="data-status">
              <span>Users loaded: {users.length}</span>
              <span>Events loaded: {events.length}</span>
            </div>
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
                  <th>Penalties</th>
                  <th>Ban Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter((u) => u.role === "user")
                    .map((u) => {
                      const totalEvents = u.registrations ? u.registrations.length : 0;
                      const isBanned = u.penalties >= 3;
                      const banDays = u.banned_until ? Math.ceil((new Date(u.banned_until) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                      const isCurrentlyBanned = u.banned_until && new Date(u.banned_until) > new Date();

                      return (
                        <tr key={u.id} className="user-row" onClick={() => showUserAttendanceDetails(u)}>
                          <td className="user-name">
                            <div className="name-wrapper">
                              <span className="name">{u.name}</span>
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
                        
                         
                          <td className={
                            u.penalties >= 3 ? "penalty-high" :
                            u.penalties > 0 ? "penalty-warning" : "penalty-none"
                          }>
                            {u.penalties || 0}
                          </td>
                          <td className="ban-duration">
                            {isCurrentlyBanned ? (
                              <div className="ban-info">
                                <div className="ban-days">{banDays} days left</div>
                                <div className="ban-date">Until {formatDate(u.banned_until)}</div>
                              </div>
                            ) : isBanned ? (
                              <div className="ban-expired">
                                Ban expired
                              </div>
                            ) : (
                              <div className="no-ban">
                                No ban
                              </div>
                            )}
                          </td>
                          <td>
                            {isCurrentlyBanned ? (
                              <span className="status-banned">🚫 Banned</span>
                            ) : u.penalties >= 3 ? (
                              <span className="status-restricted">⚠️ Restricted</span>
                            ) : u.penalties > 0 ? (
                              <span className="status-warning">⚠️ Warning</span>
                            ) : (
                              <span className="status-clean">✅ Clean</span>
                            )}
                          </td>
                          <td className="action-buttons">
                            <button
                              className="add-penalty-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddPenalty(u.id);
                              }}
                              disabled={u.penalties >= 3}
                              title="Add penalty"
                            >
                              ➕ Penalty
                            </button>
                            <button
                              className="remove-penalty-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecreasePenalty(u.id);
                              }}
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
                    <td colSpan="12" className="no-data">
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
                        <button 
                          className="clear-search-btn"
                          onClick={fetchAllData}
                          style={{marginTop: '10px'}}
                        >
                          Refresh Data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAttendanceModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                📊 Attendance Overview
                {attendanceFilter !== 'all' && (
                  <span style={{fontSize: '0.8rem', marginLeft: '10px', opacity: '0.8'}}>
                    (Filtered: {attendanceFilter})
                  </span>
                )}
              </h2>
              <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-details-header">
                <div className="user-basic-info">
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <p>{selectedUser.barangay} • {selectedUser.purok}</p>
                </div>
                <div className="user-penalty-info">
                  <div className={`penalty-status ${selectedUser.penalties >= 3 ? 'banned' : selectedUser.penalties > 0 ? 'warning' : 'clean'}`}>
                    <strong>Penalties: {selectedUser.penalties || 0}/3</strong>
                  </div>
                  {selectedUser.banned_until && new Date(selectedUser.banned_until) > new Date() && (
                    <div className="ban-details">
                      <strong>🚫 Banned for {Math.ceil((new Date(selectedUser.banned_until) - new Date()) / (1000 * 60 * 60 * 24))} more days</strong>
                      <p>Until: {formatDate(selectedUser.banned_until)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="attendance-summary">
                <div className="summary-cards">
                  <div 
                    className={`summary-card present ${isSummaryCardActive('present') ? 'active' : ''}`}
                    onClick={() => handleSummaryCardClick('present')}
                  >
                    <h4>✅ Present</h4>
                    <div className="summary-count">{selectedUser.presentCount || 0}</div>
                    <p>Events attended</p>
                  </div>
                  <div 
                    className={`summary-card absent ${isSummaryCardActive('absent') ? 'active' : ''}`}
                    onClick={() => handleSummaryCardClick('absent')}
                  >
                    <h4>❌ Absent</h4>
                    <div className="summary-count">{selectedUser.absentCount || 0}</div>
                    <p>Events missed</p>
                  </div>
                  <div 
                    className={`summary-card pending ${isSummaryCardActive('pending') ? 'active' : ''}`}
                    onClick={() => handleSummaryCardClick('pending')}
                  >
                    <h4>⏳ Pending</h4>
                    <div className="summary-count">{selectedUser.pendingCount || 0}</div>
                    <p>Awaiting status</p>
                  </div>
                  <div 
                    className={`summary-card total ${isSummaryCardActive('all') ? 'active' : ''}`}
                    onClick={() => handleSummaryCardClick('all')}
                  >
                    <h4>📋 Total</h4>
                    <div className="summary-count">{selectedUser.registrations ? selectedUser.registrations.length : 0}</div>
                    <p>All registrations</p>
                  </div>
                </div>
              </div>

              <div className="event-registrations">
                <h3>🎯 Event Registrations ({filteredRegistrations.length})</h3>
                {filteredRegistrations.length > 0 ? (
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
                        {filteredRegistrations.map((reg) => (
                          <tr key={reg.id}>
                            <td className="event-name">{reg.eventName || 'Unknown Event'}</td>
                            <td className="event-date">{formatDate(reg.eventDate)}</td>
                            <td className="event-location">{reg.eventLocation || 'N/A'}</td>
                            <td className="event-time">
                              {formatTime(reg.eventStartTime)} - {formatTime(reg.eventEndTime)}
                            </td>
                            <td>
                              <span className={`attendance-status ${reg.attendance}`}>
                                {reg.attendance === 'present' ? '✅ Present' : 
                                 reg.attendance === 'absent' ? '❌ Absent' : 
                                 '⏳ Pending'}
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
                    <p>No event registrations found{attendanceFilter !== 'all' ? ` with ${attendanceFilter} status` : ''}</p>
                    {attendanceFilter !== 'all' && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setAttendanceFilter('all')}
                        style={{marginTop: '10px'}}
                      >
                        Show All Registrations
                      </button>
                    )}
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