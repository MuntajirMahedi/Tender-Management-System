// src/pages/plans/PlanView.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { planApi, activationApi, paymentApi, invoiceApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";

const StatItem = ({ label, value }) => (
  <div className="mb-2">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">{value}</div>
  </div>
);

const PlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();

  /* MAIN PERMISSIONS */
  const canView = can("plan:view");
  const canUpdate = can("plan:update");
  const canDelete = can("plan:delete");

  /* SUB-PERMISSIONS */
  const canViewActivation = can("activation:view");
  const canCreateActivation = can("activation:create");

  const canViewInvoice = can("invoice:view");
  const canCreateInvoice = can("invoice:create");

  const canViewPayment = can("payment:view");
  const canCreatePayment = can("payment:create");

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        setLoading(true);

        const [{ plan }, planTasks, planPayments, planInvoices] =
          await Promise.all([
            planApi.getPlan(id),
            activationApi.getPlanTasks(id),
            paymentApi.getPlanPayments(id),
            invoiceApi.getPlanInvoices(id)
          ]);

        setPlan(plan);
        setTasks(planTasks.tasks || []);
        setPayments(planPayments.payments || []);
        setInvoices(planInvoices.invoices || []);

      } catch (err) {
        toast.error("Unable to load plan details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, canView]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await planApi.deletePlan(id);

      toast.success("Plan deleted successfully");
      setShowDeleteModal(false);
      navigate("/plans");

    } catch (err) {
      toast.error("Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <RequirePermission permission="plan:view">
        <p>Checking permissions…</p>
      </RequirePermission>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (!plan) return <p className="text-muted">Plan not found</p>;

  const clientId = plan.client?._id || plan.client?.id || plan.client;

  return (
    <RequirePermission permission="plan:view">
      <div>

        {/* HEADER */}
        <PageHeader
          title={`Plan • ${plan.planName}`}
          subtitle={plan.planCode || ""}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/plans/${id}/edit`}
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

        {/* SUMMARY */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm p-3 h-100">
              <h6 className="text-primary mb-3">Overview</h6>

              <StatItem label="Client" value={plan.client?.name || "—"} />
              <StatItem label="Plan Type" value={plan.planType} />
              <StatItem label="Plan Status" value={<StatusBadge status={plan.status} />} />
              <StatItem label="Payment Status" value={<StatusBadge status={plan.paymentStatus} />} />
              <StatItem label="Start Date" value={formatDate(plan.startDate)} />
              <StatItem label="Expiry Date" value={formatDate(plan.expiryDate)} />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm p-3 h-100">
              <h6 className="text-primary mb-3">Financials</h6>

              <StatItem label="Base Amount" value={formatCurrency(plan.amount, "INR")} />
              <StatItem label="Discount" value={formatCurrency(plan.discount, "INR")} />
              <StatItem label="Tax" value={`${plan.taxPercent}%`} />
              <StatItem label="Net Amount" value={formatCurrency(plan.netAmount, "INR")} />
            </div>
          </div>
        </div>

        {/* ========== ACTIVATION + INVOICE ========== */}
        <div className="row g-4 mb-4">

          {/* ACTIVATION: HIDE IF NO PERMISSION */}
          {canViewActivation && (
            <div className="col-lg-6">
              <div className="card shadow-sm p-3 h-100">

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-primary mb-0">Activation Tasks</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/activation?planId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreateActivation && (
                      <Link
                        to={`/activation/new?planId=${id}${clientId ? `&clientId=${clientId}` : ""}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-plus-lg me-1" />
                        New Task
                      </Link>
                    )}
                  </div>
                </div>

                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No activation tasks
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task._id || task.id}>
                          <td>{task.taskName}</td>
                          <td><StatusBadge status={task.status} /></td>
                          <td>{task.assignedTo?.name || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            </div>
          )}

          {/* INVOICES: HIDE IF NO PERMISSION */}
          {canViewInvoice && (
            <div className="col-lg-6">
              <div className="card shadow-sm p-3 h-100">

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-primary mb-0">Invoices</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/invoices?planId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreateInvoice && (
                      <Link
                        to={`/invoices/new?planId=${id}${clientId ? `&clientId=${clientId}` : ""}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-plus-lg me-1" />
                        Add Invoice
                      </Link>
                    )}
                  </div>
                </div>

                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Invoice</th>
                      <th>Status</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv._id || inv.id}>
                          <td>{inv.invoiceNumber}</td>
                          <td><StatusBadge status={inv.paymentStatus} /></td>
                          <td className="text-end">
                            {formatCurrency(inv.totalAmount, "INR")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            </div>
          )}

        </div>

        {/* ========== PAYMENTS SECTION ========== */}
        {canViewPayment && (
          <div className="card shadow-sm p-3">

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-primary mb-0">Payments</h6>

              <div className="d-flex gap-2">
                <Link
                  to={`/payments?planId=${id}`}
                  className="btn btn-sm btn-outline-secondary"
                >
                  View All
                </Link>

                {canCreatePayment && (
                  <Link
                    to={`/payments/new?planId=${id}${clientId ? `&clientId=${clientId}` : ""}`}
                    className="btn btn-sm btn-primary"
                  >
                    <i className="bi bi-plus-lg me-1" />
                    Add Payment
                  </Link>
                )}
              </div>
            </div>

            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-3">
                      No payments tracked
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id || p.id}>
                      <td>{formatDate(p.paymentDate)}</td>
                      <td>{p.paymentMode}</td>
                      <td className="text-end">
                        {formatCurrency(p.amount, "INR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2" />
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete this plan{" "}
                    <strong>{plan.planName}</strong>? This cannot be undone.
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-danger"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show"></div>
          </>
        )}

      </div>
    </RequirePermission>
  );
};

export default PlanView;
