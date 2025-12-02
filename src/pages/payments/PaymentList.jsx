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
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
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

  // filters
  const [modeFilter, setModeFilter] = useState("");

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
        const res = await paymentApi.getPayments();

        const list =
          Array.isArray(res?.payments) ? res.payments :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setPayments(list);
      } catch (err) {
        console.error("Unable to load payments", err);
        toast.error("Unable to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched payments
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return payments.filter((p) => {
      if (modeFilter && p.paymentMode !== modeFilter) return false;

      if (!term) return true;

      const clientName = (p.client?.name || "").toLowerCase();
      const planName = (p.plan?.planName || "").toLowerCase();
      const paymentMode = (p.paymentMode || "").toLowerCase();
      const amountStr = String(p.amount || "").toLowerCase();

      return (
        clientName.includes(term) ||
        planName.includes(term) ||
        paymentMode.includes(term) ||
        amountStr.includes(term)
      );
    });
  }, [payments, modeFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedPayments = filtered.slice(startIndex, endIndex);

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
      "Are you sure you want to delete this payment?"
    );
    if (!confirmed) return;

    try {
      await paymentApi.deletePayment(id);
      toast.success("Payment deleted successfully");

      setPayments((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error("Failed to delete payment", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete payment";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="payment:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Payments</h4>
            <small className="text-muted">
              Track all payments received against client plans
            </small>
          </div>

          {canCreate && (
            <Link to="/payments/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Payment
            </Link>
          )}
        </div>

        {/* FILTERS + SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted mb-1">
                Mode
              </label>
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
              <label className="form-label small text-muted mb-1">
                Search
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by client, plan, mode or amount"
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
              <p className="p-3 mb-0 text-muted">No payments found.</p>
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
                    {paginatedPayments.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue;
                            if (col.dataIndex === "client") {
                              rawValue = row.client;
                            } else if (col.dataIndex === "plan") {
                              rawValue = row.plan;
                            } else if (col.dataIndex === "planType") {
                              rawValue = row.plan?.planType;
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

export default PaymentList;
