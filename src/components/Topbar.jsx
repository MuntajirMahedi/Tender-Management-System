import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-link d-lg-none text-decoration-none text-dark"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list" />
        </button>
        <div>
          <div className="fw-semibold">Welcome back, {user?.name}</div>
          <small className="text-muted text-capitalize">{user?.role}</small>
        </div>
      </div>
      <div className="d-flex align-items-center gap-3">
        <NotificationBell />
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle user-chip"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-person-circle" />
            <span>{user?.name}</span>
          </button>
          <div className="dropdown-menu dropdown-menu-end">
            <button
  className="dropdown-item"
  type="button"
  onClick={() => (window.location.href = "/profile")}
>
  <i className="bi bi-person me-2" />
  Profile
</button>
            <button className="dropdown-item" type="button" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  ); 
};

export default Topbar;

