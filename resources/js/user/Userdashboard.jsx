import "./user-css/Userdashboard.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

export default function Userdashboard({ events = [], setEvents, currentUser, onLogout }) {



useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  fetchEvents();
}, []);

  if (!currentUser) return <p>Loading...</p>;

  const handleRegisterToggle = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const isRegistered = event.registrations?.some(r => r.email === currentUser.email);

    try {
      let res;

      if (isRegistered) {
        // Unregister the user
        res = await axios.post(`http://localhost:8000/api/events/${eventId}/unregister`, { email: currentUser.email });
        alert("You have canceled your registration.");
      } else {
        // Register the user
       res = await axios.post(`http://localhost:8000/api/events/${eventId}/register`, {
  name: currentUser.name,
  email: currentUser.email,
});

      }

      // Update the local state only after backend confirms
      // Update events after successful register/unregister
if (res.data.event) {
  // Backend returned the full updated event (after register)
  setEvents(prevEvents =>
    prevEvents.map(ev =>
      ev.id === eventId ? res.data.event : ev
    )
  );
} else {
  // For unregister, remove the user manually
  setEvents(prevEvents =>
    prevEvents.map(ev =>
      ev.id === eventId
        ? {
            ...ev,
            registrations: (ev.registrations || []).filter(
              r => r.email !== currentUser.email
            ),
          }
        : ev
    )
  );
}


    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update registration. Please try again.");
    }
  };

  return (
    <div>
      <div className="user-topbar">
        <h3 className="title">EventHub</h3>
        <Link to="/" onClick={onLogout}>Logout</Link>
      </div>

      <div className="user-sidebar">
        <ul>
          <li className="user-currentpage"><Link to="/user-dashboard">Dashboard</Link></li>
          <li><Link to="/upcoming-events">Upcoming Events</Link></li>
          <li><Link to="/past-events">Past Events</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </div>

      <div className="user-content">
        <h1>User Dashboard</h1>
        <h2>Available Events</h2>

        {events.length === 0 ? (
          <p>No events yet. Please wait for the admin to create some!</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Location</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                const isRegistered = event.registrations?.some(r => r.email === currentUser.email);
                return (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.category}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.location}</td>
                    <td>{event.description}</td>
                    <td>{event.status || "upcoming"}</td>
                    <td>
                      <button onClick={() => handleRegisterToggle(event.id) }
                         className={isRegistered ? "cancel-btn" : "register-btn"}>
                        {isRegistered ? "Cancel" : "Register"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
