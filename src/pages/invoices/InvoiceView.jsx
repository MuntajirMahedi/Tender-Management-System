import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { invoiceApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

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
        actions={[
          <Link
            key="edit"
            to={`/invoices/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        ]}
      />
      <div className="table-card">
        <div className="row">
          <div className="col-4">
            <div className="text-muted small">Client</div>
            <div className="fw-semibold">{invoice.client?.name}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Plan</div>
            <div className="fw-semibold">{invoice.plan?.planName}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Invoice date</div>
            <div className="fw-semibold">{formatDate(invoice.invoiceDate)}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Due date</div>
            <div className="fw-semibold">{formatDate(invoice.dueDate)}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Payment Status</div>
            <StatusBadge status={invoice.paymentStatus} />
          </div>
          <div className="col-4">
            <div className="text-muted small">Invoice Status</div>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="col-6">
            <div className="text-muted small">Subtotal</div>
            <div className="fw-semibold">
              {formatCurrency(invoice.baseAmount || 0, "INR")}
            </div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Total</div>
            <div className="fw-semibold">
              {formatCurrency(invoice.totalAmount || 0, "INR")}
            </div>
          </div>
          <div className="col-12">
            <div className="text-muted small">Notes</div>
            <div className="fw-semibold">{invoice.notes || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;

