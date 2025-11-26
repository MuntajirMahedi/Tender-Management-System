import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { activationApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

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

const ActivationList = () => {
  const { can } = usePermission();

  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");
  const canDelete = can("activation:delete");

  return (
    <RequirePermission permission="activation:view">
      <CrudListPage
        title="Activation Tasks"
        columns={columns}
        filters={filters}
        fetcher={activationApi.getTasks}
        dataKey="tasks"
        // show Add only if user has create permission
        createPath={canCreate ? "/activation/new" : undefined}
        responseAdapter={(response) => {
          const tasks = response.tasks || [];
          return {
            items: tasks.map((item) => ({
              ...item,
              // DataTable will only render delete button if deleteFn exists
              deleteFn: canDelete ? activationApi.deleteTask : undefined
            })),
            total: response.count || 0
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            <Link
              to={`/activation/${row.id || row._id}`}
              className="btn btn-outline-secondary"
            >
              View
            </Link>
            {canUpdate && (
              <Link
                to={`/activation/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}
            {/* delete button handled by deleteFn above */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default ActivationList;
