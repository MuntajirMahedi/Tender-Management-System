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
  { key: "taskName", label: "Task", dataIndex: "taskName" },

  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—",
  },

  {
    key: "plan",
    label: "Plan",
    dataIndex: "plan",
    render: (value) => value?.planName || "—",
  },

  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />,
  },

  {
    key: "assignedTo",
    label: "Owner",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "—",
  },

  {
    key: "dueDate",
    label: "Due Date",
    dataIndex: "dueDate",
    render: (value) => formatDate(value),
  },
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

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await activationApi.getTasks();

        const list =
          Array.isArray(res?.tasks)
            ? res.tasks
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setTasks(list);
      } catch (err) {
        toast.error("Unable to load activation tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** Filter + Search */
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;

      if (!term) return true;

      return (
        (t.taskName || "").toLowerCase().includes(term) ||
        (t.client?.name || "").toLowerCase().includes(term) ||
        (t.plan?.planName || "").toLowerCase().includes(term) ||
        (t.assignedTo?.name || "").toLowerCase().includes(term) ||
        (t.status || "").toLowerCase().includes(term)
      );
    });
  }, [tasks, statusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedTasks = filtered.slice(startIndex, endIndex);

  /** OPEN MODAL */
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  /** PERFORM DELETE */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await activationApi.deleteTask(deleteId);

      toast.success(`Task "${deleteName}" deleted successfully`);

      setTasks((prev) =>
        prev.filter((t) => (t._id || t.id) !== deleteId)
      );

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete activation task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="activation:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Activation Tasks</h4>
            <small className="text-muted">
              Manage all onboarding + activation tasks
            </small>
          </div>

          {canCreate && (
            <Link to="/activation/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              New Activation Task
            </Link>
          )}
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">

            {/* Status */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Status</label>
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

            {/* Search */}
            <div className="col-sm-6 col-md-4">
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Task / Client / Plan / Owner / Status"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-3 mb-0 text-muted">No activation tasks found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th width="180">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTasks.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const value =
                              col.dataIndex === "client"
                                ? row.client
                                : col.dataIndex === "plan"
                                ? row.plan
                                : col.dataIndex === "assignedTo"
                                ? row.assignedTo
                                : row[col.dataIndex];

                            return (
                              <td key={col.key}>
                                {col.render ? col.render(value, row) : value}
                              </td>
                            );
                          })}

                          {/* ACTION BUTTON GROUP */}
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
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    confirmDelete(rowId, row.taskName)
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

          {/* PAGINATION */}
          {!loading && filtered.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>

                <span className="text-muted small">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>

                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>

            </div>
          )}
        </div>

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete task  
                    <strong> "{deleteName}" </strong>?
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-danger"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show"></div>
          </>
        )}

      </div>
    </RequirePermission>
  );
};

export default ActivationList;
