// src/pages/clients/ClientList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import StatusBadge from "../../components/StatusBadge";
import { clientApi } from "../../api";
import { CLIENT_STATUSES } from "../../utils/constants";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

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
        <div>{value || "—"}</div>
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

const ClientList = () => {
  const { can } = usePermission();

  const canView = can("client:view");
  const canCreate = can("client:create");
  const canUpdate = can("client:update");
  const canDelete = can("client:delete");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await clientApi.getClients();

        const list =
          Array.isArray(res?.clients)
            ? res.clients
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setClients(list);
      } catch (err) {
        toast.error("Unable to load clients");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + Search combined
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return clients.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;

      if (!term) return true;

      return (
        (c.name || "").toLowerCase().includes(term) ||
        (c.companyName || "").toLowerCase().includes(term) ||
        (c.mobile || "").toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term) ||
        (c.clientCode || "").toLowerCase().includes(term)
      );
    });
  }, [clients, statusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedClients = filtered.slice(startIndex, endIndex);

  /* -------------------------
      OPEN DELETE MODAL
  ------------------------- */
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  /* -------------------------
      ACTUAL DELETE FUNCTION
  ------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await clientApi.deleteClient(deleteId);

      toast.success(`Client "${deleteName}" deleted`);

      setClients((prev) =>
        prev.filter((c) => (c._id || c.id) !== deleteId)
      );

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="client:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Clients</h4>
            <small className="text-muted">Manage all your clients</small>
          </div>

          {canCreate && (
            <Link to="/clients/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Client
            </Link>
          )}
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-4 col-md-3">
              <label className="form-label small text-muted mb-1">Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-8 col-md-4">
              <label className="form-label small text-muted mb-1">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search name, company, mobile, email, client code"
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
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No clients found.</p>
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
                    {paginatedClients.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue =
                              col.dataIndex === "assignedSales"
                                ? row.assignedSales
                                : col.dataIndex === "assignedCare"
                                ? row.assignedCare
                                : row[col.dataIndex];

                            return (
                              <td key={col.key}>
                                {col.render ? col.render(rawValue, row) : rawValue}
                              </td>
                            );
                          })}

                          <td>
                            <div className="btn-group btn-group-sm">
                              {canView && (
                                <Link
                                  to={`/clients/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/clients/${rowId}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => confirmDelete(rowId, row.name)}
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
          {!loading && total > 0 && (
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
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <span className="text-muted small">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>

                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ---------- DELETE CONFIRM MODAL ---------- */}
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
                    Are you sure you want to delete client  
                    <strong> {deleteName} </strong>?
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

export default ClientList;
