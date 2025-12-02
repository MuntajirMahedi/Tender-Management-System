// src/pages/invoices/InvoiceView.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { invoiceApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  // 🔽 delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();
  const canUpdate = can("invoice:update");
  const canDelete = can("invoice:delete");

  useEffect(() => {
    invoiceApi
      .getInvoice(id)
      .then(({ invoice }) => setInvoice(invoice))
      .catch(() => toast.error("Failed to load invoice"));
  }, [id]);

  // 🔽 called when user CONFIRMS delete in modal
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await invoiceApi.deleteInvoice(id);
      toast.success("Invoice deleted successfully");
      setShowDeleteModal(false);
      navigate("/invoices");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to delete invoice";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!invoice) return <p>Loading...</p>;

  return (
    <RequirePermission permission="invoice:view">
      <div>
        <PageHeader
          title={`Invoice • ${invoice.invoiceNumber}`}
          subtitle={invoice.client?.name}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/invoices/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil-square me-2" />
                Edit
              </Link>
            ),
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash me-2" />
                Delete
              </button>
            )
          ].filter(Boolean)}
        />

        <div className="row g-4">
          {/* LEFT — BASIC INFORMATION */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Invoice Details</h6>

              <InfoItem label="Client" value={invoice.client?.name} />
              <InfoItem label="Plan" value={invoice.plan?.planName} />

              <InfoItem
                label="Payment Status"
                value={<StatusBadge status={invoice.paymentStatus} />}
              />

              <InfoItem
                label="Invoice Status"
                value={<StatusBadge status={invoice.status} />}
              />

              <InfoItem label="Notes" value={invoice.notes} />
            </div>
          </div>

          {/* RIGHT — AMOUNTS */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Billing Summary</h6>

              <InfoItem
                label="Subtotal"
                value={formatCurrency(invoice.baseAmount || 0, "INR")}
              />

              <InfoItem
                label="Discount"
                value={formatCurrency(invoice.discount || 0, "INR")}
              />

              <InfoItem label="Tax" value={`${invoice.taxPercent}%`} />

              <InfoItem
                label="Total Amount"
                value={formatCurrency(invoice.totalAmount || 0, "INR")}
              />

              <hr />

              <InfoItem
                label="Invoice Date"
                value={formatDate(invoice.invoiceDate)}
              />
              <InfoItem
                label="Due Date"
                value={formatDate(invoice.dueDate)}
              />
            </div>
          </div>
        </div>

        {/* ----------- DELETE CONFIRM MODAL ----------- */}
        {showDeleteModal && (
          <>
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2" />
                      Confirm Delete
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      disabled={isDeleting}
                      onClick={() => !isDeleting && setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      Are you sure you want to delete this invoice{" "}
                      <strong>{invoice?.invoiceNumber}</strong>? This action
                      cannot be undone.
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* backdrop */}
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </RequirePermission>
  );
};

export default InvoiceView;
