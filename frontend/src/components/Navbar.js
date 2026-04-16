import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Brand / Home */}
      <Link to="/" className="nav-brand">
        🧊 Iceberg Tracker
      </Link>

      {/* Navigation */}
      <div className="nav-links">
        <Link to="/history/1">Iceberg History</Link>
      </div>
    </nav>
  );
}

