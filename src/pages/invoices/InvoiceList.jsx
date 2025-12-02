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

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * InvoiceList.jsx
 * - Single invoice popup + PDF
 * - Export All invoices popup + PDF
 * - CSV export for visible (filtered) list
 * - Centered modal (fixed overlay) so it doesn't go under sidebar
 */

// Table columns
const columns = [
  {
    key: "invoiceNumber",
    label: "Invoice No.",
    dataIndex: "invoiceNumber",
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—",
  },
  {
    key: "totalAmount",
    label: "Total",
    dataIndex: "totalAmount",
    align: "right",
    render: (value) => (
      <div className="text-end fw-semibold">{formatCurrency(value || 0)}</div>
    ),
  },
  {
    key: "paymentStatus",
    label: "Payment",
    dataIndex: "paymentStatus",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    dataIndex: "invoiceDate",
    render: (value) => formatDate(value),
  },
];

const InvoiceList = () => {
  const { can } = usePermission();

  const canView = can("invoice:view");
  const canCreate = can("invoice:create");
  const canUpdate = can("invoice:update");
  const canDelete = can("invoice:delete");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Single invoice preview
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // All invoices popup
  const [showAllInvoicePopup, setShowAllInvoicePopup] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getInvoices();

        const list =
          Array.isArray(res?.invoices)
            ? res.invoices
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setInvoices(list);
      } catch (err) {
        console.error("Invoice load error", err);
        toast.error("Unable to load invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + search (case-insensitive)
  const filtered = useMemo(() => {
    const term = (debouncedSearch || "").trim().toLowerCase();

    return invoices.filter((inv) => {
      if (paymentStatusFilter && inv.paymentStatus !== paymentStatusFilter)
        return false;

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedInvoices = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1);
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await invoiceApi.deleteInvoice(deleteId);

      setInvoices((prev) =>
        prev.filter((inv) => (inv._id || inv.id) !== deleteId)
      );

      toast.success("Invoice deleted");
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  // ------------ CSV EXPORT for visible (filtered) list ------------
  const escapeCSV = (s = "") => `"${String(s).replace(/"/g, '""')}"`;

  const downloadCSV = (rows, filename = "invoices.csv") => {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!filtered.length) {
      toast.info("No invoices to export");
      return;
    }

    const headers = [
      "Invoice Number",
      "Client",
      "Invoice Date",
      "Total Amount",
      "Payment Status",
      "Notes",
    ];
    const rows = filtered.map((inv) => [
      escapeCSV(inv.invoiceNumber),
      escapeCSV(inv.client?.name || ""),
      escapeCSV(formatDate(inv.invoiceDate)),
      escapeCSV(formatCurrency(inv.totalAmount || 0)),
      escapeCSV(inv.paymentStatus || ""),
      escapeCSV(inv.notes || ""),
    ]);

    downloadCSV([headers, ...rows], `invoices_${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("CSV exported");
  };

  // ------------ SINGLE PDF export (uses previewInvoice) ------------
  const generateSinglePDF = async () => {
    if (!previewInvoice) {
      toast.error("No invoice selected");
      return;
    }

    try {
      const element = document.getElementById("invoice-area");
      if (!element) {
        toast.error("Invoice area not found");
        return;
      }

      const canvas = await html2canvas(element, { scale: 3 });
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`${previewInvoice.invoiceNumber || "invoice"}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF error", err);
      toast.error("Failed to create PDF");
    }
  };

  // ------------ EXPORT ALL PDF (exports full invoices list shown in popup) ------------
  const generateAllPDF = async () => {
    try {
      const element = document.getElementById("all-invoice-area");
      if (!element) {
        toast.error("All invoice area not found");
        return;
      }

      const canvas = await html2canvas(element, { scale: 3 });
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`ALL-INVOICES_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("All invoices PDF downloaded");
    } catch (err) {
      console.error("All PDF error", err);
      toast.error("Failed to create All invoices PDF");
    }
  };

  return (
    <RequirePermission permission="invoice:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Invoices</h4>
            <small className="text-muted">Manage all invoices</small>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success"
              onClick={() => setShowAllInvoicePopup(true)}
              title="Export all invoices (preview + PDF)"
            >
              <i className="bi bi-download me-1" />
              Export All
            </button>

            {canCreate && (
              <Link to="/invoices/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2" />
                New Invoice
              </Link>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Payment Status</label>
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
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search invoice, client, status"
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
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={col.align === "right" ? "text-end" : ""}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center p-4 text-muted">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((row) => {
                    const id = row._id || row.id;
                    return (
                      <tr key={id}>
                        {columns.map((col) => {
                          const val =
                            col.dataIndex === "client" ? row.client : row[col.dataIndex];
                          return (
                            <td
                              key={col.key}
                              className={col.align === "right" ? "text-end" : ""}
                            >
                              {col.render ? col.render(val) : val}
                            </td>
                          );
                        })}

                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                                  className="btn btn-outline-success"
                                  onClick={() => {
                                    setPreviewInvoice(row);
                                    setShowInvoicePopup(true);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  title="View Invoice"
                                >
                                  <i className="bi bi-receipt-cutoff fs-6"></i>
                                </button>


                            <Link to={`/invoices/${id}`} className="btn btn-outline-secondary">
                              View
                            </Link>

                            {canUpdate && (
                              <Link to={`/invoices/${id}/edit`} className="btn btn-outline-primary">
                                Edit
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => confirmDelete(id, row.invoiceNumber)}
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

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>

                <select
                  className="form-select form-select-sm"
                  style={{ width: 80 }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
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

        {/* ========================= */}
        {/* SINGLE INVOICE POPUP */}
        {/* ========================= */}
        {showInvoicePopup && previewInvoice && (
          <div
            className="modal fade show d-block"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              background: "rgba(0,0,0,0.55)",
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
            }}
          >
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              style={{ margin: "0 auto", maxWidth: "1100px" }}
            >
              <div className="modal-content" style={{ borderRadius: 12 }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    Invoice #{previewInvoice.invoiceNumber}
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowInvoicePopup(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  <div
                    id="invoice-area"
                    style={{
                      background: "#fff",
                      padding: 28,
                      borderRadius: 10,
                      margin: "0 auto",
                      maxWidth: 900,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                      <div>
                        <h2 style={{ color: "#0041C2", marginBottom: 6 }}>DOT IT SOLUTIONS</h2>
                        <div style={{ color: "#666" }}>Ahmedabad, Gujarat</div>
                        <div style={{ color: "#666" }}>support@dotit.com • +91 99981 08980</div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{previewInvoice.paymentStatus}</div>
                        <div style={{ marginTop: 8 }}>Invoice #: <b>{previewInvoice.invoiceNumber}</b></div>
                        <div>Date: {formatDate(previewInvoice.invoiceDate)}</div>
                        <div>Due: {formatDate(previewInvoice.dueDate)}</div>
                      </div>
                    </div>

                    <hr style={{ margin: "18px 0" }} />

                    {/* Client */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                      <div>
                        <h5 style={{ marginBottom: 6 }}>Bill To</h5>
                        <div style={{ fontWeight: 700 }}>{previewInvoice.client?.name}</div>
                        <div>{previewInvoice.client?.companyName}</div>
                        <div>{previewInvoice.client?.email}</div>
                        <div>{previewInvoice.client?.mobile}</div>
                      </div>

                      <div>
                        <h5 style={{ marginBottom: 6 }}>Created By</h5>
                        <div style={{ fontWeight: 700 }}>{previewInvoice.createdBy?.name}</div>
                        <div>{previewInvoice.createdBy?.email}</div>
                        <div style={{ marginTop: 12 }}><small className="text-muted">Status: {previewInvoice.status}</small></div>
                      </div>
                    </div>

                    <hr style={{ margin: "18px 0" }} />

                    {/* Plan / amounts */}
                    <h5 style={{ color: "#0041C2" }}>Plan Billing</h5>
                    <table className="table table-bordered mb-0">
                      <thead className="table-primary">
                        <tr>
                          <th>Plan Type</th>
                          <th>Plan Name</th>
                          <th className="text-end">Base</th>
                          <th className="text-end">Discount</th>
                          <th className="text-end">GST</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{previewInvoice.plan?.planType}</td>
                          <td>{previewInvoice.plan?.planName}</td>
                          <td className="text-end">₹{formatCurrency(previewInvoice.baseAmount || 0)}</td>
                          <td className="text-end">{previewInvoice.discount || 0}{typeof previewInvoice.discount === "number" ? "%" : ""}</td>
                          <td className="text-end">{previewInvoice.taxPercent || 0}% (₹{formatCurrency(previewInvoice.taxAmount || 0)})</td>
                          <td className="text-end"><b>₹{formatCurrency(previewInvoice.totalAmount || 0)}</b></td>
                        </tr>
                      </tbody>
                    </table>

                    {previewInvoice.notes && (
                      <>
                        <hr />
                        <h6 style={{ marginBottom: 6, color: "#333" }}>Notes</h6>
                        <div style={{ color: "#444" }}>{previewInvoice.notes}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-success" onClick={generateSinglePDF}>
                    <i className="bi bi-file-earmark-pdf me-2" /> Download PDF
                  </button>

                  <button className="btn btn-secondary" onClick={() => setShowInvoicePopup(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* ALL INVOICES POPUP (Export All) */}
        {/* ========================= */}
        {showAllInvoicePopup && (
          <div
            className="modal fade show d-block"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              background: "rgba(0,0,0,0.6)",
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
            }}
          >
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              style={{ margin: "0 auto", maxWidth: "1100px" }}
            >
              <div className="modal-content" style={{ borderRadius: 12 }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">All Invoices Report</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowAllInvoicePopup(false)} />
                </div>

                <div className="modal-body">
                  <div
                    id="all-invoice-area"
                    style={{
                      background: "#fff",
                      padding: 28,
                      borderRadius: 10,
                      margin: "0 auto",
                      maxWidth: 900,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <h2 style={{ color: "#0041C2", marginBottom: 6 }}>DOT IT SOLUTIONS</h2>
                      <div style={{ color: "#666" }}>Ahmedabad, Gujarat • support@dotit.com • +91 99981 08980</div>
                      <h4 style={{ marginTop: 16, color: "#333" }}>All Invoices</h4>
                      <div style={{ color: "#666", marginTop: 6 }}>Total invoices: {invoices.length}</div>
                    </div>

                    {/* map invoices (full list) */}
                    {invoices.length === 0 ? (
                      <div className="text-center text-muted p-4">No invoices available</div>
                    ) : (
                      invoices.map((inv, idx) => (
                        <div key={inv.id || inv._id || idx} style={{ marginBottom: 18, padding: 14, borderRadius: 8, background: "#f8fbff", border: "1px solid #e6eefc" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0041C2" }}>{inv.invoiceNumber}</div>
                              <div style={{ color: "#444" }}>{inv.client?.name} — {inv.client?.companyName}</div>
                              <div style={{ color: "#666", fontSize: 13 }}>{inv.client?.email} • {inv.client?.mobile}</div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 700 }}>₹{formatCurrency(inv.totalAmount || 0)}</div>
                              <div style={{ color: inv.paymentStatus === "Paid" ? "#0f5132" : "#856404", marginTop: 6 }}>{inv.paymentStatus}</div>
                              <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>{formatDate(inv.invoiceDate)}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Plan</th>
                                  <th>Base</th>
                                  <th>Discount</th>
                                  <th>GST</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{inv.plan?.planName}</td>
                                  <td>₹{formatCurrency(inv.baseAmount || 0)}</td>
                                  <td>{inv.discount || 0}{typeof inv.discount === "number" ? "%" : ""}</td>
                                  <td>{inv.taxPercent || 0}%</td>
                                  <td>₹{formatCurrency(inv.totalAmount || 0)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {inv.notes && <div style={{ marginTop: 8, color: "#444" }}><b>Notes:</b> {inv.notes}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-success" onClick={generateAllPDF}>
                    <i className="bi bi-file-earmark-pdf me-2" /> Download PDF
                  </button>

                  <button className="btn btn-secondary" onClick={() => setShowAllInvoicePopup(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* DELETE MODAL */}
        {/* ========================= */}
        {showDeleteModal && (
          <div
            className="modal fade show d-block"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              background: "rgba(0,0,0,0.4)",
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
            }}
          >
            <div className="modal-dialog modal-sm modal-dialog-centered" style={{ margin: "0 auto" }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Confirm Delete</h5>
                  <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
                </div>

                <div className="modal-body">
                  Delete invoice <b>{deleteName}</b> ?
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>

                  <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
};

export default InvoiceList;
