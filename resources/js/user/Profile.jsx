import "./user-css/Profile.css";
import { Link } from "react-router-dom";

export default function Profile() {
  
  return (
    <div>
      <div className="profile-topbar">
        <h3 className="title">EventHub</h3>
        <Link to="/">Logout</Link>
      </div>

      <div className="profile-sidebar">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/upcoming-events">Upcoming Events</Link></li>
          <li><Link to="/past-events">Past Events</Link></li>
          <li className="profile-currentpage"><Link to="/profile">Profile</Link></li>
        </ul>
      </div>

     
    </div>
  );
}
