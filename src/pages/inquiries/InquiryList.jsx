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
      FILTERS
----------------------------------- */
const filters = [
  { key: "status", label: "Status", type: "select", options: INQUIRY_STATUSES },
  { key: "interestLevel", label: "Interest", type: "select", options: INQUIRY_INTEREST_LEVELS },
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

  // filters
  const [statusFilter, setStatusFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 1, 5, 10, 20, 50, 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await inquiryApi.getInquiries();
        const list =
          Array.isArray(res?.inquiries) ? res.inquiries :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setInquiries(list);
      } catch (err) {
        console.error("Unable to load inquiries", err);
        toast.error("Unable to load inquiries");
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered inquiries
  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (statusFilter && inq.status !== statusFilter) return false;
      if (interestFilter && inq.interestLevel !== interestFilter) return false;
      return true;
    });
  }, [inquiries, statusFilter, interestFilter]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedInquiries = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this inquiry?"
    );
    if (!confirmed) return;

    try {
      await inquiryApi.deleteInquiry(id);
      toast.success("Inquiry deleted successfully");

      setInquiries((prev) =>
        prev.filter((inq) => (inq._id || inq.id) !== id)
      );
    } catch (err) {
      console.error("Unable to delete inquiry", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete inquiry";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="inquiry:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Inquiries</h4>
            <small className="text-muted">
              Manage all incoming leads and prospects
            </small>
          </div>

          {canCreate && (
            <Link to="/inquiries/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Inquiry
            </Link>
          )}
        </div>

        {/* FILTERS ROW */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-4 col-md-3">
              <label className="form-label small text-muted mb-1">
                Status
              </label>
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
              <label className="form-label small text-muted mb-1">
                Interest Level
              </label>
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
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No inquiries found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th style={{ width: "160px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInquiries.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            let rawValue;
                            if (col.dataIndex === "assignedTo") {
                              rawValue = row.assignedTo;
                            } else {
                              rawValue = row[col.dataIndex];
                            }

                            return (
                              <td key={col.key}>
                                {col.render
                                  ? col.render(rawValue, row)
                                  : rawValue}
                              </td>
                            );
                          })}

                          {/* Actions */}
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
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(rowId)}
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

          {/* PAGINATION FOOTER */}
          {!loading && total > 0 && (
            <div className="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
              {/* left: page size + info */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-muted small">entries</span>

                <span className="text-muted small ms-3">
                  Showing{" "}
                  {total === 0
                    ? "0"
                    : `${startIndex + 1}–${endIndex}`}{" "}
                  of {total} entries
                </span>
              </div>

              {/* right: pagination buttons */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handlePrev}
                  disabled={currentPage <= 1}
                >
                  Prev
                </button>
                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
};

export default InquiryList;
