// src/pages/audit/AuditLogs.jsx
import CrudListPage from "../common/CrudListPage";
import { auditApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";

const columns = [
  {
    key: "createdAt",
    label: "Timestamp",
    dataIndex: "createdAt",
    render: (value) => formatDateTime(value)
  },
  {
    key: "user",
    label: "User",
    dataIndex: "user",
    render: (value) => value?.name || "System"
  },
  {
    key: "module",
    label: "Module",
    dataIndex: "module"
  },
  {
    key: "action",
    label: "Action",
    dataIndex: "action"
  },
  {
    key: "description",
    label: "Description",
    dataIndex: "description"
  }
];

const filters = [
  { key: "module", label: "Module", type: "text", placeholder: "Module" },
  { key: "action", label: "Action", type: "text", placeholder: "Action" }
];

const AuditLogs = () => (
  <CrudListPage
    title="Audit Logs"
    subtitle="Track every activity performed in the platform"
    columns={columns}
    filters={filters}
    fetcher={auditApi.getAuditLogs}
    dataKey="logs"
    responseAdapter={(response) => ({
      items: response.logs || [],
      total: response.count || 0
    })}
  />
);

export default AuditLogs;
