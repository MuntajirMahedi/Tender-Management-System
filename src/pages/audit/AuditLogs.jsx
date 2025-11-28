// src/pages/audit/AuditLogs.jsx
import { useState } from "react";
import CrudListPage from "../common/CrudListPage";
import { auditApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

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
  // { key: "module", label: "Module", type: "text", placeholder: "Module" },
  // { key: "action", label: "Action", type: "text", placeholder: "Action" }
];

const AuditLogs = () => {
  // 🔍 Local search just for this page
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search input to show above table
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by user, module, action or description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="audit:view">
      <CrudListPage
        title="Audit Logs"
        subtitle="Track every activity performed in the platform"
        columns={columns}
        filters={filters}
        fetcher={auditApi.getAuditLogs}
        dataKey="logs"
        customSearchControl={customSearchControl}
        responseAdapter={(response) => {
          const logs = response.logs || [];
          const term = debouncedSearch.trim().toLowerCase();

          // 🔍 Client-side filtering
          const filteredLogs = term
            ? logs.filter((log) => {
                const userName = (log.user?.name || "").toLowerCase();
                const module = (log.module || "").toLowerCase();
                const action = (log.action || "").toLowerCase();
                const desc = (log.description || "").toLowerCase();

                return (
                  userName.includes(term) ||
                  module.includes(term) ||
                  action.includes(term) ||
                  desc.includes(term)
                );
              })
            : logs;

          return {
            items: filteredLogs,
            total: filteredLogs.length
          };
        }}
      />
    </RequirePermission>
  );
};

export default AuditLogs;
