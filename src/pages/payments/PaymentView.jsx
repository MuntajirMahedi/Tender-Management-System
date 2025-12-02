// src/pages/payments/PaymentView.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { paymentApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatusBadge from "../../components/StatusBadge";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const PaymentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔽 delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();
  const canView = can("payment:view");
  const canUpdate = can("payment:update");
  const canDelete = can("payment:delete");

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        setLoading(true);
        const { payment } = await paymentApi.getPayment(id);
        setPayment(payment);
      } catch (err) {
        console.error("Unable to load payment", err);
        toast.error("Unable to load payment details");
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, canView]);

  // 🔽 called when user CONFIRMS delete in modal
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await paymentApi.deletePayment(id);
      toast.success("Payment deleted successfully");

      setShowDeleteModal(false);
      navigate("/payments");
    } catch (err) {
      console.error("Unable to delete payment", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete payment";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <RequirePermission permission="payment:view">
        <p>Checking permissions…</p>
      </RequirePermission>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (!payment) return <p className="text-muted">Payment not found</p>;

  return (
    <RequirePermission permission="payment:view">
      <div>
        <PageHeader
          title={`Payment • ${payment.transactionId || "PAY"}`}
          subtitle={payment.client?.name || ""}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/payments/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil me-2" />
                Edit
              </Link>
            ),
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)} // 🔁 open modal
              >
                <i className="bi bi-trash me-2" />
                Delete
              </button>
            )
          ].filter(Boolean)}
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

              <InfoItem
                label="Payment Date"
                value={formatDate(payment.paymentDate)}
              />

              <InfoItem
                label="Status"
                value={<StatusBadge status={payment.status} />}
              />

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
                      Are you sure you want to delete this payment{" "}
                      <strong>{payment?.transactionId || "PAY"}</strong>? This
                      action cannot be undone.
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

export default PaymentView;
