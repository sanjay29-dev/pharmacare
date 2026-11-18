import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) return;

    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="menu-toggle"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="topbar-brand">
        <h1>PharmaCare Pharmacy</h1>
        <p>Pharmacy Stock, Expiry & Demand Management</p>
      </div>

      <div className="topbar-actions">
        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="user-placeholder">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <strong>{user?.username || "User"}</strong>
            <span>Role: {user?.role || "STAFF"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;