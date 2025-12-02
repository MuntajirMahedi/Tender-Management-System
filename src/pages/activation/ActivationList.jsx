// src/pages/activation/ActivationList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { activationApi } from "../../api";
import { ACTIVATION_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
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

const ActivationList = () => {
  const { can } = usePermission();

  const canView = can("activation:view");
  const canCreate = can("activation:create");
  const canUpdate = can("activation:update");
  const canDelete = can("activation:delete");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [statusFilter, setStatusFilter] = useState("");

  // search (frontend)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 1, 5, 10, 20, 50, 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await activationApi.getTasks();

        const list =
          Array.isArray(res?.tasks) ? res.tasks :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setTasks(list);
      } catch (err) {
        console.error("Unable to load activation tasks", err);
        toast.error("Unable to load activation tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched tasks
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;

      if (!term) return true;

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
    });
  }, [tasks, statusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedTasks = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleDelete = async (id, taskName) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete activation task "${taskName}"?`
    );
    if (!confirmed) return;

    try {
      await activationApi.deleteTask(id);
      toast.success(`Activation task "${taskName}" deleted successfully`);

      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch (err) {
      console.error("Failed to delete activation task", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete activation task";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="activation:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Activation Tasks</h4>
            <small className="text-muted">
              Manage all onboarding and activation tasks for clients
            </small>
          </div>

          {canCreate && (
            <Link to="/activation/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Activation Task
            </Link>
          )}
        </div>

        {/* FILTERS + SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted mb-1">
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {ACTIVATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-md-4">
              <label className="form-label small text-muted mb-1">
                Search
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by task, client, plan, owner or status"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No activation tasks found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTasks.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue;
                            if (col.dataIndex === "client") {
                              rawValue = row.client;
                            } else if (col.dataIndex === "plan") {
                              rawValue = row.plan;
                            } else if (col.dataIndex === "assignedTo") {
                              rawValue = row.assignedTo;
                            } else {
                              rawValue = row[col.dataIndex];
                            }

                            return (
                              <td key={col.key}>
                                {col.render
                                  ? col.render(rawValue, row)
                                  : rawValue}
                              </td>
                            );
                          })}

                          {/* Actions */}
                          <td>
                            <div className="btn-group btn-group-sm">
                              {canView && (
                                <Link
                                  to={`/activation/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/activation/${rowId}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(rowId, row.taskName)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
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

export default ActivationList;
