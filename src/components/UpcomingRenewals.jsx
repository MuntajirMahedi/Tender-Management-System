// src/components/UpcomingRenewals.jsx
import { useEffect, useState } from "react";
import usePermission from "../hooks/usePermission";
import { getUpcomingRenewals } from "../api/renewals";
import { formatDate } from "../utils/formatters";

const UpcomingRenewals = () => {
  const { can } = usePermission();
  const canView = can("renewal:view");

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        const res = await getUpcomingRenewals({ limit: 5 });
        setItems(res.plans || []);
      } catch (err) {
        console.error("Upcoming renewals load failed", err);
      }
    };

    load();
  }, [canView]);

  if (!canView) return null;

  // ✅ SORT + FIRST 3
  const visibleItems = [...items]
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 3);

  return (
    <div
      className="summary-card"
      style={{
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",

        /* ✅ IMPORTANT FIX */
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Upcoming Renewals</h5>

        <span
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "2px 10px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {visibleItems.length}
        </span>
      </div>

      {/* List */}
      {visibleItems.length === 0 ? (
        <p className="text-muted small">No upcoming renewals.</p>
      ) : (
        <div>
          {visibleItems.map((p) => (
            <div
              key={p.planId || p._id}
              className="p-3 mb-3"
              style={{
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #eee",
              }}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">
                    {p.client?.name || "—"}
                  </div>

                  <div className="text-muted small">
                    {p.planType} – {p.planName}
                  </div>

                  <div className="small mt-1">
                    <i className="bi bi-calendar3 me-1"></i>
                    {formatDate(p.expiryDate)}
                  </div>
                </div>

                <span
                  className="badge text-capitalize"
                  style={{
                    background:
                      p.status === "Active"
                        ? "#d1fae5"
                        : p.status === "Cancelled"
                        ? "#fee2e2"
                        : "#e0e7ff",
                    color:
                      p.status === "Active"
                        ? "#065f46"
                        : p.status === "Cancelled"
                        ? "#991b1b"
                        : "#3730a3",
                    height: "fit-content",
                  }}
                >
                  {p.status || "pending"}
                </span>
              </div>

              {p.netAmount && (
                <div className="fw-bold mt-2">
                  ₹{Number(p.netAmount).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingRenewals;
