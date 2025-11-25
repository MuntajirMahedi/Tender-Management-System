import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { activationApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

const columns = [
  {
    key: "taskName",
    label: "Task",
    dataIndex: "taskName"
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "plan",
    label: "Plan",
    dataIndex: "plan",
    render: (value) => value?.planName || "—"
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "assignedTo",
    label: "Owner",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "—"
  },
  {
    key: "dueDate",
    label: "Due Date",
    dataIndex: "dueDate",
    render: (value) => formatDate(value)
  }
];

const filters = [
  { key: "status", label: "Status", type: "select", options: ACTIVATION_STATUSES }
];

const ActivationList = () => (
  <CrudListPage
    title="Activation Tasks"
    columns={columns}
    filters={filters}
    fetcher={activationApi.getTasks}
    dataKey="tasks"
    createPath="/activation/new"

    // ⭐ DELETE ENABLED FOR EVERY ROW
    responseAdapter={(response) => ({
      items: (response.tasks || []).map((item) => ({
        ...item,
        deleteFn: activationApi.deleteTask   // ⭐ KEY PART
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/activation/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>
        <Link
          to={`/activation/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>
        {/* DataTable will auto-render DELETE button */}
      </div>
    )}
  />
);

export default ActivationList;
