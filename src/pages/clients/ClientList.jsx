// src/pages/clients/ClientList.jsx
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { clientApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";

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

const ClientList = () => (
  <CrudListPage
    title="Clients"
    columns={columns}
    fetcher={clientApi.getClients}
    dataKey="clients"
    createPath="/clients/new"
    filters={filters}
    responseAdapter={(response) => ({
      items: response.clients || [],
      total: response.count || 0
    })}
    actions={(row) => {
  row.deleteFn = () => clientApi.deleteClient(row.id || row._id);

  return (
    <div className="btn-group btn-group-sm">
      <Link
        to={`/clients/${row.id || row._id}`}
        className="btn btn-outline-secondary"
      >
        View
      </Link>
      <Link
        to={`/clients/${row.id || row._id}/edit`}
        className="btn btn-outline-primary"
      >
        Edit
      </Link>
    </div>
  );
}}

  />
);

export default ClientList;
