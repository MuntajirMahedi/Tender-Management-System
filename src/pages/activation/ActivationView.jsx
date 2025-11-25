import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { activationApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

const ActivationView = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    activationApi.getTask(id).then(({ task }) => setTask(task));
  }, [id]);

  if (!task) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Activation • ${task.taskName}`}
        actions={[
          <Link
            key="edit"
            to={`/activation/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        ]}
      />
      <div className="table-card">
        <div className="row">
          <div className="col-4">
            <div className="text-muted small">Client</div>
            <div className="fw-semibold">{task.client?.name}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Plan</div>
            <div className="fw-semibold">{task.plan?.planName}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Status</div>
            <StatusBadge status={task.status} />
          </div>
          <div className="col-6">
            <div className="text-muted small">Assigned To</div>
            <div className="fw-semibold">{task.assignedTo?.name || "—"}</div>
          </div>
          <div className="col-3">
            <div className="text-muted small">Start</div>
            <div className="fw-semibold">{formatDate(task.startDate)}</div>
          </div>
          <div className="col-3">
            <div className="text-muted small">Due</div>
            <div className="fw-semibold">{formatDate(task.dueDate)}</div>
          </div>
          <div className="col-12">
            <div className="text-muted small">Notes</div>
            <div className="fw-semibold">{task.notes || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationView;

