import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./admin-css/userspenalties.css";

export default function Userspenalties() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/users");
      console.log("Fetched users:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch all events with registrations
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

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

  // Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Logged out successfully");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
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
      if (event.registrations) {
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

  return (
    <div className="penalty-page">
      {/* Top bar */}
      <div className="penalty-topbars">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <h3 className="title">EventHub Admin</h3>
        <Link to="/" onClick={handleLogout}>
          Logout
        </Link>
      </div>

      {/* Sidebar */}
      <div className={`penalty-sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>
            <Link to="/admin-dashboard" onClick={handleNavClick}>Dashboard</Link>
          </li>
          <li className="penalty-currentpages">
            <Link to="/users-penalties" onClick={handleNavClick}>Users & Penalties</Link>
          </li>
        </ul>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="penalty-content">
        <h1>User & Penalty Management</h1>
        
        {/* User Statistics Cards */}
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

        {/* Attendance Statistics Cards */}
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

        {/* Users Table */}
        <div className="penalty-section">
          <h2>User Penalties</h2>
          <p>Manage user penalties and monitor user status.</p>
          
          <div className="penalty-table-container">
            <table className="penalty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered Events</th>
                  <th>Penalties</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users
                    .filter((u) => u.role === "user")
                    .map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.registrations_count || 0}</td>
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
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
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