import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { inquiryApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";

const InquiryView = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [followupForm, setFollowupForm] = useState({
    followUpDate: "",
    statusAfter: "",
    remarks: ""
  });

  const loadDetails = async () => {
    try {
      const [{ inquiry }, { followups }] = await Promise.all([
        inquiryApi.getInquiry(id),
        inquiryApi.getFollowups(id)
      ]);
      setInquiry(inquiry);
      setFollowups(followups || []);
    } catch (error) {
      console.error("Unable to load inquiry", error);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleFollowupSubmit = async (event) => {
    event.preventDefault();
    try {
      await inquiryApi.addFollowup(id, followupForm);
      setFollowupForm({ followUpDate: "", statusAfter: "", remarks: "" });
      loadDetails();
    } catch (error) {
      console.error("Unable to add followup", error);
    }
  };

  const handleConvert = async () => {
    try {
      await inquiryApi.convertToClient(id);
      loadDetails();
    } catch (error) {
      console.error("Unable to convert inquiry", error);
    }
  };

  if (!inquiry) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <PageHeader
        title={`Inquiry • ${inquiry.name}`}
        actions={[
          <Link
            key="edit"
            to={`/inquiries/${id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>,
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
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Primary details</h6>
            <div className="row">
              <div className="col-6">
                <div className="text-muted small">Status</div>
                <StatusBadge status={inquiry.status} />
              </div>
              <div className="col-6">
                <div className="text-muted small">Interest</div>
                <div className="fw-semibold">{inquiry.interestLevel}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Contact</div>
                <div className="fw-semibold">{inquiry.mobile}</div>
                <div className="text-muted small">{inquiry.email || "NA"}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Company</div>
                <div className="fw-semibold">
                  {inquiry.companyName || "NA"}
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Assigned to</div>
                <div className="fw-semibold">
                  {inquiry.assignedTo?.name || "Unassigned"}
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Next follow-up</div>
                <div className="fw-semibold">
                  {formatDate(inquiry.nextFollowUpDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="table-card h-100">
            <h6>Add follow-up</h6>
            <form onSubmit={handleFollowupSubmit}>
              <div className="mb-3">
                <label className="form-label">Follow-up date</label>
                <input
                  type="date"
                  className="form-control"
                  value={followupForm.followUpDate}
                  onChange={(event) =>
                    setFollowupForm((prev) => ({
                      ...prev,
                      followUpDate: event.target.value
                    }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Status after follow-up</label>
                <input
                  className="form-control"
                  value={followupForm.statusAfter}
                  onChange={(event) =>
                    setFollowupForm((prev) => ({
                      ...prev,
                      statusAfter: event.target.value
                    }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={followupForm.remarks}
                  onChange={(event) =>
                    setFollowupForm((prev) => ({
                      ...prev,
                      remarks: event.target.value
                    }))
                  }
                />
              </div>
              <button className="btn btn-primary">Add follow-up</button>
            </form>
          </div>
        </div>
      </div>
      <div className="table-card mt-4">
        <h6>Follow-up history</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((item) => (
                <tr key={item._id}>
                  <td>{formatDateTime(item.followUpDate)}</td>
                  <td>{item.statusAfter}</td>
                  <td>{item.remarks || "—"}</td>
                  <td>{item.createdBy?.name || "System"}</td>
                </tr>
              ))}
              {followups.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No follow-ups added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InquiryView;

