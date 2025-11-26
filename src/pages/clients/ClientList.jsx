// src/pages/clients/ClientList.jsx
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { clientApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

const columns = [
  {
    key: "name",
    label: "Client",
    dataIndex: "name",
    render: (value, row) => (
      <div>
        <div className="fw-semibold">{value}</div>
        <div className="text-muted small">{row.companyName || "—"}</div>
      </div>
    )
  },
  {
    key: "contact",
    label: "Contact",
    dataIndex: "mobile",
    render: (value, row) => (
      <div>
        <div>{value}</div>
        <div className="text-muted small">{row.email || "NA"}</div>
      </div>
    )
  },
  {
    key: "assignedSales",
    label: "Sales Owner",
    dataIndex: "assignedSales",
    render: (value) => value?.name || "—"
  },
  {
    key: "assignedCare",
    label: "Care Owner",
    dataIndex: "assignedCare",
    render: (value) => value?.name || "—"
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "city",
    label: "City",
    dataIndex: "city"
  }
];

const filters = [
  { key: "status", label: "Status", type: "select", options: CLIENT_STATUSES },
  { key: "city", label: "City", type: "text", placeholder: "City" }
];

const ClientList = () => {
  const { can } = usePermission();

  const canView = can("client:view");
  const canCreate = can("client:create");
  const canUpdate = can("client:update");
  const canDelete = can("client:delete");

  return (
    // 🔒 If user has no client:view, whole page is hidden / blocked
    <RequirePermission permission="client:view">
      <CrudListPage
        title="Clients"
        columns={columns}
        fetcher={clientApi.getClients}
        dataKey="clients"
        // ➕ Add button only if user has client:create
        createPath={canCreate ? "/clients/new" : undefined}
        filters={filters}
        responseAdapter={(response) => {
          const clients = response.clients || [];
          return {
            items: clients.map((item) => ({
              ...item,
              // 🗑️ Delete only available if user has client:delete
              deleteFn: canDelete ? clientApi.deleteClient : undefined
            })),
            total: response.count || 0
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {/* 👁 View button controlled by client:view */}
            {canView && (
              <Link
                to={`/clients/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏️ Edit button controlled by client:update */}
            {canUpdate && (
              <Link
                to={`/clients/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}
            {/* 🗑 Delete button comes from deleteFn above */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default ClientList;
