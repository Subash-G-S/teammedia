import { Link } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  return (
    <div className="sidebar">

      <h2 className="logo">TEAM MEDIA</h2>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/members">Members</Link>
      <Link to="/events">Events</Link>
      <Link to="/assignments">Assignments</Link>
      <Link to="/letters">Generate Letter</Link>

    </div>
  )
}

export default Navbar