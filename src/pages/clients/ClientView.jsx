import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { clientApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const StatItem = ({ label, value }) => (
  <div className="mb-2">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">{value}</div>
  </div>
);

const ClientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activation, setActivation] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await clientApi.getClientOverview(id);

        setClient(res.client || null);
        setPlans(res.plans || []);
        setPayments(res.payments || []);
        setActivation(res.activation || null);
        setTickets(res.tickets || []);
      } catch (err) {
        console.error("Unable to load client overview", err);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!client) return <p className="text-muted">Client not found</p>;

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPlans = plans.length;

  return (
    <div>
      {/* HEADER */}
      <PageHeader
        title={`Client • ${client.name}`}
        subtitle={client.companyName || ""}
        actions={[
          <Link
            key="edit"
            to={`/clients/${id}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil-square me-2" />
            Edit
          </Link>,

          <button
            key="new-plan"
            className="btn btn-primary"
            onClick={() => navigate(`/plans/new?clientId=${id}`)}
          >
            <i className="bi bi-card-list me-2" />
            New Plan
          </button>
        ]}
      />

      {/* ----------- SUMMARY SECTION ----------- */}
      <div className="row g-4 mb-4">

        {/* Profile */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Profile</h6>

            <StatItem label="Status" value={<StatusBadge status={client.status} />} />
            <StatItem label="Client Code" value={client.clientCode || "—"} />

            <hr />

            <StatItem label="Mobile" value={client.mobile} />
            <StatItem label="Email" value={client.email || "—"} />

            <small className="text-muted mt-3 d-block">Created</small>
            <div>{formatDateTime(client.createdAt)}</div>
          </div>
        </div>

        {/* Contact / Address */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Contact & Location</h6>

            <StatItem
              label="Address"
              value={
                [
                  client.addressLine1,
                  client.addressLine2,
                  client.city,
                  client.state,
                  client.pincode
                ]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />

            <StatItem label="Country" value={client.country || "—"} />
          </div>
        </div>

        {/* Team */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Team</h6>

            <StatItem
              label="Sales Owner"
              value={client.assignedSales?.name || "Unassigned"}
            />

            <StatItem
              label="Care Owner"
              value={client.assignedCare?.name || "Unassigned"}
            />
          </div>
        </div>

        {/* Activity Summary */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Activity Summary</h6>

            <StatItem label="Total Plans" value={totalPlans} />
            <StatItem label="Total Paid" value={formatCurrency(totalPaid, "INR")} />

            <StatItem
              label="Interested Products"
              value={
                Array.isArray(client.interestedProducts)
                  ? client.interestedProducts.join(", ")
                  : client.interestedProducts || "—"
              }
            />
          </div>
        </div>
      </div>

      {/* ----------- PLANS + PAYMENTS ----------- */}
      <div className="row g-4 mb-4">

        {/* Plans */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-primary mb-0">Plans</h6>
              <div>
                <Link
                  to={`/plans?clientId=${id}`}
                  className="btn btn-sm btn-outline-secondary me-2"
                >
                  View all
                </Link>

                <Link
                  to={`/plans/new?clientId=${id}`}
                  className="btn btn-sm btn-primary"
                >
                  <i className="bi bi-plus-lg me-1" /> Add Plan
                </Link>
              </div>
            </div>

            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Net</th>
                </tr>
              </thead>

              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      No plans yet
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.id || p._id}>
                      <td>
                        <div className="fw-semibold">{p.planName}</div>
                        <small className="text-muted">{p.planCode}</small>
                      </td>
                      <td>{p.planType}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="text-end">
                        {formatCurrency(p.netAmount || 0, "INR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-primary mb-0">Recent Payments</h6>

              <Link
                to={`/payments/new?clientId=${id}`}
                className="btn btn-sm btn-primary"
              >
                <i className="bi bi-cash-stack me-1" /> Add Payment
              </Link>
            </div>

            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
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
                  payments.map((pay) => (
                    <tr key={pay.id || pay._id}>
                      <td>{formatDate(pay.paymentDate)}</td>
                      <td>{pay.plan?.planName || "—"}</td>
                      <td className="text-end">
                        {formatCurrency(pay.amount || 0, "INR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ----------- ACTIVATION + TICKETS ----------- */}
      <div className="row g-4">

        {/* Activation */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Latest Activation</h6>

            {!activation ? (
              <p className="text-muted">No activation task found.</p>
            ) : (
              <>
                <StatItem label="Task" value={activation.taskName} />
                <StatItem label="Status" value={<StatusBadge status={activation.status} />} />
                <StatItem label="Assigned To" value={activation.assignedTo?.name || "—"} />
                <StatItem label="Due Date" value={formatDate(activation.dueDate)} />
                <StatItem
                  label="Progress"
                  value={`${activation.activationProgress ?? "0"}%`}
                />
              </>
            )}
          </div>
        </div>

        {/* Tickets */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="text-primary mb-3">Tickets</h6>

            {tickets.length === 0 ? (
              <p className="text-muted">No tickets</p>
            ) : (
              <div className="list-group">
                {tickets.slice(0, 6).map((t) => (
                  <div key={t._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{t.subject}</div>
                        <small className="text-muted">{t.plan?.planName || ""}</small>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={t.status} />
                        <small className="text-muted d-block">{t.priority}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <Link
                to={`/tickets?clientId=${id}`}
                className="btn btn-sm btn-outline-secondary"
              >
                View all tickets
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientView;
