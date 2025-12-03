// src/pages/audit/AuditLogs.jsx
import { useEffect, useMemo, useState } from "react";
import { auditApi } from "../../api";
import { formatDateTime } from "../../utils/formatters";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";

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

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination state
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 10 / 25 / 50 / 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await auditApi.getAuditLogs();

        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.logs)) {
          list = res.logs;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        }

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

  // filter logs by search (user, module, action, description)
  const filteredLogs = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return logs;

    return logs.filter((log) => {
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
    });
  }, [logs, debouncedSearch]);

  const total = filteredLogs.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  // clamp current page so we never go out of range
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1); // reset to first page when page size changes
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <RequirePermission permission="audit:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <PageHeader title="Audit Logs" subtitle="Track every activity performed in the platform" />
            {/* <h4 className="mb-0">Audit Logs</h4>
            <small className="text-muted">
              Track every activity performed in the platform
            </small> */}
          </div>

          <div style={{ minWidth: 260 }}>
            <label className="form-label text-muted small mb-1">Search</label>
            <input
              className="form-control"
              placeholder="Search by user, module, action or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No audit logs found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log._id || log.id}>
                        {columns.map((col) => {
                          const rawValue =
                            col.dataIndex === "user" ? log.user : log[col.dataIndex];
                          return (
                            <td key={col.key}>
                              {col.render ? col.render(rawValue, log) : rawValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          {!loading && total > 0 && (
            <div className="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
              {/* left: page size + info */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-muted small">entries</span>

                <span className="text-muted small ms-3">
                  Showing{" "}
                  {total === 0
                    ? "0"
                    : `${startIndex + 1}–${endIndex}`}{" "}
                  of {total} entries
                </span>
              </div>

              {/* right: pagination buttons */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handlePrev}
                  disabled={currentPage <= 1}
                >
                  Prev
                </button>
                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
};

export default AuditLogs;
