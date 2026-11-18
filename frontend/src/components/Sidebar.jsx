import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { label: "Dashboard", path: "/" },
    { label: "Find Medicine", path: "/find-medicine" },
    { label: "Medicines", path: "/medicines" },
    { label: "Inventory", path: "/inventory" },
    ...(user?.role === "ADMIN"
      ? [{ label: "Purchases", path: "/purchases" }]
      : []),
    { label: "Sales", path: "/sales" },
    { label: "Suppliers", path: "/suppliers" },
    ...(user?.role === "ADMIN"
      ? [{ label: "Reports", path: "/reports" }]
      : []),
    { label: "Settings", path: "/settings" },
  ];

  function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    logout();
    onClose?.();
    navigate("/login", { replace: true });
  }

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">P</div>

        <div>
          <h2>PharmaCare</h2>
          <span>Pharmacy Management</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <p className="navigation-title">MAIN MENU</p>

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
          >
            {item.label}
          </NavLink>
        ))}

        <p className="navigation-title navigation-title-spaced">
          ACCOUNT
        </p>

        <button
          className="navigation-link logout-button"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;