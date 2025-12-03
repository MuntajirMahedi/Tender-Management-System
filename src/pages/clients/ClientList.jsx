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
import PageHeader from "../../components/PageHeader";

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
    ),
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
    ),
  },
  {
    key: "assignedSales",
    label: "Sales Owner",
    dataIndex: "assignedSales",
    render: (value) => value?.name || "—",
  },
  {
    key: "assignedCare",
    label: "Care Owner",
    dataIndex: "assignedCare",
    render: (value) => value?.name || "—",
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />,
  },
];

const ClientList = () => {
  const { can } = usePermission();

  const canView = can("client:view");
  const canCreate = can("client:create");
  const canUpdate = can("client:update");
  const canDelete = can("client:delete");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // DELETE MODAL STATE (single + bulk)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // MULTI SELECT
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // FILTER + SEARCH
  const filtered = useMemo(() => {
    const t = debouncedSearch.trim().toLowerCase();

    return clients.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;

      if (!t) return true;

      return (
        (c.name || "").toLowerCase().includes(t) ||
        (c.companyName || "").toLowerCase().includes(t) ||
        (c.mobile || "").toLowerCase().includes(t) ||
        (c.email || "").toLowerCase().includes(t) ||
        (c.clientCode || "").toLowerCase().includes(t)
      );
    });
  }, [clients, statusFilter, debouncedSearch]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedClients = filtered.slice(startIndex, endIndex);

  /* -------------------------
      SINGLE DELETE
  ------------------------- */
  const confirmDelete = (id, name) => {
    setIsBulkDelete(false);
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  /* -------------------------
      BULK DELETE - OPEN MODAL
  ------------------------- */
  const openBulkDelete = () => {
    if (selected.length === 0) {
      toast.info("No clients selected");
      return;
    }

    setIsBulkDelete(true);
    setDeleteName(`${selected.length} clients`);
    setShowDeleteModal(true);
  };

  /* -------------------------
      DELETE HANDLE (single + bulk)
  ------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        await Promise.all(selected.map((id) => clientApi.deleteClient(id)));

        setClients((prev) =>
          prev.filter((c) => !selected.includes(c._id || c.id))
        );

        toast.success("Selected clients deleted");

        setSelected([]);
        setSelectAll(false);
        setIsBulkDelete(false);
      } else {
        await clientApi.deleteClient(deleteId);

        toast.success(`Client "${deleteName}" deleted`);

        setClients((prev) =>
          prev.filter((c) => (c._id || c.id) !== deleteId)
        );
      }

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* -------------------------
        MULTI SELECT
  ------------------------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const ids = paginatedClients.map((c) => c._id || c.id);
      setSelected(ids);
    }
    setSelectAll(!selectAll);
  };

  return (
    <RequirePermission permission="client:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader title="Clients" subtitle="Manage all clients" />

          <div className="d-flex gap-2">
            {selected.length > 0 && (
              <button className="btn btn-danger" onClick={openBulkDelete}>
                <i className="bi bi-trash me-1"></i>
                Delete Selected ({selected.length})
              </button>
            )}

            {canCreate && (
              <Link to="/clients/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2" />
                New Client
              </Link>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-4 col-md-3">
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
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-8 col-md-4">
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search name, company, mobile, email, code"
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
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th width="50">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>

                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}

                  <th width="180">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3 text-muted">
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((row) => {
                    const rowId = row._id || row.id;

                    return (
                      <tr key={rowId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(rowId)}
                            onChange={() => toggleSelect(rowId)}
                          />
                        </td>

                        {columns.map((col) => {
                          const raw =
                            col.dataIndex === "assignedSales"
                              ? row.assignedSales
                              : col.dataIndex === "assignedCare"
                              ? row.assignedCare
                              : row[col.dataIndex];

                          return (
                            <td key={col.key}>
                              {col.render ? col.render(raw, row) : raw}
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
                  })
                )}
              </tbody>
            </table>
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
                    Are you sure you want to delete{" "}
                    <strong>{deleteName}</strong>?
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
