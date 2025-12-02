// src/pages/tickets/TicketView.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ticketApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";
import RequirePermission from "../../components/RequirePermission";
import usePermission from "../../hooks/usePermission";
import { toast } from "react-toastify";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔽 delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();
  const canView = can("ticket:view");
  const canUpdate = can("ticket:update");
  const canDelete = can("ticket:delete");

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        setLoading(true);
        const { ticket } = await ticketApi.getTicket(id);
        setTicket(ticket);
      } catch (err) {
        console.error("Unable to load ticket", err);
        toast.error("Unable to load ticket details");
        setTicket(null);
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

      await ticketApi.deleteTicket(id);
      toast.success("Ticket deleted successfully");
      setShowDeleteModal(false);
      navigate("/tickets");
    } catch (err) {
      console.error("Unable to delete ticket", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete ticket";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <RequirePermission permission="ticket:view">
        <p>Checking permissions…</p>
      </RequirePermission>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (!ticket) return <p className="text-muted">Ticket not found</p>;

  return (
    <RequirePermission permission="ticket:view">
      <div>
        <PageHeader
          title={`Ticket • ${ticket.subject}`}
          subtitle={ticket.client?.name}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/tickets/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil-square me-2" /> Edit
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
            )
          ].filter(Boolean)}
        />

        {/* MAIN DETAILS */}
        <div className="row g-4">
          {/* LEFT: DETAILS */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Ticket Details</h6>

              <InfoItem label="Client" value={ticket.client?.name} />
              <InfoItem label="Plan" value={ticket.plan?.planName} />
              <InfoItem label="Type" value={ticket.ticketType} />
              <InfoItem
                label="Priority"
                value={<StatusBadge status={ticket.priority} />}
              />
              <InfoItem
                label="Status"
                value={<StatusBadge status={ticket.status} />}
              />
              <InfoItem label="Assigned To" value={ticket.assignedTo?.name} />
              <InfoItem label="Opened" value={formatDate(ticket.openedDate)} />
              <InfoItem
                label="Closed"
                value={
                  ticket.closedDate ? formatDate(ticket.closedDate) : "—"
                }
              />
            </div>
          </div>

          {/* RIGHT: DESCRIPTION */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="mb-3 text-primary">Description</h6>
              <p className="fw-semibold">
                {ticket.description || "No description"}
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="card p-3 shadow-sm mt-4">
          <h6 className="mb-3 text-primary">Timeline</h6>

          <ul className="list-group list-group-flush">
            {ticket.timeline?.map((entry, idx) => (
              <li key={idx} className="list-group-item px-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <StatusBadge status={entry.status} /> •
                    <span className="ms-1">
                      {entry.remark || "No remarks"}
                    </span>
                  </div>
                  <small className="text-muted">
                    {formatDateTime(entry.createdAt)}
                  </small>
                </div>
              </li>
            ))}

            {(!ticket.timeline || ticket.timeline.length === 0) && (
              <li className="list-group-item text-muted text-center">
                No timeline entries
              </li>
            )}
          </ul>
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
                      Are you sure you want to delete this ticket{" "}
                      <strong>{ticket?.subject}</strong>? This action cannot be
                      undone.
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

export default TicketView;
