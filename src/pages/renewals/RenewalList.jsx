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
    render: (value) => value?.name || "—"
  },
  {
    key: "plan",
    label: "Plan",
    dataIndex: "plan",
    render: (value) => value?.planName || "—"
  },
  {
    key: "newStartDate",
    label: "New Start",
    dataIndex: "newStartDate",
    render: (value) => formatDate(value)
  },
  {
    key: "newExpiryDate",
    label: "New Expiry",
    dataIndex: "newExpiryDate",
    render: (value) => formatDate(value)
  },
  {
    key: "durationMonths",
    label: "Duration (months)",
    dataIndex: "durationMonths"
  }
];

const RenewalList = () => {
  const { can } = usePermission();

  const canView = can("renewal:view");
  const canCreate = can("renewal:create");
  const canUpdate = can("renewal:update");
  const canDelete = can("renewal:delete");

  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 local search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // 📄 pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 1, 5, 10, 20, 50, 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await renewalApi.getRenewals();

        const list =
          Array.isArray(res?.renewals) ? res.renewals :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setRenewals(list);
      } catch (err) {
        console.error("Unable to load renewals", err);
        toast.error("Unable to load renewals");
        setRenewals([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched renewals
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return renewals.filter((r) => {
      if (!term) return true;

      const clientName = (r.client?.name || "").toLowerCase();
      const planName = (r.plan?.planName || "").toLowerCase();
      const durationStr = String(r.durationMonths || "").toLowerCase();

      return (
        clientName.includes(term) ||
        planName.includes(term) ||
        durationStr.includes(term)
      );
    });
  }, [renewals, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedRenewals = filtered.slice(startIndex, endIndex);

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

  const handleDelete = async (id) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this renewal?"
    );
    if (!confirmed) return;

    try {
      await renewalApi.deleteRenewal(id);
      toast.success("Renewal deleted successfully");

      setRenewals((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      console.error("Failed to delete renewal", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete renewal";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="renewal:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Renewals</h4>
            <small className="text-muted">
              Manage plan renewals and updated validity periods
            </small>
          </div>

          {canCreate && (
            <Link to="/renewals/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Renewal
            </Link>
          )}
        </div>

        {/* SEARCH ROW */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label text-muted small mb-1">
                Search
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by client, plan or duration"
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
              <p className="p-3 mb-0 text-muted">No renewals found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th style={{ width: "200px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRenewals.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue;
                            if (col.dataIndex === "client") {
                              rawValue = row.client;
                            } else if (col.dataIndex === "plan") {
                              rawValue = row.plan;
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
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(rowId)}
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

export default RenewalList;
