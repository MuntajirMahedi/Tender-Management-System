import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { renewalApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import { formatDate } from "../../utils/formatters";

const RenewalView = () => {
  const { id } = useParams();
  const [renewal, setRenewal] = useState(null);

  useEffect(() => {
    renewalApi.getRenewals().then((res) => {
      const match = (res.renewals || []).find(
        (item) => (item.id || item._id) === id
      );
      setRenewal(match);
    });
  }, [id]);

  if (!renewal) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader title="Renewal details" />
      <div className="table-card">
        <div className="row">
          <div className="col-6">
            <div className="text-muted small">Client</div>
            <div className="fw-semibold">{renewal.client?.name}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Plan</div>
            <div className="fw-semibold">{renewal.plan?.planName}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">New Start</div>
            <div className="fw-semibold">{formatDate(renewal.newStartDate)}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">New Expiry</div>
            <div className="fw-semibold">{formatDate(renewal.newExpiryDate)}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Duration</div>
            <div className="fw-semibold">{renewal.durationMonths} months</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Type</div>
            <div className="fw-semibold">{renewal.renewalType}</div>
          </div>
          <div className="col-12">
            <div className="text-muted small">Notes</div>
            <div className="fw-semibold">{renewal.notes || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalView;

