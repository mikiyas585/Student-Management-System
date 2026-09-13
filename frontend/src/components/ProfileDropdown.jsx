import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(function () {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close on Escape
  useEffect(function () {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return function () {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!user) return null;

  var initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  function handleLogout() {
    setOpen(false);
    logout();
  }

  var roleColors = {
    admin: "linear-gradient(135deg, #ef4444, #f97316)",
    teacher: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    student: "linear-gradient(135deg, #22d3ee, #6366f1)",
    parent: "linear-gradient(135deg, #34d399, #059669)",
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        className="profile-avatar"
        onClick={function () { setOpen(!open); }}
        title={user.name}
        style={{ background: roleColors[user.role] || undefined }}
        id="profile-avatar-btn"
      >
        {initial}
      </div>

      <div className={"profile-dropdown" + (open ? " open" : "")}>
        <div className="profile-dropdown-header">
          <div className="profile-dropdown-name">{user.name}</div>
          <div className="profile-dropdown-email">
            <span className="badge" style={{ marginRight: 6 }}>{user.role}</span>
            {user.email || ""}
          </div>
        </div>

        <button
          className="profile-dropdown-item danger"
          onClick={handleLogout}
          id="logout-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
