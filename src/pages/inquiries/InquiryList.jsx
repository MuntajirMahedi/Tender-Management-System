// src/pages/inquiries/InquiryList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import StatusBadge from "../../components/StatusBadge";
import { inquiryApi } from "../../api";
import {
  INQUIRY_STATUSES,
  INQUIRY_INTEREST_LEVELS
} from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";
import PageHeader from "../../components/PageHeader";

/* -----------------------------------
      TABLE COLUMNS
----------------------------------- */
const columns = [
  {
    key: "name",
    label: "Prospect",
    dataIndex: "name",
    render: (value, row) => (
      <div>
        <div className="fw-semibold">{value}</div>
        <div className="text-muted small">{row.companyName || "—"}</div>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    dataIndex: "mobile",
    render: (value, row) => (
      <div>
        <div>{value || "—"}</div>
        <div className="text-muted small">{row.email || "NA"}</div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "interestLevel",
    label: "Interest",
    dataIndex: "interestLevel",
  },
  {
    key: "assignedTo",
    label: "Assigned",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "Unassigned",
  },
  {
    key: "nextFollowUpDate",
    label: "Next follow-up",
    dataIndex: "nextFollowUpDate",
    render: (value) => formatDate(value),
  },
];

/* -----------------------------------
      MAIN COMPONENT
----------------------------------- */
const InquiryList = () => {
  const { can } = usePermission();

  const canView = can("inquiry:view");
  const canCreate = can("inquiry:create");
  const canUpdate = can("inquiry:update");
  const canDelete = can("inquiry:delete");

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single/Bulk modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // MULTI DELETE
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load inquiries
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await inquiryApi.getInquiries();

        const list =
          Array.isArray(res?.inquiries)
            ? res.inquiries
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setInquiries(list);
      } catch (err) {
        toast.error("Unable to load inquiries");
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + Search
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return inquiries.filter((inq) => {
      if (statusFilter && inq.status !== statusFilter) return false;
      if (interestFilter && inq.interestLevel !== interestFilter) return false;

      if (!term) return true;

      const name = (inq.name || "").toLowerCase();
      const company = (inq.companyName || "").toLowerCase();
      const mobile = (inq.mobile || "").toLowerCase();
      const email = (inq.email || "").toLowerCase();
      const assigned = (inq.assignedTo?.name || "").toLowerCase();

      return (
        name.includes(term) ||
        company.includes(term) ||
        mobile.includes(term) ||
        email.includes(term) ||
        assigned.includes(term)
      );
    });
  }, [inquiries, statusFilter, interestFilter, debouncedSearch]);

  // Pagination calculation
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedInquiries = filtered.slice(startIndex, endIndex);

  /* -------------------------
      SINGLE DELETE
  ------------------------- */
  const confirmDelete = (id, name) => {
    setIsBulkDelete(false);
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  /* -------------------------
      MULTI DELETE (Open Modal)
  ------------------------- */
  const deleteSelected = () => {
    if (selected.length === 0) {
      toast.info("No inquiries selected");
      return;
    }

    setIsBulkDelete(true);
    setDeleteName(`${selected.length} inquiries`);
    setShowDeleteModal(true);
  };

  /* -------------------------
      DELETE HANDLE (Both modes)
  ------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        await Promise.all(selected.map((id) => inquiryApi.deleteInquiry(id)));

        setInquiries((prev) =>
          prev.filter((inq) => !selected.includes(inq._id || inq.id))
        );

        toast.success("Selected inquiries deleted");

        setSelected([]);
        setSelectAll(false);
        setIsBulkDelete(false);
      } else {
        await inquiryApi.deleteInquiry(deleteId);

        toast.success("Inquiry deleted successfully");

        setInquiries((prev) =>
          prev.filter((inq) => (inq._id || inq.id) !== deleteId)
        );
      }

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* -------------------------
     MULTI SELECT HANDLERS
  ------------------------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const ids = paginatedInquiries.map((inq) => inq._id || inq.id);
      setSelected(ids);
    }
    setSelectAll(!selectAll);
  };

  return (
    <RequirePermission permission="inquiry:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader title="Inquiries" subtitle="Manage all incoming leads" />

          <div className="d-flex gap-2">
            {selected.length > 0 && (
              <button className="btn btn-danger" onClick={deleteSelected}>
                <i className="bi bi-trash me-1"></i>
                Delete Selected ({selected.length})
              </button>
            )}

            {canCreate && (
              <Link to="/inquiries/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2" /> New Inquiry
              </Link>
            )}
          </div>
        </div>

        {/* FILTER + SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">

            <div className="col-sm-4 col-md-3">
              <label className="form-label small">Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {INQUIRY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-4 col-md-3">
              <label className="form-label small">Interest</label>
              <select
                className="form-select form-select-sm"
                value={interestFilter}
                onChange={(e) => {
                  setInterestFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {INQUIRY_INTEREST_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-8 col-md-4">
              <label className="form-label small">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search name, company, mobile, email"
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
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th width="50">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>

                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}

                  <th width="150">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-3 text-muted">
                      No inquiries found.
                    </td>
                  </tr>
                ) : (
                  paginatedInquiries.map((row) => {
                    const rowId = row._id || row.id;

                    return (
                      <tr key={rowId}>
                        {/* Checkbox */}
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(rowId)}
                            onChange={() => toggleSelect(rowId)}
                          />
                        </td>

                        {columns.map((col) => {
                          const rawValue =
                            col.dataIndex === "assignedTo"
                              ? row.assignedTo
                              : row[col.dataIndex];

                          return (
                            <td key={col.key}>
                              {col.render
                                ? col.render(rawValue, row)
                                : rawValue}
                            </td>
                          );
                        })}

                        {/* ACTION BUTTONS */}
                        <td>
                          <div className="btn-group btn-group-sm">
                            {canView && (
                              <Link
                                to={`/inquiries/${rowId}`}
                                className="btn btn-outline-secondary"
                              >
                                View
                              </Link>
                            )}

                            {canUpdate && (
                              <Link
                                to={`/inquiries/${rowId}/edit`}
                                className="btn btn-outline-primary"
                              >
                                Edit
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => confirmDelete(rowId, row.name)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!loading && filtered.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 80 }}
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

                <span className="text-muted small">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>

                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>

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

        {/* ---------- DELETE CONFIRM MODAL ---------- */}
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
                    ></button>
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete{" "}
                    <strong>{deleteName}</strong>?
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

export default InquiryList;
