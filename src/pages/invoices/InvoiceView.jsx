import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { invoiceApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    invoiceApi.getInvoice(id).then(({ invoice }) => setInvoice(invoice));
  }, [id]);

  if (!invoice) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Invoice • ${invoice.invoiceNumber}`}
        subtitle={invoice.client?.name}
        actions={[
          <Link
            key="edit"
            to={`/invoices/${id}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil-square me-2" /> Edit
          </Link>
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
    </div>
  );
};

export default InvoiceView;
