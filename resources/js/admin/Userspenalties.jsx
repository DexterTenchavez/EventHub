import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./admin-css/userspenalties.css";

export default function Userspenalties({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Userspenalties component mounted");
    console.log("Current user:", currentUser);
    
    if (currentUser && currentUser.role === "admin") {
      fetchAllData();
    } else {
      setLoading(false);
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
      // Don't fetch registrations for now since the endpoint doesn't exist
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const res = await axios.get("http://localhost:8000/api/users");
      console.log("Fetched users:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  };

  const fetchEvents = async () => {
    try {
      console.log("Fetching events...");
      const res = await axios.get("http://localhost:8000/api/events");
      console.log("Fetched events:", res.data);
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      throw err;
    }
  };

  // Get registrations from events data instead of separate API
  const getAllRegistrations = () => {
    const allRegistrations = [];
    events.forEach(event => {
      if (event.registrations && Array.isArray(event.registrations)) {
        event.registrations.forEach(reg => {
          allRegistrations.push({
            ...reg,
            eventId: event.id,
            eventName: event.title || event.name
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
      )
    }));
  };

  const usersWithRegistrations = getUsersWithRegistrations();

  // Rest of your component remains the same...
  // Close mobile menu when clicking on a link
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Add penalty
  const handleAddPenalty = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/users/${id}/penalty`);
      alert("Penalty added successfully!");
      fetchUsers(); // refresh user list
    } catch (err) {
      console.error("Error adding penalty:", err);
      alert("Failed to add penalty. Please try again.");
    }
  };

  // Decrease penalty
  const handleDecreasePenalty = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/users/${id}/penalty/decrease`);
      alert("Penalty decreased successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Error decreasing penalty:", err);
      alert("Failed to decrease penalty. Please try again.");
    }
  };

 const handleLogout = async () => {
  try {
    // Clear frontend storage first
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Send logout request to backend
    await fetch('http://localhost:8000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Call parent logout handler
    onLogout();
    
    // Redirect to login page
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
    // Even if backend fails, clear frontend and redirect
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    onLogout();
    window.location.href = "/";
  }
};

  // Calculate user statistics
  const getUserStats = () => {
    const totalUsers = users.filter(u => u.role === "user").length;
    const usersWithPenalties = users.filter(u => u.role === "user" && u.penalties > 0).length;
    const bannedUsers = users.filter(u => u.role === "user" && u.penalties >= 3).length;
    
    return { totalUsers, usersWithPenalties, bannedUsers };
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalPending = 0;

    events.forEach(event => {
      if (event.registrations && Array.isArray(event.registrations)) {
        event.registrations.forEach(reg => {
          if (reg.attendance === 'present') totalPresent++;
          else if (reg.attendance === 'absent') totalAbsent++;
          else totalPending++;
        });
      }
    });

    return { totalPresent, totalAbsent, totalPending };
  };

  const userStats = getUserStats();
  const attendanceStats = getAttendanceStats();

  // Add loading and error states at the beginning of return
  if (loading) {
    return (
      <div className="penalty-page">
        <div className="loading">Loading users and penalties data...</div>
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
      {/* Your existing JSX remains the same */}
      <div className="penalty-topbars">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub Admin</h3>
         <button className="logout-btn" onClick={handleLogout}>
    <span className="logout-icon">🚪</span>
    <span className="logout-text">Logout</span>
  </button>
      </div>

      <div className={`penalty-sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/admin-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
          <li className="penalty-currentpages">
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
        <h1>User & Penalty Management</h1>
        
        <div className="penalty-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-number">{userStats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Users with Penalties</h3>
            <div className="stat-number warning">{userStats.usersWithPenalties}</div>
          </div>
          <div className="stat-card">
            <h3>Banned Users</h3>
            <div className="stat-number danger">{userStats.bannedUsers}</div>
          </div>
        </div>

        <div className="penalty-section">
          <h2>Attendance Overview</h2>
          <div className="attendance-stats">
            <div className="stat-card present">
              <h3>Present</h3>
              <div className="stat-number">{attendanceStats.totalPresent}</div>
              <p>Users attended events</p>
            </div>
            <div className="stat-card absent">
              <h3>Absent</h3>
              <div className="stat-number">{attendanceStats.totalAbsent}</div>
              <p>Users missed events</p>
            </div>
            <div className="stat-card pending">
              <h3>Pending</h3>
              <div className="stat-number">{attendanceStats.totalPending}</div>
              <p>Attendance not set</p>
            </div>
            <div className="stat-card total">
              <h3>Total Registrations</h3>
              <div className="stat-number">{attendanceStats.totalPresent + attendanceStats.totalAbsent + attendanceStats.totalPending}</div>
              <p>All event registrations</p>
            </div>
          </div>
        </div>

        <div className="penalty-section">
          <h2>User Penalties & Attendance</h2>
          <p>Manage user penalties and monitor attendance status.</p>
          
          <div className="penalty-table-container">
            <table className="penalty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Pending</th>
                  <th>Total Events</th>
                  <th>Penalties</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersWithRegistrations.length > 0 ? (
                  usersWithRegistrations
                    .filter((u) => u.role === "user")
                    .map((u) => {
                      const userRegistrations = u.registrations || [];
                      const totalPresent = userRegistrations.filter(reg => reg.attendance === 'present').length;
                      const totalAbsent = userRegistrations.filter(reg => reg.attendance === 'absent').length;
                      const totalPending = userRegistrations.filter(reg => !reg.attendance || reg.attendance === 'pending').length;
                      const totalEvents = userRegistrations.length;

                      return (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td className="attendance-present">
                            <div className="attendance-count">{totalPresent}</div>
                            <div className="attendance-label">Present</div>
                          </td>
                          <td className="attendance-absent">
                            <div className="attendance-count">{totalAbsent}</div>
                            <div className="attendance-label">Absent</div>
                          </td>
                          <td className="attendance-pending">
                            <div className="attendance-count">{totalPending}</div>
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
                              <span className="status-banned">Banned</span>
                            ) : u.penalties > 0 ? (
                              <span className="status-warning">Warning</span>
                            ) : (
                              <span className="status-clean">Clean</span>
                            )}
                          </td>
                          <td className="action-buttons">
                            <button
                              className="add-penalty-btn"
                              onClick={() => handleAddPenalty(u.id)}
                              disabled={u.penalties >= 3}
                            >
                              + Add Penalty
                            </button>
                            <button
                              className="remove-penalty-btn"
                              onClick={() => handleDecreasePenalty(u.id)}
                              disabled={u.penalties <= 0}
                            >
                              - Remove Penalty
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}