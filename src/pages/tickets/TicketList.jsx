// src/pages/tickets/TicketList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { ticketApi } from "../../api";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

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

  // 🔍 Local search (frontend)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search box to inject into CrudListPage
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by subject, client, owner, status or priority"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="ticket:view">
      <CrudListPage
        title="Support Tickets"
        columns={columns}
        filters={filters}
        fetcher={ticketApi.getTickets}
        dataKey="tickets"
        customSearchControl={customSearchControl}
        // ➕ Create button allowed only when ticket:create
        createPath={canCreate ? "/tickets/new" : undefined}
        // ✅ search + delete with toasts handled here
        responseAdapter={(response, reload) => {
          const tickets = response.tickets || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredTickets = term
            ? tickets.filter((t) => {
                const subject = (t.subject || "").toLowerCase();
                const clientName = (t.client?.name || "").toLowerCase();
                const ownerName = (t.assignedTo?.name || "").toLowerCase();
                const status = (t.status || "").toLowerCase();
                const priority = (t.priority || "").toLowerCase();

                return (
                  subject.includes(term) ||
                  clientName.includes(term) ||
                  ownerName.includes(term) ||
                  status.includes(term) ||
                  priority.includes(term)
                );
              })
            : tickets;

          return {
            items: filteredTickets.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {
             

                    try {
                      await ticketApi.deleteTicket(item._id || item.id);
                      toast.success(`Ticket "${item.subject}" deleted successfully`);
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete ticket";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredTickets.length
          };
        }}
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

            {/* 🗑 Delete handled via deleteFn + toast */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default TicketList;
