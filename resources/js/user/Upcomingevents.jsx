import "./user-css/Upcomingevents.css";
import { Link } from "react-router-dom";

export default function Upcomingevents(){

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


    return(
        <div>
            <div className="upcomingevents-topbar">
<h3 className="title"> EventHub </h3>

<Link to="/" onClick={handleLogout}>Logout</Link>

            </div>

        <div className="upcomingevents-sidebar">
            <ul>
                <li><Link to="/user-dashboard">Dashboard</Link></li>
                 <li className="upcoming-currentpage"> <Link to="/upcoming-events">Upcoming Events</Link></li>
                  <li><Link to="/past-events">Past Events</Link></li>
                   <li><Link to="/profile">Profile</Link></li>
                   
            </ul>
            
        </div>


        </div>
    )
}