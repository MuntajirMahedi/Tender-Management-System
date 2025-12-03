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
import PageHeader from "../../components/PageHeader";

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
    render: (v) => v?.name || "—"
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
    align: "center",
    render: (value) => (
      <div className="fw-semibold text-center">
        {formatCurrency(value || 0, "INR")}
      </div>
    )
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

  // DELETE MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // MULTI SELECT
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // FILTERS
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // SEARCH
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // PAGINATION
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await planApi.getPlans();

        const list =
          Array.isArray(res?.plans)
            ? res.plans
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setPlans(list);
      } catch (err) {
        toast.error("Unable to load plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // FILTER + SEARCH
  const filtered = useMemo(() => {
    const t = debouncedSearch.trim().toLowerCase();

    return plans.filter((p) => {
      if (planTypeFilter && p.planType !== planTypeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (paymentStatusFilter && p.paymentStatus !== paymentStatusFilter)
        return false;

      if (!t) return true;

      const name = (p.planName || "").toLowerCase();
      const code = (p.planCode || "").toLowerCase();
      const client = (p.client?.name || "").toLowerCase();

      return (
        name.includes(t) ||
        code.includes(t) ||
        client.includes(t)
      );
    });
  }, [plans, planTypeFilter, statusFilter, paymentStatusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedPlans = filtered.slice(startIndex, endIndex);

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
        BULK DELETE OPEN MODAL
  ------------------------- */
  const openBulkDelete = () => {
    if (selected.length === 0) {
      toast.info("No plans selected");
      return;
    }

    setIsBulkDelete(true);
    setDeleteName(`${selected.length} plans`);
    setShowDeleteModal(true);
  };

  /* -------------------------
        DELETE HANDLER
  ------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        await Promise.all(selected.map((id) => planApi.deletePlan(id)));

        setPlans((prev) =>
          prev.filter((p) => !selected.includes(p._id || p.id))
        );

        toast.success("Selected plans deleted");

        setSelected([]);
        setSelectAll(false);
        setIsBulkDelete(false);
      } else {
        await planApi.deletePlan(deleteId);

        toast.success(`Plan "${deleteName}" deleted`);

        setPlans((prev) =>
          prev.filter((p) => (p._id || p.id) !== deleteId)
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
        MULTI SELECT LOGIC
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
      const ids = paginatedPlans.map((p) => p._id || p.id);
      setSelected(ids);
    }
    setSelectAll(!selectAll);
  };

  return (
    <RequirePermission permission="plan:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader title="Plans" subtitle="Manage all plans & subscriptions" />

          <div className="d-flex gap-2">
            {/* BULK DELETE BTN */}
            {selected.length > 0 && (
              <button className="btn btn-danger" onClick={openBulkDelete}>
                <i className="bi bi-trash me-1"></i>
                Delete Selected ({selected.length})
              </button>
            )}

            {canCreate && (
              <Link to="/plans/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                New Plan
              </Link>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">

            {/* Plan Type */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small">Plan Type</label>
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

            {/* Status */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small">Status</label>
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
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small">Payment</label>
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
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search plan, code, client"
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
                    <th
                      key={col.key}
                      className={col.align === "center" ? "text-center" : ""}
                    >
                      {col.label}
                    </th>
                  ))}

                  <th width="150">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length + 2} className="p-3">Loading...</td></tr>
                ) : paginatedPlans.length === 0 ? (
                  <tr><td colSpan={columns.length + 2} className="p-3 text-muted">No plans found.</td></tr>
                ) : (
                  paginatedPlans.map((row) => {
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
                            col.dataIndex === "client"
                              ? row.client
                              : row[col.dataIndex];

                          return (
                            <td
                              key={col.key}
                              className={col.align === "center" ? "text-center" : ""}
                            >
                              {col.render ? col.render(raw, row) : raw}
                            </td>
                          );
                        })}

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
                                className="btn btn-outline-danger"
                                onClick={() => confirmDelete(rowId, row.planName)}
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

export default PlanList;
