import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { inquiryApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

const InquiryView = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [followups, setFollowups] = useState([]);

  const [followupForm, setFollowupForm] = useState({
    followUpDate: "",
    statusAfter: "",
    remarks: ""
  });

  const { can } = usePermission();

  const canView = can("inquiry:view");
  const canUpdate = can("inquiry:update");
  const canFollowup = can("inquiry:followup");
  const canConvert = can("inquiry:convert");

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
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    try {
      await inquiryApi.addFollowup(id, followupForm);
      setFollowupForm({ followUpDate: "", statusAfter: "", remarks: "" });
      loadDetails();
    } catch (err) {
      console.error("Unable to add follow-up", err);
    }
  };

  const handleConvert = async () => {
    try {
      await inquiryApi.convertToClient(id);
      loadDetails();
    } catch (err) {
      console.error("Unable to convert inquiry", err);
    }
  };

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
                  <input
                    className="form-control"
                    value={followupForm.statusAfter}
                    onChange={(e) =>
                      setFollowupForm({
                        ...followupForm,
                        statusAfter: e.target.value
                      })
                    }
                  />
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
      </div>
    </RequirePermission>
  );
};

export default InquiryView;
