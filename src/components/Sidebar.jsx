import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { NAV_ITEMS } from "../utils/constants";
import useAuth from "../hooks/useAuth";

const MODULE_PERMISSION_MAP = {
  dashboard: "dashboard:view",
  inquiries: "inquiry:view",
  clients: "client:view",
  plans: "plan:view",
  payments: "payment:view",
  invoices: "invoice:view",
  activation: "activation:view",
  tickets: "ticket:view",
  renewals: "renewal:view",
  reports: "report:view",
  users: "user:view",
  roles: "role:view",
  permissions: "permission:view",
  audit: "audit:view",
  documents: "document:view",
  settings: "settings:view"
};

const canAccess = (permissions, key) => {
  if (key === "dashboard") return true;
  if (key === "settings") return true;
  return permissions.includes(MODULE_PERMISSION_MAP[key]);
};

const SidebarItem = ({ item, permissions, onNavigate }) => {
  if (item.children) {
    const allowed = item.children.filter((c) => canAccess(permissions, c.key));
    if (!allowed.length) return null;

    return (
      <div className="mb-2">
        <div className="text-uppercase small text-white-50 px-3 mt-3 mb-1">
          {item.label}
        </div>

        {allowed.map((child) => (
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

  if (!canAccess(permissions, item.key)) return null;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx("nav-link d-flex align-items-center", { active: isActive })
      }
      onClick={onNavigate}
    >
      {item.icon && <i className={`bi ${item.icon}`}></i>}
      <span>{item.label}</span>
    </NavLink>
  );
};

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  return (
    <>
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
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              permissions={permissions}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="px-3 py-3 small text-white-50">
          <div className="fw-semibold">{user?.name}</div>
          <div className="text-capitalize">Workspace</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
