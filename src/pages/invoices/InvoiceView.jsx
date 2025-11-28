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

  const { can } = usePermission();
  const canUpdate = can("invoice:update");
  const canDelete = can("invoice:delete");

  useEffect(() => {
    invoiceApi
      .getInvoice(id)
      .then(({ invoice }) => setInvoice(invoice))
      .catch(() => toast.error("Failed to load invoice"));
  }, [id]);

  const handleDelete = async () => {

    try {
      await invoiceApi.deleteInvoice(id);
      toast.success("Invoice deleted successfully");
      navigate("/invoices");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to delete invoice";
      toast.error(msg);
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
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-2" />
                Delete
              </button>
            )
          ]}
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

              <InfoItem label="Invoice Date" value={formatDate(invoice.invoiceDate)} />
              <InfoItem label="Due Date" value={formatDate(invoice.dueDate)} />
            </div>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
};

export default InvoiceView;
