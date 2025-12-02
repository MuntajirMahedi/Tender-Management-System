// src/pages/renewals/RenewalList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { renewalApi } from "../../api";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (val) => val?.name || "—",
  },
  {
    key: "plan",
    label: "Plan",
    dataIndex: "plan",
    render: (val) => val?.planName || "—",
  },
  {
    key: "newStartDate",
    label: "New Start",
    dataIndex: "newStartDate",
    render: (val) => formatDate(val),
  },
  {
    key: "newExpiryDate",
    label: "New Expiry",
    dataIndex: "newExpiryDate",
    render: (val) => formatDate(val),
  },
  {
    key: "durationMonths",
    label: "Duration (months)",
    dataIndex: "durationMonths",
  },
];

const RenewalList = () => {
  const { can } = usePermission();

  const canView = can("renewal:view");
  const canCreate = can("renewal:create");
  const canUpdate = can("renewal:update");
  const canDelete = can("renewal:delete");

  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await renewalApi.getRenewals();

        const list =
          Array.isArray(res?.renewals)
            ? res.renewals
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setRenewals(list);
      } catch (err) {
        toast.error("Unable to load renewals");
        setRenewals([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + Search
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return renewals.filter((r) => {
      if (!term) return true;

      return (
        (r.client?.name || "").toLowerCase().includes(term) ||
        (r.plan?.planName || "").toLowerCase().includes(term) ||
        String(r.durationMonths || "").toLowerCase().includes(term)
      );
    });
  }, [renewals, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedRenewals = filtered.slice(startIndex, endIndex);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await renewalApi.deleteRenewal(deleteId);

      toast.success("Renewal deleted");

      setRenewals((prev) => prev.filter((r) => (r._id || r.id) !== deleteId));

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete renewal");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="renewal:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Renewals</h4>
            <small className="text-muted">
              Manage plan renewals & updated validity periods
            </small>
          </div>

          {canCreate && (
            <Link to="/renewals/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Renewal
            </Link>
          )}
        </div>

        {/* SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search client, plan, duration"
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
              <p className="p-3 mb-0 text-muted">No renewals found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th width="200">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRenewals.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const raw =
                              col.dataIndex === "client"
                                ? row.client
                                : col.dataIndex === "plan"
                                ? row.plan
                                : row[col.dataIndex];

                            return (
                              <td key={col.key}>
                                {col.render ? col.render(raw) : raw}
                              </td>
                            );
                          })}

                          <td>
                            <div className="btn-group btn-group-sm">
                              {canView && (
                                <Link
                                  to={`/renewals/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/renewals/${rowId}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => confirmDelete(rowId)}
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
                <span className="small text-muted">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 10, 20, 50, 100].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span className="small text-muted">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              <div className="d-flex gap-2">
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
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete this renewal?
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

            <div className="modal-backdrop fade show" />
          </>
        )}
      </div>
    </RequirePermission>
  );
};

export default RenewalList;
