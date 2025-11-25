import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { NAV_ITEMS, ROLE_ACCESS } from "../utils/constants";
import useAuth from "../hooks/useAuth";

const canAccess = (role = "viewer", key) => {
  const rule = ROLE_ACCESS[role] || [];
  if (rule === "all") return true;
  return rule.includes(key);
};

const SidebarItem = ({ item, role, onNavigate }) => {
  if (item.children) {
    const visibleChildren = item.children.filter((child) =>
      canAccess(role, child.key)
    );
    if (!visibleChildren.length) return null;
    return (
      <div className="mb-2">
        <div className="text-uppercase small text-white-50 px-3 mt-3 mb-1">
          {item.label}
        </div>
        {visibleChildren.map((child) => (
          <NavLink
            key={child.key}
            to={child.path}
            className={({ isActive }) =>
              clsx("nav-link d-block nav-child", { active: isActive })
            }
            onClick={onNavigate}
          >
            {child.label}
          </NavLink>
        ))}
      </div>
    );
  }

  if (!canAccess(role, item.key)) return null;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx("nav-link", "d-flex", "align-items-center", {
          active: isActive
        })
      }
      onClick={onNavigate}
    >
      {item.icon && <i className={`bi ${item.icon}`} />}
      <span>{item.label}</span>
    </NavLink>
  );
};

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || "viewer";

  return (
    <aside className={clsx("sidebar", { open })}>
      <div className="brand d-flex align-items-center justify-content-between">
        <span>
          <strong>TMS</strong> Portal
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-light d-lg-none"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            role={role}
            onNavigate={onClose}
          />
        ))}
      </nav>
      <div className="px-3 py-3 small text-white-50">
        <div className="fw-semibold">{user?.name}</div>
        <div className="text-capitalize">{user?.role} workspace</div>
      </div>
    </aside>
  );
};

export default Sidebar;

