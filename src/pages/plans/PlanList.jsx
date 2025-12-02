// src/pages/plans/PlanList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import StatusBadge from "../../components/StatusBadge";
import { planApi } from "../../api";
import {
  PLAN_TYPES,
  PLAN_STATUSES,
  PAYMENT_STATUSES
} from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  {
    key: "planName",
    label: "Plan",
    dataIndex: "planName",
    render: (value, row) => (
      <div>
        <div className="fw-semibold">{value}</div>
        <div className="text-muted small">{row.planCode}</div>
      </div>
    )
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "planType",
    label: "Type",
    dataIndex: "planType"
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "paymentStatus",
    label: "Payment",
    dataIndex: "paymentStatus",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "netAmount",
    label: "Net Amount",
    dataIndex: "netAmount",
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
  }
];

const PlanList = () => {
  const { can } = usePermission();

  const canView = can("plan:view");
  const canCreate = can("plan:create");
  const canUpdate = can("plan:update");
  const canDelete = can("plan:delete");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // search (plan name / code / client)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 1, 5, 10, 20, 50, 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await planApi.getPlans();

        const list =
          Array.isArray(res?.plans) ? res.plans :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setPlans(list);
      } catch (err) {
        console.error("Unable to load plans", err);
        toast.error("Unable to load plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched plans
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return plans.filter((p) => {
      if (planTypeFilter && p.planType !== planTypeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (paymentStatusFilter && p.paymentStatus !== paymentStatusFilter)
        return false;

      if (!term) return true;

      const name = (p.planName || "").toLowerCase();
      const code = (p.planCode || "").toLowerCase();
      const clientName = (p.client?.name || "").toLowerCase();

      return (
        name.includes(term) ||
        code.includes(term) ||
        clientName.includes(term)
      );
    });
  }, [
    plans,
    planTypeFilter,
    statusFilter,
    paymentStatusFilter,
    debouncedSearch
  ]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedPlans = filtered.slice(startIndex, endIndex);

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

  const handleDelete = async (id, name) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete plan "${name}"?`
    );
    if (!confirmed) return;

    try {
      await planApi.deletePlan(id);
      toast.success(`Plan "${name}" deleted successfully`);

      setPlans((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error("Failed to delete plan", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete plan";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="plan:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Plans</h4>
            <small className="text-muted">
              Manage all client plans and subscriptions
            </small>
          </div>

          {canCreate && (
            <Link to="/plans/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Plan
            </Link>
          )}
        </div>

        {/* FILTERS + SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted mb-1">
                Plan Type
              </label>
              <select
                className="form-select form-select-sm"
                value={planTypeFilter}
                onChange={(e) => {
                  setPlanTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {PLAN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

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
                {PLAN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted mb-1">
                Payment Status
              </label>
              <select
                className="form-select form-select-sm"
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted mb-1">
                Search
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by plan name, code or client"
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
              <p className="p-3 mb-0 text-muted">No plans found.</p>
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
                    {paginatedPlans.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue;
                            if (col.dataIndex === "client") {
                              rawValue = row.client;
                            } else {
                              rawValue = row[col.dataIndex];
                            }

                            return (
                              <td
                                key={col.key}
                                className={
                                  col.align === "right" ? "text-end" : ""
                                }
                              >
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
                                  to={`/plans/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/plans/${rowId}/edit`}
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
                                    handleDelete(rowId, row.planName)
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

export default PlanList;
