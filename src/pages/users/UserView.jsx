// src/pages/users/UserView.jsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { userApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Can from "../../components/Can";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

// Small helper to make "client" → "Client", "inquiry" → "Inquiry"
const toTitle = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
};

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔽 delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { user } = await userApi.getUser(id);
        setUser(user);
      } catch (err) {
        toast.error("Unable to load user details");
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await userApi.deleteUser(id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      navigate("/users");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete user";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (activeState) => {
    const actionText = activeState
      ? "Allow access to this user?"
      : "Revoke this user's access?";
    if (!window.confirm(actionText)) return;

    try {
      await userApi.toggleUserStatus(id, activeState);
      setUser((prev) => ({ ...prev, isActive: activeState }));
      toast.success(
        `User is now marked as ${activeState ? "Active" : "Inactive"}`
      );
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update access";
      toast.error(msg);
    }
  };

  if (!user) return <p>Loading...</p>;

  // ✅ Normalize + group permissions for display
  const rawPermissions = user.permissions || [];
  const permissionCodes = rawPermissions
    .map((p) => (typeof p === "string" ? p : p?.code || ""))
    .filter(Boolean);

  const groupedPermissions = permissionCodes.reduce((acc, code) => {
    const [module, action] = code.split(":"); // e.g. "client:view"
    const moduleKey = module || "other";
    if (!acc[moduleKey]) acc[moduleKey] = [];
    acc[moduleKey].push(action || "access");
    return acc;
  }, {});

  const hasPermissions = permissionCodes.length > 0;

  return (
    <div>
      <PageHeader
        title={`User • ${user.name}`}
        subtitle={user.email}
        actions={[
          <Can permission="users.edit" key="edit">
            <Link to={`/users/${id}/edit`} className="btn btn-outline-primary">
              <i className="bi bi-pencil-square me-2" /> Edit
            </Link>
          </Can>,

          user.isActive ? (
            <Can permission="users.edit" key="revoke">
              <button
                className="btn btn-outline-warning"
                onClick={() => handleStatusToggle(false)}
              >
                <i className="bi bi-slash-circle me-2" />
                Revoke Access
              </button>
            </Can>
          ) : (
            <Can permission="users.edit" key="allow">
              <button
                className="btn btn-outline-success"
                onClick={() => handleStatusToggle(true)}
              >
                <i className="bi bi-check-circle me-2" />
                Allow Access
              </button>
            </Can>
          ),

          <Can permission="users.delete" key="delete">
            <button
              className="btn btn-outline-danger"
              onClick={() => setShowDeleteModal(true)} // 👈 open confirm modal
            >
              <i className="bi bi-trash me-2" /> Delete
            </button>
          </Can>
        ].filter(Boolean)}
      />

      <div className="row g-4">
        {/* LEFT PROFILE CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Profile</h6>

            <InfoItem label="Full Name" value={user.name} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Mobile" value={user.mobile} />
          </div>
        </div>

        {/* RIGHT ACCOUNT CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Account Details</h6>

            <InfoItem
              label="Role"
              value={
                user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "—"
              }
            />

            <div className="mb-3">
              <div className="text-muted small">Status</div>
              <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
            </div>

            <InfoItem
              label="Created At"
              value={new Date(user.createdAt).toLocaleString()}
            />
            <InfoItem
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleString()}
            />
          </div>
        </div>
      </div>

      {/* PERMISSIONS CARD */}
      <div className="card p-3 shadow-sm mt-4">
        <h6 className="text-primary mb-3">
          Permissions{" "}
          {hasPermissions && (
            <span className="badge bg-light text-muted border ms-2">
              {permissionCodes.length} total
            </span>
          )}
        </h6>

        {!hasPermissions && (
          <p className="text-muted small mb-0">
            No explicit permissions assigned to this user.
          </p>
        )}

        {hasPermissions && (
          <div className="row g-3">
            {Object.entries(groupedPermissions).map(
              ([moduleKey, actions]) => (
                <div className="col-md-4" key={moduleKey}>
                  <div className="border rounded p-2 h-100">
                    <div className="small text-muted text-uppercase mb-2">
                      {toTitle(moduleKey)}
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {actions.map((action, idx) => (
                        <span
                          key={`${moduleKey}-${action}-${idx}`}
                          className="badge bg-light text-dark border"
                        >
                          {toTitle(action)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ----------- DELETE CONFIRM MODAL ----------- */}
      {showDeleteModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    disabled={isDeleting}
                    onClick={() => !isDeleting && setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete this user{" "}
                    <strong>{user?.name}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default UserView;
