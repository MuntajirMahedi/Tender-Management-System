// src/pages/invoices/InvoiceList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { invoiceApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  {
    key: "invoiceNumber",
    label: "Invoice",
    dataIndex: "invoiceNumber"
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "totalAmount",
    label: "Total",
    dataIndex: "totalAmount",
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
  },
  {
    key: "paymentStatus",
    label: "Payment",
    dataIndex: "paymentStatus",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    dataIndex: "invoiceDate",
    render: (value) => formatDate(value)
  }
];

const InvoiceList = () => {
  const { can } = usePermission();

  const canView = can("invoice:view");
  const canCreate = can("invoice:create");
  const canUpdate = can("invoice:update");
  const canDelete = can("invoice:delete");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

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
        const res = await invoiceApi.getInvoices();

        const list =
          Array.isArray(res?.invoices) ? res.invoices :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setInvoices(list);
      } catch (err) {
        console.error("Unable to load invoices", err);
        toast.error("Unable to load invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched invoices
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return invoices.filter((inv) => {
      if (paymentStatusFilter && inv.paymentStatus !== paymentStatusFilter) {
        return false;
      }

      if (!term) return true;

      const invNo = (inv.invoiceNumber || "").toLowerCase();
      const clientName = (inv.client?.name || "").toLowerCase();
      const status = (inv.paymentStatus || "").toLowerCase();
      const amountStr = String(inv.totalAmount || "").toLowerCase();

      return (
        invNo.includes(term) ||
        clientName.includes(term) ||
        status.includes(term) ||
        amountStr.includes(term)
      );
    });
  }, [invoices, paymentStatusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedInvoices = filtered.slice(startIndex, endIndex);

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

  const handleDelete = async (id, invoiceNumber) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete invoice "${invoiceNumber}"?`
    );
    if (!confirmed) return;

    try {
      await invoiceApi.deleteInvoice(id);
      toast.success(`Invoice "${invoiceNumber}" deleted successfully`);

      setInvoices((prev) => prev.filter((inv) => (inv._id || inv.id) !== id));
    } catch (err) {
      console.error("Failed to delete invoice", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete invoice";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="invoice:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Invoices</h4>
            <small className="text-muted">
              Manage all generated invoices and their payment status
            </small>
          </div>

          {canCreate && (
            <Link to="/invoices/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Invoice
            </Link>
          )}
        </div>

        {/* FILTERS + SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
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
                {PAYMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
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
                placeholder="Search by invoice, client or status"
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
              <p className="p-3 mb-0 text-muted">No invoices found.</p>
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
                    {paginatedInvoices.map((row) => {
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
                                  to={`/invoices/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/invoices/${rowId}/edit`}
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
                                    handleDelete(rowId, row.invoiceNumber)
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

export default InvoiceList;
