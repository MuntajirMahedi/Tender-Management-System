// src/pages/payments/PaymentList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { paymentApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";
import PageHeader from "../../components/PageHeader";

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
    key: "planType",
    label: "Plan Type",
    dataIndex: "planType",
    render: (_, row) => row.plan?.planType || "—"
  },
  {
    key: "amount",
    label: "Amount",
    dataIndex: "amount",
    align: "center",
    render: (value) => (
      <div className="text-center fw-semibold">
        {formatCurrency(value || 0, "INR")}
      </div>
    )
  },
  {
    key: "paymentMode",
    label: "Mode",
    dataIndex: "paymentMode"
  },
  {
    key: "paymentDate",
    label: "Date",
    dataIndex: "paymentDate",
    render: (value) => formatDate(value)
  }
];

const PaymentList = () => {
  const { can } = usePermission();

  const canView = can("payment:view");
  const canCreate = can("payment:create");
  const canUpdate = can("payment:update");
  const canDelete = can("payment:delete");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal + delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete flag
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // MULTI SELECT
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filters
  const [modeFilter, setModeFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await paymentApi.getPayments();

        const list =
          Array.isArray(res?.payments)
            ? res.payments
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setPayments(list);
      } catch (err) {
        toast.error("Unable to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Search + filter
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return payments.filter((p) => {
      if (modeFilter && p.paymentMode !== modeFilter) return false;

      if (!term) return true;

      return (
        (p.client?.name || "").toLowerCase().includes(term) ||
        (p.plan?.planName || "").toLowerCase().includes(term) ||
        (p.paymentMode || "").toLowerCase().includes(term) ||
        String(p.amount || "").includes(term)
      );
    });
  }, [payments, modeFilter, debouncedSearch]);

  // Pagination compute
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedPayments = filtered.slice(startIndex, endIndex);

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
      toast.info("No payments selected");
      return;
    }

    setIsBulkDelete(true);
    setDeleteName(`${selected.length} payments`);
    setShowDeleteModal(true);
  };

  /* -------------------------
      DELETE HANDLER
  ------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        await Promise.all(selected.map((id) => paymentApi.deletePayment(id)));

        setPayments((prev) =>
          prev.filter((p) => !selected.includes(p._id || p.id))
        );

        toast.success("Selected payments deleted");

        setSelected([]);
        setSelectAll(false);
      } else {
        await paymentApi.deletePayment(deleteId);

        toast.success(`Payment for "${deleteName}" deleted`);

        setPayments((prev) =>
          prev.filter((p) => (p._id || p.id) !== deleteId)
        );
      }

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setIsBulkDelete(false);
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
      const ids = paginatedPayments.map((p) => p._id || p.id);
      setSelected(ids);
    }
    setSelectAll(!selectAll);
  };

  return (
    <RequirePermission permission="payment:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader title="Payments" subtitle="Track incoming payments" />

          <div className="d-flex gap-2">
            {selected.length > 0 && (
              <button className="btn btn-danger" onClick={openBulkDelete}>
                <i className="bi bi-trash me-1"></i>
                Delete Selected ({selected.length})
              </button>
            )}

            {canCreate && (
              <Link to="/payments/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                New Payment
              </Link>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Mode</label>
              <select
                className="form-select form-select-sm"
                value={modeFilter}
                onChange={(e) => {
                  setModeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search client, plan, mode, amount"
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
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3 text-muted">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((row) => {
                    const rowId = row._id || row.id;

                    return (
                      <tr key={rowId}>
                        {/* Row checkbox */}
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(rowId)}
                            onChange={() => toggleSelect(rowId)}
                          />
                        </td>

                        {/* Table columns */}
                        {columns.map((col) => {
                          const rawValue =
                            col.dataIndex === "client"
                              ? row.client
                              : col.dataIndex === "plan"
                              ? row.plan
                              : col.dataIndex === "planType"
                              ? row.plan?.planType
                              : row[col.dataIndex];

                          return (
                            <td
                              key={col.key}
                              className={col.align === "center" ? "text-center" : ""}
                            >
                              {col.render ? col.render(rawValue, row) : rawValue}
                            </td>
                          );
                        })}

                        {/* ACTIONS */}
                        <td>
                          <div className="btn-group btn-group-sm">
                            {canView && (
                              <Link
                                to={`/payments/${rowId}`}
                                className="btn btn-outline-secondary"
                              >
                                View
                              </Link>
                            )}
                            {canUpdate && (
                              <Link
                                to={`/payments/${rowId}/edit`}
                                className="btn btn-outline-primary"
                              >
                                Edit
                              </Link>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  confirmDelete(rowId, row.client?.name)
                                }
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

export default PaymentList;
