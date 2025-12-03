// src/pages/clients/ClientView.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  clientApi,
  planApi,
  paymentApi,
  activationApi,
  ticketApi
} from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import {
  formatCurrency,
  formatDate,
  formatDateTime
} from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();

  // MAIN PERMISSIONS
  const canView = can("client:view");
  const canUpdate = can("client:update");
  const canDelete = can("client:delete");

  // SUB PERMISSIONS
  const canViewPlans = can("plan:view");
  const canCreatePlan = can("plan:create");

  const canViewPayments = can("payment:view");
  const canCreatePayment = can("payment:create");

  const canViewActivation = can("activation:view");
  const canCreateActivation = can("activation:create");

  const canViewTickets = can("ticket:view");
  const canCreateTicket = can("ticket:create");

  // LOAD DATA
  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        setLoading(true);

        const requests = [
          clientApi.getClientOverview(id)
        ];

        requests.push(canViewPlans ? planApi.getClientPlans(id) : { plans: [] });
        requests.push(
          canViewPayments ? paymentApi.getClientPayments(id) : { payments: [] }
        );

        requests.push(
          canViewActivation
            ? activationApi.getTasks({
                clientId: id,
                limit: 1,
                sort: "-createdAt"
              })
            : { tasks: [] }
        );

        requests.push(
          canViewTickets ? ticketApi.getClientTickets(id) : { tickets: [] }
        );

        const [
          clientRes,
          plansRes,
          paymentsRes,
          activationRes,
          ticketsRes
        ] = await Promise.all(requests);

        setClient(clientRes.client || null);
        setPlans(plansRes.plans || []);
        setPayments(paymentsRes.payments || []);
        setActivation(activationRes.tasks?.[0] || null);
        setTickets(ticketsRes.tickets || []);
      } catch (err) {
        console.error("Client load error", err);
        toast.error("Unable to load client details");
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    id,
    canView,
    canViewPlans,
    canViewPayments,
    canViewActivation,
    canViewTickets
  ]);

  // DELETE CLIENT
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await clientApi.deleteClient(id);
      toast.success("Client deleted successfully");
      navigate("/clients");
    } catch (err) {
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <RequirePermission permission="client:view">
        <p>Checking permissions…</p>
      </RequirePermission>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (!client) return <p className="text-muted">Client not found</p>;

  const totalPaid = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  return (
    <RequirePermission permission="client:view">
      <div>
        {/* HEADER */}
        <PageHeader
          title={`Client • ${client.name}`}
          subtitle={client.companyName || ""}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/clients/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil me-2" /> Edit
              </Link>
            ),
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash me-2" /> Delete
              </button>
            ),
            canCreatePlan && (
              <button
                key="new-plan"
                onClick={() => navigate(`/plans/new?clientId=${id}`)}
                className="btn btn-primary"
              >
                <i className="bi bi-plus-lg me-2" /> New Plan
              </button>
            )
          ].filter(Boolean)}
        />

        {/* DETAILS */}
        <div className="row g-4 mb-4">
          {/* PROFILE */}
          <div className="col-md-3">
            <div className="card p-3 shadow-sm">
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

          {/* ADDRESS */}
          <div className="col-md-3">
            <div className="card p-3 shadow-sm">
              <h6 className="text-primary mb-3">Contact / Location</h6>

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

          {/* TEAM */}
          <div className="col-md-3">
            <div className="card p-3 shadow-sm">
              <h6 className="text-primary mb-3">Team</h6>

              <StatItem label="Sales Owner" value={client.assignedSales?.name || "Unassigned"} />
              <StatItem label="Care Owner" value={client.assignedCare?.name || "Unassigned"} />
            </div>
          </div>

          {/* SUMMARY */}
          <div className="col-md-3">
            <div className="card p-3 shadow-sm">
              <h6 className="text-primary mb-3">Activity Summary</h6>

              {canViewPlans && (
                <StatItem label="Total Plans" value={plans.length} />
              )}

              {canViewPayments && (
                <StatItem label="Total Paid" value={formatCurrency(totalPaid, "INR")} />
              )}

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

        {/* PLANS & PAYMENTS */}
        <div className="row g-4 mb-4">
          {/* PLANS */}
          {canViewPlans && (
            <div className="col-lg-6">
              <div className="card p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="text-primary mb-0">Plans</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/plans?clientId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreatePlan && (
                      <Link
                        to={`/plans/new?clientId=${id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-plus-lg me-1" /> Add Plan
                      </Link>
                    )}
                  </div>
                </div>

                <table className="table table-sm">
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
                        <tr key={p._id || p.id}>
                          <td>
                            <Link to={`/plans/${p._id}`} className="fw-semibold">
                              {p.planName}
                            </Link>
                            <br />
                            <small className="text-muted">{p.planCode}</small>
                          </td>
                          <td>{p.planType}</td>
                          <td>
                            <StatusBadge status={p.status} />
                          </td>
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
          )}

          {/* PAYMENTS */}
          {canViewPayments && (
            <div className="col-lg-6">
              <div className="card p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="text-primary mb-0">Recent Payments</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/payments?clientId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreatePayment && (
                      <Link
                        to={`/payments/new?clientId=${id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-cash me-1" /> Add Payment
                      </Link>
                    )}
                  </div>
                </div>

                <table className="table table-sm">
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
                          No payments
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p._id || p.id}>
                          <td>{formatDate(p.paymentDate)}</td>
                          <td>{p.plan?.planName || "—"}</td>
                          <td className="text-end">
                            {formatCurrency(p.amount || 0, "INR")}
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

        {/* ACTIVATION + TICKETS */}
        <div className="row g-4 mb-4">
          {/* ACTIVATION */}
          {canViewActivation && (
            <div className="col-lg-6">
              <div className="card p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="text-primary mb-0">Latest Activation</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/activation?clientId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreateActivation && (
                      <Link
                        to={`/activation/new?clientId=${id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-plus-lg me-1" /> Add Activation
                      </Link>
                    )}
                  </div>
                </div>

                {!activation ? (
                  <p className="text-muted">No activation found</p>
                ) : (
                  <>
                    <StatItem label="Task" value={activation.taskName} />
                    <StatItem label="Status" value={<StatusBadge status={activation.status} />} />
                    <StatItem label="Assigned To" value={activation.assignedTo?.name || "—"} />
                    <StatItem label="Due Date" value={formatDate(activation.dueDate)} />
                    <StatItem label="Progress" value={`${activation.activationProgress || 0}%`} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TICKETS */}
          {canViewTickets && (
            <div className="col-lg-6">
              <div className="card p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="text-primary mb-0">Tickets</h6>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/tickets?clientId=${id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View All
                    </Link>

                    {canCreateTicket && (
                      <Link
                        to={`/tickets/new?clientId=${id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-plus-lg me-1" /> Add Ticket
                      </Link>
                    )}
                  </div>
                </div>

                {tickets.length === 0 ? (
                  <p className="text-muted">No tickets found</p>
                ) : (
                  <div className="list-group">
                    {tickets.slice(0, 6).map((t) => (
                      <div key={t._id || t.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-semibold">{t.subject}</div>
                            <small className="text-muted">{t.plan?.planName}</small>
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
              </div>
            </div>
          )}
        </div>

        {/* DELETE CONFIRM */}
        {showDeleteModal && (
          <>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete client{" "}
                    <strong>{client.name}</strong>? This action cannot be undone.
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
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
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

export default ClientView;
