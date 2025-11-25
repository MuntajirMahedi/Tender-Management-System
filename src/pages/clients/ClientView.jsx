// src/pages/clients/ClientView.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { clientApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const Breadcrumbs = ({ client }) => (
  <nav aria-label="breadcrumb" className="mb-3">
    <ol className="breadcrumb mb-0">
      <li className="breadcrumb-item">
        <Link to="/dashboard">Home</Link>
      </li>
      <li className="breadcrumb-item">
        <Link to="/clients">Clients</Link>
      </li>
      <li className="breadcrumb-item active" aria-current="page">
        {client?.name || "Client"}
      </li>
    </ol>
  </nav>
);

const StatPill = ({ label, value }) => (
  <div className="d-flex flex-column">
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
        // backend returns: { client, plans, payments, activation, tickets }
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

  // derived summary values
  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPlans = plans.length;

  return (
    <div>
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
            onClick={() => navigate(`/plans/new?clientId=${id}`)}
            className="btn btn-primary"
          >
            <i className="bi bi-card-list me-2" />
            New Plan
          </button>
        ]}
      />

      <Breadcrumbs client={client} />

      {/* TOP SUMMARY */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card p-3 h-100">
            <h6 className="mb-2">Profile</h6>
            <div className="d-flex justify-content-between">
              <StatPill label="Status" value={<StatusBadge status={client.status} />} />
              <StatPill label="Client Code" value={client.clientCode || "—"} />
            </div>
            <hr />
            <div>
              <div className="small text-muted">Primary</div>
              <div className="fw-semibold">{client.mobile}</div>
              <div className="text-muted small">{client.email || "—"}</div>
            </div>
            <div className="mt-3 small text-muted">Created</div>
            <div>{formatDateTime(client.createdAt)}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 h-100">
            <h6 className="mb-2">Contact & Location</h6>
            <div className="small text-muted">Address</div>
            <div className="fw-semibold">
              {[
                client.addressLine1,
                client.addressLine2,
                client.city,
                client.state,
                client.pincode
              ].filter(Boolean).join(", ") || "—"}
            </div>
            <div className="mt-2 small text-muted">Country</div>
            <div>{client.country || "—"}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 h-100">
            <h6 className="mb-2">Team</h6>
            <div className="small text-muted">Sales Owner</div>
            <div className="fw-semibold">{client.assignedSales?.name || "Unassigned"}</div>
            <div className="mt-2 small text-muted">Care Owner</div>
            <div className="fw-semibold">{client.assignedCare?.name || "Unassigned"}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 h-100">
            <h6 className="mb-2">Activity Summary</h6>
            <div className="d-flex justify-content-between">
              <StatPill label="Plans" value={totalPlans} />
              <StatPill label="Total Paid" value={formatCurrency(totalPaid, "INR")} />
            </div>
            <div className="mt-3 small text-muted">Interested</div>
            <div className="fw-semibold">
              {Array.isArray(client.interestedProducts)
                ? client.interestedProducts.join(", ")
                : client.interestedProducts || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* PLANS & PAYMENTS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="table-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Plans</h6>
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

            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Net</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">No plans yet</td>
                  </tr>
                )}
                {plans.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>
                      <div className="fw-semibold">{p.planName}</div>
                      <div className="text-muted small">{p.planCode || ""}</div>
                    </td>
                    <td>{p.planType || "—"}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-end">{formatCurrency(p.netAmount || 0, "INR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="table-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Recent Payments</h6>
              <div>
                <Link to={`/payments/new?clientId=${id}`} className="btn btn-sm btn-primary">
                  <i className="bi bi-cash-stack me-1" /> Add Payment
                </Link>
              </div>
            </div>

            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">No payments tracked</td>
                  </tr>
                )}
                {payments.map((pay) => (
                  <tr key={pay.id || pay._id}>
                    <td>{formatDate(pay.paymentDate)}</td>
                    <td>{pay.plan?.planName || "—"}</td>
                    <td className="text-end">{formatCurrency(pay.amount || 0, "INR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ACTIVATION & TICKETS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h6>Latest Activation</h6>
            {!activation ? (
              <p className="text-muted">No activation task found.</p>
            ) : (
              <>
                <div className="mb-2 fw-semibold">{activation.taskName}</div>
                <div className="small text-muted">Status</div>
                <div><StatusBadge status={activation.status} /></div>
                <div className="small text-muted mt-2">Assigned To</div>
                <div>{activation.assignedTo?.name || "—"}</div>
                <div className="small text-muted mt-2">Due</div>
                <div>{formatDate(activation.dueDate) || "—"}</div>
                <div className="small text-muted mt-2">Progress</div>
                <div className="fw-semibold">{activation.activationProgress ?? "—"}%</div>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h6>Tickets</h6>
            {tickets.length === 0 ? (
              <p className="text-muted">No tickets</p>
            ) : (
              <div className="list-group">
                {tickets.slice(0, 6).map((t) => (
                  <div key={t._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{t.subject}</div>
                        <div className="small text-muted">{t.plan?.planName || ""}</div>
                      </div>
                      <div className="text-end">
                        <div><StatusBadge status={t.status} /></div>
                        <div className="small text-muted">{t.priority}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Link to={`/tickets?clientId=${id}`} className="btn btn-sm btn-outline-secondary">
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
