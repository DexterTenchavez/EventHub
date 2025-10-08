import "./user-css/Upcomingevents.css";
import { Link } from "react-router-dom";

export default function Upcomingevents(){


    return(
        <div>
            <div className="upcomingevents-topbar">
<h3 className="title"> EventHub </h3>

<Link to="/">Logout</Link>

            </div>

        <div className="upcomingevents-sidebar">
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                 <li className="upcoming-currentpage"> <Link to="/upcoming-events">Upcoming Events</Link></li>
                  <li><Link to="/past-events">Past Events</Link></li>
                   <li><Link to="/profile">Profile</Link></li>
                   
            </ul>
            
        </div>


        </div>
    )
}