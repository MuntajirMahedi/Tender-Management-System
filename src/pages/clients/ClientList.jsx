// src/pages/clients/ClientList.jsx
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { clientApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";

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
  }
];

const filters = [
  { key: "status", label: "Status", type: "select", options: CLIENT_STATUSES }
];

const ClientList = () => {
  const { can } = usePermission();

  const canView = can("client:view");
  const canCreate = can("client:create");
  const canUpdate = can("client:update");
  const canDelete = can("client:delete");

  return (
    <RequirePermission permission="client:view">
      <CrudListPage
        title="Clients"
        columns={columns}
        fetcher={clientApi.getClients}
        dataKey="clients"
        createPath={canCreate ? "/clients/new" : undefined}
        filters={filters}
        responseAdapter={(response, reload) => {
          const clients = response.clients || [];

          return {
            items: clients.map((item) => ({
              ...item,

              deleteFn: canDelete
                ? async () => {
                 

                    try {
                      await clientApi.deleteClient(item._id || item.id);
                      toast.success(`Client "${item.name}" deleted successfully`);
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete client";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: response.count || 0
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {canView && (
              <Link
                to={`/clients/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {canUpdate && (
              <Link
                to={`/clients/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default ClientList;
