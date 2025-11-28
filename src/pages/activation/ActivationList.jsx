// src/pages/activation/ActivationList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { activationApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

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

  const canView = can("activation:view");
  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");
  const canDelete = can("activation:delete");

  // 🔍 Local search (inside this file only)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Put our search box into CrudListPage's search slot
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by task, client, plan, owner or status"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="activation:view">
      <CrudListPage
        title="Activation Tasks"
        columns={columns}
        filters={filters}
        fetcher={activationApi.getTasks}
        dataKey="tasks"
        customSearchControl={customSearchControl}
        // ➕ Add button only if allowed
        createPath={canCreate ? "/activation/new" : undefined}
        // ✅ Search + delete with toast
        responseAdapter={(response, reload) => {
          const tasks = response.tasks || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredTasks = term
            ? tasks.filter((t) => {
                const taskName = (t.taskName || "").toLowerCase();
                const clientName = (t.client?.name || "").toLowerCase();
                const planName = (t.plan?.planName || "").toLowerCase();
                const ownerName = (t.assignedTo?.name || "").toLowerCase();
                const status = (t.status || "").toLowerCase();

                return (
                  taskName.includes(term) ||
                  clientName.includes(term) ||
                  planName.includes(term) ||
                  ownerName.includes(term) ||
                  status.includes(term)
                );
              })
            : tasks;

          return {
            items: filteredTasks.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {


                    try {
                      await activationApi.deleteTask(item._id || item.id);
                      toast.success(
                        `Activation task "${item.taskName}" deleted successfully`
                      );
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete activation task";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredTasks.length
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {/* 👁 VIEW only if activation:view */}
            {canView && (
              <Link
                to={`/activation/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏ EDIT only if activation:update */}
            {canUpdate && (
              <Link
                to={`/activation/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* 🗑 DELETE handled via deleteFn + toast */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default ActivationList;
