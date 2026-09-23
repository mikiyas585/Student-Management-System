import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const { user } = useAuth();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? " active" : "";
  }

  // Logged-out state: show brand + auth buttons
  if (!user) {
    return (
      <div className="navbar" id="navbar">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🎓</span>
          Student Management System
        </Link>
        <div className="navbar-right">
          <button
            className="navbar-auth-btn login-btn"
            onClick={onOpenLogin}
            id="navbar-login-btn"
          >
            Sign In
          </button>
          <button
            className="navbar-auth-btn register-btn"
            onClick={onOpenRegister}
            id="navbar-register-btn"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Logged-in state: show nav links + profile icon
  return (
    <div className="navbar" id="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/dashboard" className="navbar-brand" style={{ marginRight: 16 }}>
          <span className="navbar-brand-icon">🎓</span>
          Student Management System
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className={"nav-link" + isActive("/dashboard")}>Dashboard</Link>
          <Link to="/students" className={"nav-link" + isActive("/students")}>Students</Link>
          <Link to="/notices" className={"nav-link" + isActive("/notices")}>Notices</Link>
          {user?.role !== "parent" && (
            <Link to="/subscriptions" className={"nav-link" + isActive("/subscriptions")}>Subscriptions</Link>
          )}
          <Link to="/attendance" className={"nav-link" + isActive("/attendance")}>Attendance</Link>
          <Link to="/grades" className={"nav-link" + isActive("/grades")}>Grades</Link>
        </div>
      </div>
      <div className="navbar-right">
        <ProfileDropdown />
      </div>
    </div>
  );
}
