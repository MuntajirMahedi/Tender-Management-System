import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ticketApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";

const TicketView = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    ticketApi.getTicket(id).then(({ ticket }) => setTicket(ticket));
  }, [id]);

  if (!ticket) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Ticket • ${ticket.subject}`}
        actions={[
          <Link
            key="edit"
            to={`/tickets/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        ]}
      />
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Details</h6>
            <div className="row">
              <div className="col-6">
                <div className="text-muted small">Client</div>
                <div className="fw-semibold">{ticket.client?.name}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Plan</div>
                <div className="fw-semibold">{ticket.plan?.planName || "—"}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Type</div>
                <div className="fw-semibold">{ticket.ticketType}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Priority</div>
                <StatusBadge status={ticket.priority} />
              </div>
              <div className="col-6">
                <div className="text-muted small">Status</div>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="col-6">
                <div className="text-muted small">Assigned To</div>
                <div className="fw-semibold">{ticket.assignedTo?.name || "—"}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Opened</div>
                <div className="fw-semibold">{formatDate(ticket.openedDate)}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Closed</div>
                <div className="fw-semibold">
                  {ticket.closedDate ? formatDate(ticket.closedDate) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Description</h6>
            <p>{ticket.description || "—"}</p>
          </div>
        </div>
      </div>
      <div className="table-card mt-4">
        <h6>Timeline</h6>
        <ul className="list-group list-group-flush">
          {ticket.timeline?.map((entry) => (
            <li key={entry.createdAt} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <StatusBadge status={entry.status} /> • {entry.remark || "No remarks"}
                </div>
                <small className="text-muted">{formatDateTime(entry.createdAt)}</small>
              </div>
            </li>
          ))}
          {!ticket.timeline?.length && (
            <li className="list-group-item text-muted text-center">No timeline entries</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TicketView;

