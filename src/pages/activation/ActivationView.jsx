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

  const handleDelete = async () => {

    try {
      await activationApi.deleteTask(id);
      toast.success("Activation task deleted successfully");
      navigate("/activation");
    } catch (err) {
      console.error("Unable to delete activation task", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete activation task";
      toast.error(msg);
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
                onClick={handleDelete}
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
      </div>
    </RequirePermission>
  );
};

export default ActivationView;
