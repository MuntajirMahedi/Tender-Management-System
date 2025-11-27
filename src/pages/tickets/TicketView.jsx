import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ticketApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

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
        subtitle={ticket.client?.name}
        actions={[
          <Link
            key="edit"
            to={`/tickets/${id}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil-square me-2" /> Edit
          </Link>
        ]}
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
            <InfoItem label="Priority" value={<StatusBadge status={ticket.priority} />} />
            <InfoItem label="Status" value={<StatusBadge status={ticket.status} />} />
            <InfoItem label="Assigned To" value={ticket.assignedTo?.name} />
            <InfoItem label="Opened" value={formatDate(ticket.openedDate)} />
            <InfoItem
              label="Closed"
              value={ticket.closedDate ? formatDate(ticket.closedDate) : "—"}
            />
          </div>
        </div>

        {/* RIGHT: DESCRIPTION */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="mb-3 text-primary">Description</h6>
            <p className="fw-semibold">{ticket.description || "No description"}</p>
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
                  <span className="ms-1">{entry.remark || "No remarks"}</span>
                </div>
                <small className="text-muted">{formatDateTime(entry.createdAt)}</small>
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
    </div>
  );
};

export default TicketView;
