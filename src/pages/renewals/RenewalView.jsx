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

  // 🔽 delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 🔽 called when user CONFIRMS delete in modal
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await renewalApi.deleteRenewal(id);
      toast.success("Renewal deleted successfully");
      setShowDeleteModal(false);
      navigate("/renewals");
    } catch (err) {
      console.error("Failed to delete renewal", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete renewal";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
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
                onClick={() => setShowDeleteModal(true)} // 👈 open confirm modal
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
                      Are you sure you want to delete this renewal for{" "}
                      <strong>{renewal?.plan?.planName || "this plan"}</strong>?
                      This action cannot be undone.
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

export default RenewalView;
