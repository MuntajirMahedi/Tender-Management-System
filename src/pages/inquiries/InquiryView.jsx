// src/pages/inquiries/InquiryView.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { inquiryApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";

// 🔽 Status options for "Status After" dropdown
const STATUS_OPTIONS = [
  "New",
  "Prospect",
  "Cold",
  "Not Connected",
  "Following",
  "Converted",
  "Lost"
];

// 🔽 Helper to get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().slice(0, 10);

const InquiryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [followups, setFollowups] = useState([]);

  const [followupForm, setFollowupForm] = useState({
    followUpDate: getToday(), // ✅ default: today
    statusAfter: "New",       // ✅ default: New
    remarks: ""
  });

  // 🔽 state for delete confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { can } = usePermission();

  const canView = can("inquiry:view");
  const canUpdate = can("inquiry:update");
  const canFollowup = can("inquiry:followup");
  const canConvert = can("inquiry:convert");
  const canDelete = can("inquiry:delete"); // ✅ delete permission

  const loadDetails = async () => {
    try {
      const [{ inquiry }, { followups }] = await Promise.all([
        inquiryApi.getInquiry(id),
        inquiryApi.getFollowups(id)
      ]);
      setInquiry(inquiry);
      setFollowups(followups || []);
    } catch (err) {
      console.error("Unable to load inquiry", err);
      toast.error("Unable to load inquiry details");
    }
  };

  useEffect(() => {
    if (canView) {
      loadDetails();
    }
  }, [id, canView]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();

    // ✅ basic validation before calling API
    if (!followupForm.followUpDate) {
      toast.error("Follow-up date is required");
      return;
    }
    if (!followupForm.statusAfter) {
      toast.error("Status after is required");
      return;
    }

    try {
      await inquiryApi.addFollowup(id, followupForm);
      toast.success("Follow-up added successfully");

      // Reset: still today + New
      setFollowupForm({
        followUpDate: getToday(),
        statusAfter: "New",
        remarks: ""
      });

      loadDetails();
    } catch (err) {
      console.error("Unable to add follow-up", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to add follow-up";
      toast.error(msg);
    }
  };

  const handleConvert = async () => {
  try {
    await inquiryApi.convertToClient(id);
    toast.success("Inquiry converted to client successfully");

    // 👉 redirect to clients page
    navigate("/clients");

  } catch (err) {
    console.error("Unable to convert inquiry", err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Unable to convert inquiry";
    toast.error(msg);
  }
};


  // 🔽 called when user CONFIRMS delete in modal
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await inquiryApi.deleteInquiry(id);
      toast.success("Inquiry deleted successfully");

      // close modal and go back to list
      setShowDeleteModal(false);
      navigate("/inquiries");
    } catch (err) {
      console.error("Unable to delete inquiry", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete inquiry";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <RequirePermission permission="inquiry:view">
        <p>Checking permissions...</p>
      </RequirePermission>
    );
  }

  if (!inquiry) return <p>Loading...</p>;

  return (
    <RequirePermission permission="inquiry:view">
      <div>
        <PageHeader
        
          title={`Inquiry • ${inquiry.name}`}
          actions={[
            // ✏️ Edit only if allowed
            canUpdate && (
              <Link
                key="edit"
                to={`/inquiries/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit
              </Link>
            ),

            // 🔄 Convert only if allowed and not yet converted
            canConvert &&
              inquiry.status !== "Converted" && (
                <button
                  key="convert"
                  className="btn btn-success"
                  onClick={handleConvert}
                >
                  Convert to Client
                </button>
              ),

            // 🗑️ Delete only if allowed
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)} // 👈 open modal
              >
                <i className="bi bi-trash me-2"></i>
                Delete
              </button>
            )
          ]}
        />

        {/* ----------- MAIN DETAILS CARD ----------- */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="text-primary mb-3">Inquiry Details</h5>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-muted small">Status</div>
                <StatusBadge status={inquiry.status} />
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Interest Level</div>
                <div className="fw-semibold">{inquiry.interestLevel || "—"}</div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Assigned To</div>
                <div className="fw-semibold">
                  {inquiry.assignedTo?.name || "—"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Mobile</div>
                <div className="fw-semibold">{inquiry.mobile}</div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Email</div>
                <div className="fw-semibold">{inquiry.email || "—"}</div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Company</div>
                <div className="fw-semibold">{inquiry.companyName || "—"}</div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Next Follow-up</div>
                <div className="fw-semibold">
                  {formatDate(inquiry.nextFollowUpDate)}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted small">Created On</div>
                <div className="fw-semibold">
                  {formatDateTime(inquiry.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------- FOLLOWUP FORM — PERMISSION CONTROLLED ----------- */}
        {canFollowup && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="text-primary mb-3">Add Follow-up</h5>

              <form onSubmit={handleFollowupSubmit} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Follow-up Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={followupForm.followUpDate}
                    onChange={(e) =>
                      setFollowupForm({
                        ...followupForm,
                        followUpDate: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Status After</label>
                  <select
                    className="form-select"
                    value={followupForm.statusAfter}
                    onChange={(e) =>
                      setFollowupForm({
                        ...followupForm,
                        statusAfter: e.target.value
                      })
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label">Remarks</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={followupForm.remarks}
                    onChange={(e) =>
                      setFollowupForm({
                        ...followupForm,
                        remarks: e.target.value
                      })
                    }
                  ></textarea>
                </div>

                <div className="col-12">
                  <button className="btn btn-primary">Add Follow-up</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------- FOLLOWUP HISTORY ----------- */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="text-primary mb-3">Follow-up History</h5>

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Owner</th>
                  </tr>
                </thead>

                <tbody>
                  {followups.length > 0 ? (
                    followups.map((f) => (
                      <tr key={f._id}>
                        <td>{formatDateTime(f.followUpDate)}</td>
                        <td>{f.statusAfter}</td>
                        <td>{f.remarks || "—"}</td>
                        <td>{f.createdBy?.name || "System"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No follow-ups added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                      Are you sure you want to delete this inquiry{" "}
                      <strong>{inquiry?.name}</strong>? This action cannot be
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

export default InquiryView;
                              