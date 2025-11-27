import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { renewalApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatters";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

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
      <PageHeader
        title={`Renewal • ${renewal.plan?.planName || ""}`}
        subtitle={renewal.client?.name}
      />

      {/* MAIN SECTION */}
      <div className="row g-4">

        {/* LEFT CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Renewal Summary</h6>

            <InfoItem label="Client" value={renewal.client?.name} />
            <InfoItem label="Plan" value={renewal.plan?.planName} />
            <InfoItem label="Type" value={renewal.renewalType} />
            <InfoItem label="Duration" value={`${renewal.durationMonths} months`} />

          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Renewal Dates</h6>

            <InfoItem label="New Start Date" value={formatDate(renewal.newStartDate)} />
            <InfoItem label="New Expiry Date" value={formatDate(renewal.newExpiryDate)} />

            <h6 className="mt-3 text-primary">Notes</h6>
            <p className="fw-semibold">{renewal.notes || "—"}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RenewalView;
