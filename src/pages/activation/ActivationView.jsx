// src/pages/activation/ActivationView.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { activationApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";
import RequirePermission from "../../components/RequirePermission";
import usePermission from "../../hooks/usePermission";
import { toast } from "react-toastify";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const ActivationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔽 delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();

  const canEdit = can("activation:update");
  const canDelete = can("activation:delete");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { task } = await activationApi.getTask(id);
        setTask(task);
      } catch (err) {
        console.error("Unable to load activation task", err);
        toast.error("Unable to load activation task");
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // 🔽 called when user CONFIRMS delete in modal
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await activationApi.deleteTask(id);
      toast.success("Activation task deleted successfully");
      setShowDeleteModal(false);
      navigate("/activation");
    } catch (err) {
      console.error("Unable to delete activation task", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete activation task";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!task) return <p className="text-muted">Activation task not found</p>;

  return (
    <RequirePermission permission="activation:view">
      <div>
        <PageHeader
          title={`Activation • ${task.taskName}`}
          subtitle={task.client?.name}
          actions={[
            canEdit && (
              <Link
                key="edit"
                to={`/activation/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil-square me-2" /> Edit
              </Link>
            ),
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)} // 👈 open confirm modal
              >
                <i className="bi bi-trash me-2" /> Delete
              </button>
            )
          ].filter(Boolean)}
        />

        <div className="row g-4">
          {/* LEFT CARD - BASIC DETAILS */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Task Details</h6>

              <InfoItem label="Client" value={task.client?.name} />
              <InfoItem label="Plan" value={task.plan?.planName} />
              <InfoItem
                label="Status"
                value={<StatusBadge status={task.status} />}
              />
              <InfoItem label="Assigned To" value={task.assignedTo?.name} />
              <InfoItem label="Notes" value={task.notes} />
            </div>
          </div>

          {/* RIGHT CARD - TIMELINE */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Timeline</h6>

              <InfoItem label="Start Date" value={formatDate(task.startDate)} />
              <InfoItem label="Due Date" value={formatDate(task.dueDate)} />

              <div className="mt-3">
                <div className="text-muted small">Progress</div>
                <div className="fw-semibold">
                  {task.activationProgress !== undefined
                    ? `${task.activationProgress}%`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
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
                      Are you sure you want to delete this activation task{" "}
                      <strong>{task?.taskName}</strong>? This action cannot be
                      undone.
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
    </RequirePermission>
  );
};

export default ActivationView;
