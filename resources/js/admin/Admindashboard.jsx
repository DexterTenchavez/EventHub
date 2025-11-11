import "./admin-css/admindashboard.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function Admindashboard({ events, setEvents, onLogout, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");
  const [eventFeedbacks, setEventFeedbacks] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState('all');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "",
  });

  const categoryImages = {
    "Barangay Assembly": "/images/barangay_asssembly.jpg",
    "Medical Mission": "/images/Medical_mission.jpg",
    "Vaccination Drive": "/images/Vaccination.jpg",
    "Farming Seminar": "/images/Farmer_seminar.jpeg",
    "Town Fiesta": "/images/Town_fiesta.jpg",
    "Sports Tournament": "/images/SportsFestival.jpg",
    "Educational Seminar": "/images/Education_seminar.jpg",
    "Civil Registration": "/images/civil_reg.jpg",
    "Voters Registration": "/images/Voter_reg.avif",
    "Clean-up Drive": "/images/cleanup.jpg",
    "Wedding": "/images/wedding.jpg",
    "Tree Planting": "/images/treep_planting.jpg",
    "Dental Mission": "/images/dentalhealth.jpg",
    "Nutrition Program": "/images/nutrition.jpg",
    "TESDA Training": "/images/tesdacourses.jpg",
    "Palarong Barangay": "/images/palarong_barangay.jpg",
    "4Ps Payout": "/images/4ps.jpg",
    "Christmas Party": "/images/christmas.jpg",
    "Other": "/images/other.jpg",
  };

  const getCategoryImage = (category) => {
    if (!category) return "/images/other.jpg";
    
    if (categoryImages[category]) {
      return categoryImages[category];
    }
    
    const normalizedCategory = category.toLowerCase();
    const predefinedCategory = Object.keys(categoryImages).find(
      key => key.toLowerCase() === normalizedCategory
    );
    
    if (predefinedCategory) {
      return categoryImages[predefinedCategory];
    }
    
    return categoryImages["Other"] || "/images/other.jpg";
  };

  // Fetch event feedback
  const fetchEventFeedback = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/events/${eventId}/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setEventFeedbacks(prev => ({
        ...prev,
        [eventId]: res.data.feedback || []
      }));
      
      return res.data.feedback || [];
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      return [];
    }
  };

  // Load feedback for all events
  const loadAllFeedbacks = async () => {
    if (!events.length) return;
    
    try {
      const token = localStorage.getItem('token');
      const feedbackPromises = events.map(event => 
        axios.get(`http://localhost:8000/api/events/${event.id}/feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => ({ eventId: event.id, feedback: res.data.feedback || [] }))
        .catch(err => ({ eventId: event.id, feedback: [] }))
      );
      
      const results = await Promise.all(feedbackPromises);
      const feedbacksMap = {};
      results.forEach(result => {
        feedbacksMap[result.eventId] = result.feedback;
      });
      
      setEventFeedbacks(feedbacksMap);
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:8000/api/events", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:8000/api/users", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchEvents();
    fetchUsers();
  }, []);

  // Load feedback when events change
  useEffect(() => {
    if (events.length > 0) {
      loadAllFeedbacks();
    }
  }, [events]);

  const groupEventsByBarangay = () => {
    const filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = {};
    filteredEvents.forEach(event => {
      const barangay = event.location || 'Unknown';
      if (!grouped[barangay]) {
        grouped[barangay] = [];
      }
      grouped[barangay].push(event);
    });
    return grouped;
  };

  const barangayGroups = groupEventsByBarangay();

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, category: value }));
    
    if (value === "Other") {
      setShowOtherCategory(true);
    } else {
      setShowOtherCategory(false);
      setOtherCategory("");
    }
  };

  const handleOtherCategoryChange = (e) => {
    setOtherCategory(e.target.value);
  };

  const openCreateModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setShowOtherCategory(false);
    setOtherCategory("");
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      category: "",
    });
  };

  const handleSubmit = async () => {
    if (loading) return;

    const finalCategory = formData.category === "Other" ? otherCategory : formData.category;

    if (!finalCategory || !formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.description) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#4FC3F7',
        background: '#FFF3E0',
        color: '#E65100',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        time: `${formData.startTime} - ${formData.endTime}`,
        location: formData.location,
        category: finalCategory,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`http://localhost:8000/api/events/${editId}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(prev => prev.map(ev => ev.id === editId ? res.data.event : ev));
        Swal.fire({
          title: '✅ Event Updated!',
          text: 'Your event has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } else {
        res = await axios.post("http://localhost:8000/api/events", payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents(prev => [...(prev || []), res.data.event]);
        Swal.fire({
          title: '🎉 Event Created!',
          text: 'Your event has been created successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error:", err);
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        let errorMessage = "Please fix the following errors:\n\n";
        Object.keys(errors).forEach(key => {
          errorMessage += `• ${key}: ${errors[key].join(', ')}\n`;
        });
        Swal.fire({
          title: 'Validation Error',
          html: errorMessage.replace(/\n/g, '<br>'),
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      } else if (err.response?.data?.message) {
        Swal.fire({
          title: 'Error',
          text: err.response.data.message,
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: "Failed to submit event.",
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const eventDate = new Date(event.date);
    const dateString = eventDate.toISOString().slice(0, 10);
    const startTime = event.start_time || '';
    const endTime = event.end_time || '';
    
    setFormData({
      title: event.title,
      description: event.description,
      date: dateString,
      startTime: startTime,
      endTime: endTime,
      location: event.location,
      category: event.category,
    });
    setEditId(event.id);
    setIsEditing(true);
    setShowOtherCategory(false);
    setOtherCategory("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4FC3F7',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#FFF3E0',
      color: '#E65100'
    });

    if (result.isConfirmed) { 
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEvents((prev) => (prev || []).filter((ev) => ev.id !== id));
        Swal.fire({
          title: '✅ Deleted!',
          text: 'Event has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: "Failed to delete event",
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const formatTimeDisplay = (timeValue) => {
    if (!timeValue) return 'Time not set';
    
    if (timeValue.includes('-')) {
      const timeParts = timeValue.split('-');
      const startTime = formatTimeDisplay(timeParts[0].trim());
      const endTime = formatTimeDisplay(timeParts[1].trim());
      return `${startTime} - ${endTime}`;
    }
    
    const timeParts = timeValue.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1] || '00';
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const parseTimeToDate = (timeString, baseDate) => {
    if (!timeString) return null;
    
    const time = timeString.trim();
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let finalHours = hours;
    
    if (period === 'PM' && hours < 12) {
      finalHours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      finalHours = 0;
    }
    
    const date = new Date(baseDate);
    date.setHours(finalHours, minutes || 0, 0, 0);
    return date;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let startTime = null;
    let endTime = null;
    
    if (event.start_time && event.end_time) {
      startTime = parseTimeToDate(formatTimeDisplay(event.start_time), eventDate);
      endTime = parseTimeToDate(formatTimeDisplay(event.end_time), eventDate);
      
      if (startTime && endTime) {
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
      }
    } 
    else if (event.time && event.time.includes('-')) {
      const timeParts = event.time.split('-');
      const startPart = timeParts[0].trim();
      const endPart = timeParts[1].trim();
      
      startTime = parseTimeToDate(formatTimeDisplay(startPart), eventDate);
      endTime = parseTimeToDate(formatTimeDisplay(endPart), eventDate);
      
      if (startTime && endTime) {
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
      }
    }
    
    if (startTime && endTime) {
      if (now < startTime) {
        return "upcoming";
      } else if (now >= startTime && now <= endTime) {
        return "present";
      } else {
        return "past";
      }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return "present";
    } else if (eventDate > today) {
      return "upcoming";
    } else {
      return "past";
    }
  };

  const getTimeRange = (event) => {
    if (event.start_time && event.end_time) {
      const startTime = formatTimeDisplay(event.start_time);
      const endTime = formatTimeDisplay(event.end_time);
      return `${startTime} - ${endTime}`;
    } 
    else if (event.time && event.time.includes('-')) {
      return formatTimeDisplay(event.time);
    }
    else if (event.time) {
      return formatTimeDisplay(event.time);
    }
    return 'Time not set';
  };

  // Handle event card click to show feedback
  const handleEventCardClick = async (event) => {
    setSelectedEvent(event);
    
    // Fetch feedback if not already loaded
    if (!eventFeedbacks[event.id]) {
      const feedbacks = await fetchEventFeedback(event.id);
      setShowFeedbackModal(true);
    } else {
      setShowFeedbackModal(true);
    }
  };

  // Calculate average rating
  const getAverageRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'active' : ''}`}
          >
            ★
          </span>
        ))}
        <span className="rating-text">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </span>
      </div>
    );
  };

  const toggleAttendance = async (eventId, registrationId, attendance) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:8000/api/registrations/${registrationId}/attendance`, {
        attendance: attendance
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSelectedEvent(prev => ({
        ...prev,
        registrations: prev.registrations.map(reg =>
          reg.id === registrationId ? { ...reg, attendance } : reg
        )
      }));

      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              registrations: event.registrations.map(reg =>
                reg.id === registrationId ? { ...reg, attendance } : reg
              )
            }
          : event
      ));

      if (res.data.penalty_added) {
        Swal.fire({
          title: '✅ Attendance Updated!',
          html: `
            <div style="text-align: left;">
              <p>User marked as <strong>absent</strong></p>
              <p>⚠️ <strong>1 penalty</strong> has been automatically added</p>
              <p>User now has <strong>${res.data.penalties} penalties</strong></p>
              ${res.data.penalties >= 3 ? 
                '<p style="color: #ff6b6b;">🚫 User is now BANNED from event registration for 30 days</p>' : 
                ''
              }
            </div>
          `,
          icon: 'info',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } else if (res.data.penalty_removed) {
        Swal.fire({
          title: '✅ Attendance Updated!',
          html: `
            <div style="text-align: left;">
              <p>User marked as <strong>present</strong></p>
              <p>✅ <strong>1 penalty</strong> has been removed</p>
              <p>User now has <strong>${res.data.penalties} penalties</strong></p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: '✅ Attendance Updated!',
          text: `User marked as ${attendance}!`,
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      let errorMessage = "Failed to update attendance. ";
      if (err.response?.status === 404) {
        errorMessage += "Registration not found.";
      } else if (err.response?.status === 500) {
        errorMessage += "Server error.";
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message;
      }
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE',
        color: '#C62828',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/events/${event.id}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSelectedEvent({
        ...event,
        registrations: res.data,
      });
      setSelectedStat('all'); // Reset filter when opening modal
    } catch (err) {
      console.error("Error loading registrations:", err);
      Swal.fire({
        title: 'Error',
        text: "Failed to load registrations.",
        icon: 'error',
        confirmButtonColor: '#4FC3F7',
        background: '#FFEBEE',
        color: '#C62828',
        confirmButtonText: 'OK'
      });
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

  const getUserDetails = (email) => {
    if (!users || !Array.isArray(users)) {
      return { barangay: 'N/A', purok: 'N/A' };
    }
    
    const user = users.find(u => u.email === email);
    return user ? { 
      barangay: user.barangay || 'N/A', 
      purok: user.purok || 'N/A' 
    } : { 
      barangay: 'N/A', 
      purok: 'N/A' 
    };
  };

  const getAttendanceStats = () => {
    if (!selectedEvent?.registrations) {
      return { present: 0, absent: 0, pending: 0, total: 0 };
    }
    
    const present = selectedEvent.registrations.filter(reg => reg.attendance === 'present').length;
    const absent = selectedEvent.registrations.filter(reg => reg.attendance === 'absent').length;
    const pending = selectedEvent.registrations.filter(reg => !reg.attendance || reg.attendance === 'pending').length;
    const total = selectedEvent.registrations.length;
    
    return { present, absent, pending, total };
  };

  // Handle stat card click
  const handleStatClick = (statType) => {
    setSelectedStat(statType);
  };

  // Get filtered registrations based on selected stat
  const getFilteredRegistrations = () => {
    if (!selectedEvent?.registrations) return [];
    
    switch (selectedStat) {
      case 'present':
        return selectedEvent.registrations.filter(reg => reg.attendance === 'present');
      case 'absent':
        return selectedEvent.registrations.filter(reg => reg.attendance === 'absent');
      case 'pending':
        return selectedEvent.registrations.filter(reg => !reg.attendance || reg.attendance === 'pending');
      default:
        return selectedEvent.registrations;
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (!selectedEvent || !filteredRegistrations.length) return;
    
    const result = await Swal.fire({
      title: `Mark all as ${action}?`,
      html: `This will mark <strong>${filteredRegistrations.length} registration(s)</strong> as <strong>${action}</strong>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4FC3F7',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, mark as ${action}`,
      cancelButtonText: 'Cancel',
      background: '#FFF3E0',
      color: '#E65100'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const promises = filteredRegistrations.map(reg => 
          axios.put(`http://localhost:8000/api/registrations/${reg.id}/attendance`, {
            attendance: action
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        );

        await Promise.all(promises);
        
        // Update local state
        const updatedRegistrations = selectedEvent.registrations.map(reg => {
          if (filteredRegistrations.some(filteredReg => filteredReg.id === reg.id)) {
            return { ...reg, attendance: action };
          }
          return reg;
        });

        setSelectedEvent(prev => ({
          ...prev,
          registrations: updatedRegistrations
        }));

        setEvents(prev => prev.map(event =>
          event.id === selectedEvent.id
            ? { ...event, registrations: updatedRegistrations }
            : event
        ));

        Swal.fire({
          title: '✅ Bulk Update Complete!',
          text: `${filteredRegistrations.length} registration(s) marked as ${action}`,
          icon: 'success',
          confirmButtonColor: '#4FC3F7',
          background: '#E3F2FD',
          color: '#01579B',
          confirmButtonText: 'OK'
        });

      } catch (err) {
        console.error("Error in bulk action:", err);
        Swal.fire({
          title: 'Error',
          text: "Failed to update some registrations",
          icon: 'error',
          confirmButtonColor: '#4FC3F7',
          background: '#FFEBEE',
          color: '#C62828',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const attendanceStats = getAttendanceStats();
  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="body">
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

      <div className={`sidebars ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li className="currentpages">
            <Link to="/admin-dashboard" onClick={handleNavClick}>🏠 Home</Link>
          </li>
           <li>
            <Link to="/announcements" onClick={handleNavClick}>📢 Announcement</Link>
          </li>
          <li>
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

      <div className="admin-section">
        <button className="admin-btn-primary" onClick={openCreateModal}>+ Create Event</button>
        
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events by title, description, location, or category..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              Search
            </button>
          </div>
        </div>
        
        <h2>All Events</h2>
        
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet. Create your first event!</p>
          </div>
        ) : Object.keys(barangayGroups).length === 0 ? (
          <div className="empty-state">
            <p>No events found matching your search.</p>
          </div>
        ) : (
          <div className="events-container">
            {Object.keys(barangayGroups).map(barangay => (
              <div key={barangay} className="barangay-group">
                <div className="barangay-header">
                  {barangay} ({barangayGroups[barangay].length} events)
                </div>
                <div className="events-grid">
                  {barangayGroups[barangay].map((event) => {
                    const eventStatus = getEventStatus(event);
                    const categoryImage = getCategoryImage(event.category);
                    const feedbacks = eventFeedbacks[event.id] || [];
                    const averageRating = getAverageRating(feedbacks);
                    
                    return (
                      <div 
                        key={event.id} 
                        className="events-cards clickable"
                        onClick={() => handleEventCardClick(event)}
                      >
                        <div 
                          className="event-card-image"
                          style={{
                            backgroundImage: `url(${categoryImage})`
                          }}
                        ></div>
                        
                        <div className="event-card-content">
                          <div className="event-card-header">
                            <h3 className="event-card-title" title={event.title}>
                              {event.title}
                            </h3>
                            <span className={`event-card-status ${eventStatus}`}>
                              {eventStatus === "upcoming" ? "Upcoming" : 
                              eventStatus === "present" ? "Started" : 
                              "Past Event"}
                            </span>
                          </div>
                          
                          <div className="event-card-details">
                            <div className="event-card-detail">
                              <span className="event-card-label">Date:</span>
                              <span className="event-card-value">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="event-card-detail">
                              <span className="event-card-label">Time:</span>
                              <span className="event-card-value">{getTimeRange(event)}</span>
                            </div>
                            <div className="event-card-detail">
                              <span className="event-card-label">Location:</span>
                              <span className="event-card-value">{event.location}</span>
                            </div>
                            <div className="event-card-detail">
                              <span className="event-card-label">Category:</span>
                              <span className="event-card-value category-badge">{event.category}</span>
                            </div>
                            
                            {/* Feedback Summary */}
                            <div className="event-card-detail">
                              <span className="event-card-label">Feedback:</span>
                              <span className="event-card-value">
                                {feedbacks.length > 0 ? (
                                  <div className="feedback-summary">
                                    <span className="average-rating">{averageRating} ★</span>
                                    <span className="feedback-count">({feedbacks.length} reviews)</span>
                                  </div>
                                ) : (
                                  <span className="no-feedback">No feedback yet</span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          <div className="event-description-container">
                            <div className="event-description-label">Description:</div>
                            <div className="event-description-scroll">
                              <p className="event-description-text">{event.description}</p>
                            </div>
                          </div>
                          
                          <div className="event-card-actions">
                            <button 
                              className="table-btn edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(event);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="table-btn registrations"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRegistrations(event);
                              }}
                            >
                              Attendance
                            </button>
                            <button 
                              className="table-btn delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(event.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Creation/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{isEditing ? "Edit Event" : "Create Event"}</h2>
              <button 
                className="admin-modal-close" 
                onClick={() => !loading && setShowModal(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <div className="admin-form">
              {loading && (
                <div className="modal-loading-overlay">
                  <div className="modal-loading-spinner"></div>
                  <p>{isEditing ? "Updating Event..." : "Creating Event..."}</p>
                </div>
              )}
              
              <div className={loading ? "form-content loading" : "form-content"}>
                <div className="admin-form-group">
                  <label>Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleCategoryChange}
                    disabled={loading}
                  >
                    <option value="">Select a category</option>
                    <option value="Barangay Assembly">Barangay Assembly</option>
                    <option value="Medical Mission">Medical Mission</option>
                    <option value="Vaccination Drive">Vaccination Drive</option>
                    <option value="Farming Seminar">Farming Seminar</option>
                    <option value="Town Fiesta">Town Fiesta</option>
                    <option value="Sports Tournament">Sports Tournament</option>
                    <option value="Educational Seminar">Educational Seminar</option>
                    <option value="Civil Registration">Civil Registration</option>
                    <option value="Voters Registration">Voters Registration</option>
                    <option value="Clean-up Drive">Clean-up Drive</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Tree Planting">Tree Planting</option>
                    <option value="Dental Mission">Dental Mission</option>
                    <option value="Nutrition Program">Nutrition Program</option>
                    <option value="TESDA Training">TESDA Training</option>
                    <option value="Palarong Barangay">Palarong Barangay</option>
                    <option value="4Ps Payout">4Ps Payout</option>
                    <option value="Christmas Party">Christmas Party</option>
                    <option value="Other">Other (Please specify below)</option>
                  </select>
                </div>
                {showOtherCategory && (
                  <div className="admin-form-group">
                    <label>Specify Category *</label>
                    <input 
                      type="text" 
                      name="otherCategory" 
                      value={otherCategory}
                      onChange={handleOtherCategoryChange}
                      placeholder="Enter your custom category..."
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Description *</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="2"
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Location *</label>
                  <select 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">Select a location</option>
                    <option value="Anibongan">Anibongan</option>
                    <option value="Babag">Babag</option>
                    <option value="Cagawasan">Cagawasan</option>
                    <option value="Cagawitan">Cagawitan</option>
                    <option value="Caluasan">Caluasan</option>
                    <option value="Candelaria">Candelaria</option>
                    <option value="Can-oling">Can-oling</option>
                    <option value="Estaca">Estaca</option>
                    <option value="La Esperanza">La Esperanza</option>
                    <option value="Liberty">Liberty</option>
                    <option value="Magcagong">Magcagong</option>
                    <option value="Malibago">Malibago</option>
                    <option value="Mampas">Mampas</option>
                    <option value="Napo">Napo</option>
                    <option value="Poblacion">Poblacion</option>
                    <option value="San Isidro">San Isidro</option>
                    <option value="San Jose">San Jose</option>
                    <option value="San Miguel">San Miguel</option>
                    <option value="San Roque">San Roque</option>
                    <option value="San Vicente">San Vicente</option>
                    <option value="Santo Rosario">Santo Rosario</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Santa Fe">Santa Fe</option>
                    <option value="Santa Lucia">Santa Lucia</option>
                    <option value="Santa Rosa">Santa Rosa</option>
                    <option value="Santo Niño">Santo Niño</option>
                    <option value="Santo Tomas">Santo Tomas</option>
                    <option value="Santo Niño de Panglao">Santo Niño de Panglao</option>
                    <option value="Taytay">Taytay</option>
                    <option value="Tigbao">Tigbao</option>
                  </select>
                </div>
                <div className="admin-form-actions">
                  <button 
                    className="admin-btn-cancel" 
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`admin-btn-submit ${loading ? 'loading' : ''}`} 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="button-spinner"></span>
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditing ? "Update" : "Create"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => {
          setShowFeedbackModal(false);
          setSelectedEvent(null);
        }}>
          <div className="feedback-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback for {selectedEvent.title}</h2>
              <button className="close-btn" onClick={() => {
                setShowFeedbackModal(false);
                setSelectedEvent(null);
              }}>×</button>
            </div>
            
            <div className="feedback-content">
              <div className="event-info">
                <h3>{selectedEvent.title}</h3>
                <p>{selectedEvent.category} • {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <div className="overall-rating">
                  <strong>Overall Rating: </strong>
                  <span className="average-rating-large">
                    {getAverageRating(eventFeedbacks[selectedEvent.id] || [])} ★
                  </span>
                  <span className="total-feedbacks">
                    ({eventFeedbacks[selectedEvent.id]?.length || 0} reviews)
                  </span>
                </div>
              </div>
              
              {eventFeedbacks[selectedEvent.id] && eventFeedbacks[selectedEvent.id].length > 0 ? (
                <div className="feedbacks-list">
                  <h4>User Feedback</h4>
                  <div className="feedback-items">
                    {eventFeedbacks[selectedEvent.id].map((feedback, index) => (
                      <div key={feedback.id || index} className="feedback-item">
                        <div className="feedback-header">
                          <div className="user-info">
                            <strong>{feedback.user_name}</strong>
                            <span className="user-email">({feedback.user_email})</span>
                          </div>
                          <div className="feedback-rating">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        <div className="feedback-date">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </div>
                        {feedback.comment && (
                          <div className="feedback-comment">
                            <p>{feedback.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-feedback-message">
                  <p>No feedback submitted for this event yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {selectedEvent && !showFeedbackModal && (
        <div className="admin-modal-overlay" onClick={() => {
          setSelectedEvent(null);
          setSelectedStat('all');
        }}>
          <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h2>Registrations for {selectedEvent.title}</h2>
              <button className="admin-modal-close" onClick={() => {
                setSelectedEvent(null);
                setSelectedStat('all');
              }}>×</button>
            </div>
            <div className="admin-form">
              <div className="attendance-summary">
                <h3>Attendance Summary</h3>
                <div className="attendance-stats">
                  <div 
                    className={`stat-card total ${selectedStat === 'all' ? 'active' : ''}`}
                    onClick={() => handleStatClick('all')}
                  >
                    <div className="stat-number total">{attendanceStats.total}</div>
                    <div className="stat-label">Total</div>
                  </div>
                  <div 
                    className={`stat-card present ${selectedStat === 'present' ? 'active' : ''}`}
                    onClick={() => handleStatClick('present')}
                  >
                    <div className="stat-number present">{attendanceStats.present}</div>
                    <div className="stat-label">Present</div>
                  </div>
                  <div 
                    className={`stat-card absent ${selectedStat === 'absent' ? 'active' : ''}`}
                    onClick={() => handleStatClick('absent')}
                  >
                    <div className="stat-number absent">{attendanceStats.absent}</div>
                    <div className="stat-label">Absent</div>
                  </div>
                  <div 
                    className={`stat-card pending ${selectedStat === 'pending' ? 'active' : ''}`}
                    onClick={() => handleStatClick('pending')}
                  >
                    <div className="stat-number pending">{attendanceStats.pending}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedStat !== 'all' && filteredRegistrations.length > 0 && (
                  <div className="bulk-actions">
                    <button 
                      className="bulk-action-btn present"
                      onClick={() => handleBulkAction('present')}
                    >
                      Mark all as Present
                    </button>
                    <button 
                      className="bulk-action-btn absent"
                      onClick={() => handleBulkAction('absent')}
                    >
                      Mark all as Absent
                    </button>
                    {selectedStat === 'pending' && (
                      <button 
                        className="bulk-action-btn reset"
                        onClick={() => handleBulkAction('pending')}
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                )}
              </div>

              {filteredRegistrations && filteredRegistrations.length > 0 ? (
                <div className="attendance-table-container">
                  <div className="table-header-info">
                    Showing {filteredRegistrations.length} of {attendanceStats.total} registrations
                    {selectedStat !== 'all' && ` (${selectedStat})`}
                  </div>
                  <table className="admin-table responsive-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Barangay</th>
                        <th>Purok</th>
                        <th>Attendance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td data-label="Name">{reg.name}</td>
                          <td data-label="Email">{reg.email}</td>
                          <td data-label="Barangay">{getUserDetails(reg.email).barangay}</td>
                          <td data-label="Purok">{getUserDetails(reg.email).purok}</td>
                          <td data-label="Attendance">
                            <span className={
                              reg.attendance === 'present' ? 'status-present' :
                              reg.attendance === 'absent' ? 'status-absent' : 'status-pending'
                            }>
                              {reg.attendance || "Pending"}
                            </span>
                          </td>
                          <td data-label="Actions" className="attendance-actions">
                            <button 
                              className="btn-present"
                              onClick={() => toggleAttendance(selectedEvent.id, reg.id, "present")}
                              disabled={reg.attendance === 'present'}
                            >
                              Present
                            </button>
                            <button 
                              className="btn-absent"
                              onClick={() => toggleAttendance(selectedEvent.id, reg.id, "absent")}
                              disabled={reg.attendance === 'absent'}
                            >
                              Absent
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No registrations found{selectedStat !== 'all' ? ` with status "${selectedStat}"` : ''}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}