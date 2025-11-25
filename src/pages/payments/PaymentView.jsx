import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { paymentApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import { formatCurrency, formatDate } from "../../utils/formatters";

const PaymentView = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    paymentApi
      .getPayment(id)
      .then(({ payment }) => setPayment(payment));
  }, [id]);

  if (!payment) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title="Payment details"
        actions={[
          <Link
            key="edit"
            to={`/payments/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        ]}
      />
      <div className="table-card">
        <div className="row">
          <div className="col-6">
            <div className="text-muted small">Client</div>
            <div className="fw-semibold">{payment.client?.name}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Plan</div>
            <div className="fw-semibold">{payment.plan?.planName}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Amount</div>
            <div className="fw-semibold">
              {formatCurrency(payment.amount || 0, "INR")}
            </div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Mode</div>
            <div className="fw-semibold">{payment.paymentMode}</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Payment Date</div>
            <div className="fw-semibold">{formatDate(payment.paymentDate)}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Bank</div>
            <div className="fw-semibold">{payment.bankName || "NA"}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Transaction ID</div>
            <div className="fw-semibold">
              {payment.transactionId || "NA"}
            </div>
          </div>
          <div className="col-12">
            <div className="text-muted small">Remarks</div>
            <div className="fw-semibold">{payment.remarks || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;

