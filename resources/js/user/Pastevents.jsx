import "./user-css/Pastevents.css";
import { Link } from "react-router-dom";

export default function Pastevents(){


    return(
        <div>
            <div className="topbar">
<h3 className="title"> EventHub </h3>

<Link to="/">Logout</Link>

            </div>

        <div className="sidebar">
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                 <li> <Link to="/upcoming-events">Upcoming Events</Link></li>
                  <li className="currentpage"><Link to="/past-events">Past Events</Link></li>
                   <li><Link to="/profile">Profile</Link></li>
                   
            </ul>
            
        </div>


        </div>
    )
}