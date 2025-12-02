import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { roleApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import Can from "../../components/Can";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const RoleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { role } = await roleApi.getRole(id);
        setRole(role);
      } catch (err) {
        toast.error("Unable to load role details");
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await roleApi.deleteRole(id);

      toast.success("Role deleted successfully");
      setShowDeleteModal(false);
      navigate("/roles");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete role";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!role) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Role • ${role.name}`}
        subtitle={role.description || "Role configuration overview"}
        actions={[
          <Can permission="roles.edit" key="edit">
            <Link to={`/roles/${id}/edit`} className="btn btn-outline-primary">
              <i className="bi bi-pencil-square me-2" /> Edit
            </Link>
          </Can>,

          <Can permission="roles.delete" key="delete">
            <button
              className="btn btn-outline-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-2" /> Delete
            </button>
          </Can>
        ]}
      />

      <div className="row g-4">
        {/* LEFT ROLE INFORMATION */}
        <div className="col-lg-5">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Role Information</h6>

            <InfoItem label="Role Name" value={role.name} />
            <InfoItem label="Key" value={role.key} />
            <InfoItem label="Description" value={role.description} />
            <InfoItem
              label="Created At"
              value={new Date(role.createdAt).toLocaleString()}
            />
            <InfoItem
              label="Updated At"
              value={new Date(role.updatedAt).toLocaleString()}
            />
          </div>
        </div>

        {/* RIGHT PERMISSION LIST */}
        <div className="col-lg-7">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Assigned Permissions</h6>

            {!role.permissions?.length ? (
              <p className="text-muted">No permissions assigned.</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {role.permissions.map((perm) => (
                  <span
                    key={perm._id}
                    className="badge text-bg-primary px-3 py-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {perm.code}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------- Delete Confirmation Modal -------- */}
      {showDeleteModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete role{" "}
                    <strong>{role.name}</strong>? <br />
                    This action <strong>cannot be undone.</strong>
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete role"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Background Blur */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default RoleView;
