import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { paymentApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatusBadge from "../../components/StatusBadge";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const PaymentView = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    paymentApi.getPayment(id).then(({ payment }) => setPayment(payment));
  }, [id]);

  if (!payment) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Payment • ${payment.transactionId || "PAY"}`}
        subtitle={payment.client?.name || ""}
        actions={[
          <Link
            key="edit"
            to={`/payments/${id}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil me-2" />
            Edit
          </Link>
        ]}
      />

      {/* SECTIONS */}
      <div className="row g-4">
        {/* LEFT CARD */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Payment Details</h6>

            <InfoItem
              label="Amount"
              value={formatCurrency(payment.amount || 0, "INR")}
            />

            <InfoItem label="Mode" value={payment.paymentMode} />

            <InfoItem label="Payment Date" value={formatDate(payment.paymentDate)} />

            <InfoItem label="Status" value={<StatusBadge status={payment.status} />} />

            <InfoItem label="Remarks" value={payment.remarks} />
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Client & Plan</h6>

            <InfoItem label="Client" value={payment.client?.name} />

            <InfoItem label="Plan" value={payment.plan?.planName} />

            <InfoItem label="Plan Type" value={payment.plan?.planType} />

            <InfoItem label="Bank Name" value={payment.bankName} />

            <InfoItem label="Transaction ID" value={payment.transactionId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
