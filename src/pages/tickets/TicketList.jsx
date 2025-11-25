import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { ticketApi } from "../../api";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

const columns = [
  { key: "subject", label: "Subject", dataIndex: "subject" },

  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },

  {
    key: "priority",
    label: "Priority",
    dataIndex: "priority",
    render: (value) => <StatusBadge status={value} />
  },

  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },

  {
    key: "assignedTo",
    label: "Owner",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "—"
  },

  {
    key: "openedDate",
    label: "Opened",
    dataIndex: "openedDate",
    render: (value) => formatDate(value)
  }
];

const filters = [
  { key: "priority", label: "Priority", type: "select", options: TICKET_PRIORITIES },
  { key: "status", label: "Status", type: "select", options: TICKET_STATUSES }
];

const TicketList = () => (
  <CrudListPage
    title="Support Tickets"
    columns={columns}
    filters={filters}
    fetcher={ticketApi.getTickets}
    dataKey="tickets"
    createPath="/tickets/new"

    // ⭐ Add deleteFn for all rows
    responseAdapter={(response) => ({
      items: (response.tickets || []).map((item) => ({
        ...item,
        deleteFn: ticketApi.deleteTicket   // ⭐ DELETE ENABLED HERE
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/tickets/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>

        <Link
          to={`/tickets/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>

        {/* No need for delete button here, DataTable automatically adds it */}
      </div>
    )}
  />
);

export default TicketList;
