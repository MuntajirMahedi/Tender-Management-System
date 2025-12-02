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

const toTitle = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
};

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // STATUS MODAL
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  // DELETE HANDLER
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

  // OPEN STATUS CONFIRM MODAL
  const openStatusModal = (newStatus) => {
    setTargetStatus(newStatus);
    setShowStatusModal(true);
  };

  // CONFIRM STATUS UPDATE
  const confirmStatusUpdate = async () => {
    try {
      setIsUpdatingStatus(true);
      await userApi.toggleUserStatus(id, targetStatus);

      setUser((prev) => ({ ...prev, isActive: targetStatus }));

      toast.success(
        targetStatus
          ? "User access allowed successfully"
          : "User access revoked successfully"
      );

      setShowStatusModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update access";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  // Permissions grouping
  const rawPermissions = user.permissions || [];
  const permissionCodes = rawPermissions
    .map((p) => (typeof p === "string" ? p : p?.code || ""))
    .filter(Boolean);

  const groupedPermissions = permissionCodes.reduce((acc, code) => {
    const [module, action] = code.split(":");
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
                onClick={() => openStatusModal(false)}
              >
                <i className="bi bi-slash-circle me-2" />
                Revoke Access
              </button>
            </Can>
          ) : (
            <Can permission="users.edit" key="allow">
              <button
                className="btn btn-outline-success"
                onClick={() => openStatusModal(true)}
              >
                <i className="bi bi-check-circle me-2" />
                Allow Access
              </button>
            </Can>
          ),

          <Can permission="users.delete" key="delete">
            <button
              className="btn btn-outline-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-2" /> Delete
            </button>
          </Can>
        ].filter(Boolean)}
      />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Profile</h6>
            <InfoItem label="Full Name" value={user.name} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Mobile" value={user.mobile} />
          </div>
        </div>

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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={isDeleting}
                    onClick={() => !isDeleting && setShowDeleteModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    Are you sure you want to delete{" "}
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
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* STATUS CHANGE MODAL */}
      {showStatusModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {targetStatus ? (
                      <>
                        <i className="bi bi-check-circle text-success me-2" />
                        Allow Access
                      </>
                    ) : (
                      <>
                        <i className="bi bi-slash-circle text-warning me-2" />
                        Revoke Access
                      </>
                    )}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={isUpdatingStatus}
                    onClick={() => !isUpdatingStatus && setShowStatusModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    Are you sure you want to{" "}
                    <strong>{targetStatus ? "ALLOW" : "REVOKE"}</strong>{" "}
                    access for <strong>{user?.name}</strong>?
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    disabled={isUpdatingStatus}
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn ${
                      targetStatus ? "btn-success" : "btn-warning"
                    }`}
                    disabled={isUpdatingStatus}
                    onClick={confirmStatusUpdate}
                  >
                    {isUpdatingStatus
                      ? "Updating..."
                      : targetStatus
                      ? "Allow"
                      : "Revoke"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default UserView;
