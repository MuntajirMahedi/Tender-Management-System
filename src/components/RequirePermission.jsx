import usePermission from "../hooks/usePermission";

const RequirePermission = ({ permission, children }) => {
  const { can } = usePermission();

  if (!permission) return children;

  const allowed = can(permission);

  if (!allowed) {
    // You can return null if you want to completely hide the page
    return (
      <div className="container py-5 text-center text-muted">
        <h5 className="mb-2">Access denied</h5>
        <p className="mb-0">You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default RequirePermission;
