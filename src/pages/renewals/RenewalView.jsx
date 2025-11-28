// src/pages/renewals/RenewalView.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { renewalApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const RenewalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [renewal, setRenewal] = useState(null);
  const [loading, setLoading] = useState(true);

  const { can } = usePermission();
  const canUpdate = can("renewal:update");
  const canDelete = can("renewal:delete");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // using getRenewals + find, as in your original code
        const res = await renewalApi.getRenewals();
        const match = (res.renewals || []).find(
          (item) => (item.id || item._id) === id
        );
        if (!match) {
          toast.error("Renewal not found");
        }
        setRenewal(match || null);
      } catch (err) {
        console.error("Failed to load renewal", err);
        toast.error("Failed to load renewal details");
        setRenewal(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {

    try {
      await renewalApi.deleteRenewal(id);
      toast.success("Renewal deleted successfully");
      navigate("/renewals");
    } catch (err) {
      console.error("Failed to delete renewal", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete renewal";
      toast.error(msg);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!renewal) return <p className="text-muted">Renewal not found</p>;

  return (
    <RequirePermission permission="renewal:view">
      <div>
        <PageHeader
          title={`Renewal • ${renewal.plan?.planName || ""}`}
          subtitle={renewal.client?.name}
          actions={[
            canUpdate && (
              <Link
                key="edit"
                to={`/renewals/${id}/edit`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-pencil-square me-2" />
                Edit
              </Link>
            ),
            canDelete && (
              <button
                key="delete"
                className="btn btn-outline-danger"
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-2" />
                Delete
              </button>
            )
          ].filter(Boolean)}
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
              <InfoItem
                label="Duration"
                value={
                  renewal.durationMonths
                    ? `${renewal.durationMonths} months`
                    : "—"
                }
              />
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="col-lg-6">
            <div className="card p-3 shadow-sm h-100">
              <h6 className="text-primary mb-3">Renewal Dates</h6>

              <InfoItem
                label="New Start Date"
                value={formatDate(renewal.newStartDate)}
              />
              <InfoItem
                label="New Expiry Date"
                value={formatDate(renewal.newExpiryDate)}
              />

              <h6 className="mt-3 text-primary">Notes</h6>
              <p className="fw-semibold">{renewal.notes || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
};

export default RenewalView;
