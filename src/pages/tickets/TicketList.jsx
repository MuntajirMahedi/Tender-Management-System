// src/pages/tickets/TicketList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { ticketApi } from "../../api";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  { key: "subject", label: "Subject", dataIndex: "subject" },

  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—",
  },

  {
    key: "priority",
    label: "Priority",
    dataIndex: "priority",
    render: (value) => <StatusBadge status={value} />,
  },

  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />,
  },

  {
    key: "assignedTo",
    label: "Owner",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "—",
  },

  {
    key: "openedDate",
    label: "Opened",
    dataIndex: "openedDate",
    render: (value) => formatDate(value),
  },
];

const TicketList = () => {
  const { can } = usePermission();

  const canView = can("ticket:view");
  const canCreate = can("ticket:create");
  const canUpdate = can("ticket:update");
  const canDelete = can("ticket:delete");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSubject, setDeleteSubject] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await ticketApi.getTickets();

        const list =
          Array.isArray(res?.tickets)
            ? res.tickets
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setTickets(list);
      } catch (err) {
        toast.error("Unable to load tickets");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return tickets.filter((t) => {
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;

      if (!term) return true;

      return (
        (t.subject || "").toLowerCase().includes(term) ||
        (t.client?.name || "").toLowerCase().includes(term) ||
        (t.assignedTo?.name || "").toLowerCase().includes(term) ||
        (t.status || "").toLowerCase().includes(term) ||
        (t.priority || "").toLowerCase().includes(term)
      );
    });
  }, [tickets, priorityFilter, statusFilter, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const paginatedTickets = filtered.slice(startIndex, endIndex);

  // OPEN DELETE MODAL
  const confirmDelete = (id, subject) => {
    setDeleteId(id);
    setDeleteSubject(subject);
    setShowDeleteModal(true);
  };

  // DELETE ACTION
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await ticketApi.deleteTicket(deleteId);

      toast.success(`Ticket "${deleteSubject}" deleted`);

      setTickets((prev) => prev.filter((t) => (t._id || t.id) !== deleteId));

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="ticket:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Support Tickets</h4>
            <small className="text-muted">
              Track all customer issues & support requests
            </small>
          </div>

          {canCreate && (
            <Link to="/tickets/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              New Ticket
            </Link>
          )}
        </div>

        {/* FILTERS */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            {/* Priority */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Priority</label>
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted">Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="col-sm-6 col-md-4">
              <label className="form-label small text-muted">Search</label>
              <input
                className="form-control form-select-sm"
                placeholder="Subject / Client / Owner"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No tickets found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th width="180">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTickets.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const raw =
                              col.dataIndex === "client"
                                ? row.client
                                : col.dataIndex === "assignedTo"
                                ? row.assignedTo
                                : row[col.dataIndex];

                            return (
                              <td key={col.key}>
                                {col.render ? col.render(raw, row) : raw}
                              </td>
                            );
                          })}

                          <td>
                            <div className="btn-group btn-group-sm">
                              {canView && (
                                <Link
                                  to={`/tickets/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/tickets/${rowId}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    confirmDelete(rowId, row.subject)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {!loading && total > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">
              {/* Left */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="small text-muted">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              {/* Right */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>

                <span className="small">Page {currentPage} of {totalPages}</span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DELETE CONFIRM MODAL */}
        {showDeleteModal && (
          <>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle me-2" />
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete ticket <strong>"{deleteSubject}"</strong>?
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

            <div className="modal-backdrop fade show" />
          </>
        )}

      </div>
    </RequirePermission>
  );
};

export default TicketList;
