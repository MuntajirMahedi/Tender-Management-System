import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { planApi, activationApi, paymentApi, invoiceApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const PlanView = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [{ plan }, planTasks, planPayments, planInvoices] = await Promise.all(
        [
          planApi.getPlan(id),
          activationApi.getPlanTasks(id),
          paymentApi.getPlanPayments(id),
          invoiceApi.getPlanInvoices(id)
        ]
      );
      setPlan(plan);
      setTasks(planTasks.tasks || []);
      setPayments(planPayments.payments || []);
      setInvoices(planInvoices.invoices || []);
    };
    load();
  }, [id]);

  if (!plan) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Plan • ${plan.planName}`}
        actions={[
          <Link
            key="edit"
            to={`/plans/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        ]}
      />
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Summary</h6>
            <div className="row">
              <div className="col-6">
                <div className="text-muted small">Client</div>
                <div className="fw-semibold">{plan.client?.name}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Plan Type</div>
                <div className="fw-semibold">{plan.planType}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Status</div>
                <StatusBadge status={plan.status} />
              </div>
              <div className="col-6">
                <div className="text-muted small">Payment</div>
                <StatusBadge status={plan.paymentStatus} />
              </div>
              <div className="col-6">
                <div className="text-muted small">Start Date</div>
                <div className="fw-semibold">{formatDate(plan.startDate)}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Expiry Date</div>
                <div className="fw-semibold">{formatDate(plan.expiryDate)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Financials</h6>
            <div className="row">
              <div className="col-6">
                <div className="text-muted small">Base Amount</div>
                <div className="fw-semibold">
                  {formatCurrency(plan.amount || 0, "INR")}
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Discount</div>
                <div className="fw-semibold">
                  {formatCurrency(plan.discount || 0, "INR")}
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Tax</div>
                <div className="fw-semibold">{plan.taxPercent}%</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Net Amount</div>
                <div className="fw-semibold">
                  {formatCurrency(plan.netAmount || 0, "INR")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4 mt-1">
        <div className="col-lg-6">
          <div className="table-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Activation tasks</h6>
              <Link to="/activation/new" className="btn btn-sm btn-primary">
                New task
              </Link>
            </div>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id || task._id}>
                    <td>{task.taskName}</td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>{task.assignedTo?.name || "—"}</td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No activation tasks
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="table-card">
            <h6>Invoices</h6>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Status</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id || inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="text-end">
                      {formatCurrency(inv.totalAmount || 0, "INR")}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="table-card mt-4">
        <h6>Payments</h6>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id || payment._id}>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{payment.paymentMode}</td>
                <td className="text-end">
                  {formatCurrency(payment.amount || 0, "INR")}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No payments tracked
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanView;

