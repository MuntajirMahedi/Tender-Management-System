import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { ticketApi } from "../../api";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

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

const TicketList = () => {
  const { can } = usePermission();

  const canView = can("ticket:view");
  const canCreate = can("ticket:create");
  const canUpdate = can("ticket:update");
  const canDelete = can("ticket:delete");

  return (
    <RequirePermission permission="ticket:view">
      <CrudListPage
        title="Support Tickets"
        columns={columns}
        filters={filters}
        fetcher={ticketApi.getTickets}
        dataKey="tickets"

        // ➕ Create button allowed only when ticket:create
        createPath={canCreate ? "/tickets/new" : undefined}

        responseAdapter={(response) => ({
          items: (response.tickets || []).map((item) => ({
            ...item,
            deleteFn: canDelete ? ticketApi.deleteTicket : undefined
          })),
          total: response.count || 0
        })}

        actions={(row) => (
          <div className="btn-group btn-group-sm">

            {/* 👁 VIEW allowed only when ticket:view */}
            {canView && (
              <Link
                to={`/tickets/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏ EDIT allowed only when ticket:update */}
            {canUpdate && (
              <Link
                to={`/tickets/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* 🗑 Delete handled by DataTable using deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default TicketList;
