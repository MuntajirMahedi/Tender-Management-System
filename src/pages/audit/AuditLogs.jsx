// src/pages/audit/AuditLogs.jsx
import { useEffect, useMemo, useState } from "react";
import { auditApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";

const columns = [
  { key: "createdAt", label: "Timestamp", dataIndex: "createdAt", render: (v) => formatDateTime(v) },
  { key: "user", label: "User", dataIndex: "user", render: (v) => v?.name || "System" },
  { key: "module", label: "Module", dataIndex: "module" },
  { key: "action", label: "Action", dataIndex: "action" },
  { key: "description", label: "Description", dataIndex: "description" }
];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await auditApi.getAuditLogs();

        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.logs)) list = res.logs;
        else if (Array.isArray(res?.data)) list = res.data;

        setLogs(list);
      } catch (err) {
        console.error("Unable to load audit logs", err);
        toast.error("Unable to load audit logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ===== FILTERING =====
  const filteredLogs = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return logs.filter((log) => {
      const uName = (log.user?.name || "").toLowerCase();
      const m = (log.module || "").toLowerCase();
      const a = (log.action || "").toLowerCase();
      const d = (log.description || "").toLowerCase();

      const created = new Date(log.createdAt);
      const afterFrom = dateFrom ? created >= new Date(dateFrom) : true;
      const beforeTo = dateTo ? created <= new Date(dateTo + " 23:59:59") : true;

      return (
        (term === "" ||
          uName.includes(term) ||
          m.includes(term) ||
          a.includes(term) ||
          d.includes(term)) &&
        (filterUser ? uName === filterUser.toLowerCase() : true) &&
        (filterModule ? m === filterModule.toLowerCase() : true) &&
        (filterAction ? a === filterAction.toLowerCase() : true) &&
        afterFrom &&
        beforeTo
      );
    });
  }, [logs, debouncedSearch, filterUser, filterModule, filterAction, dateFrom, dateTo]);

  // pagination
  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  // extract unique filter lists
  const users = [...new Set(logs.map((l) => l.user?.name).filter(Boolean))];
  const modules = [...new Set(logs.map((l) => l.module).filter(Boolean))];
  const actions = [...new Set(logs.map((l) => l.action).filter(Boolean))];

  return (
    <RequirePermission permission="audit:view">
      <div>
        <PageHeader title="Audit Logs" subtitle="Track every activity performed in the platform" />

        {/* FILTER BAR */}
        <div className="card p-3 shadow-sm mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Search</label>
              <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." />
            </div>

            <div className="col-md-2">
              <label className="form-label small">User</label>
              <select className="form-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                <option value="">All</option>
                {users.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small">Module</label>
              <select className="form-select" value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                <option value="">All</option>
                {modules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small">Action</label>
              <select className="form-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                <option value="">All</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="col-md-1">
              <label className="form-label small">From</label>
              <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="col-md-1">
              <label className="form-label small">To</label>
              <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        {/* TABLE + PAGINATION */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3">Loading...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="p-3 text-muted mb-0">No audit logs found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
                  </thead>

                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log._id || log.id}>
                        {columns.map((col) => {
                          const raw = col.dataIndex === "user" ? log.user : log[col.dataIndex];
                          return <td key={col.key}>{col.render ? col.render(raw) : raw}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          {!loading && filteredLogs.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Show</span>
                <select className="form-select form-select-sm" value={pageSize} onChange={(e) => { setPageSize(+e.target.value); setPage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="small text-muted ms-3">
                  Showing {startIndex + 1}–{Math.min(startIndex + pageSize, total)} of {total}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
                <span className="small">Page {currentPage} of {totalPages}</span>
                <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
};

export default AuditLogs;
