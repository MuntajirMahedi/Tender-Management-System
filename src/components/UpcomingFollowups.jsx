import { useEffect, useState } from "react";
import { inquiryApi } from "../api";
import usePermission from "../hooks/usePermission";

const UpcomingFollowups = () => {
  const { can } = usePermission();

  // Only users with inquiry:followup permission can see it
  const canSeeFollowups = can("inquiry:followup");

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!canSeeFollowups) return;

    const load = async () => {
      try {
        const res = await inquiryApi.getInquiries();

        const list = (res.inquiries || [])
          .filter((i) => i.nextFollowUpDate)
          .map((i) => ({
            id: i.id,
            name: i.name,
            mobile: i.mobile,
            assignedTo: i.assignedTo?.name || "—",
            date: new Date(i.nextFollowUpDate),
          }))
          .sort((a, b) => a.date - b.date)
          .slice(0, 5); // ⭐ EXACTLY 5 ONLY

        setItems(list);
      } catch (err) {
        console.error("Upcoming Followups load failed", err);
      }
    };

    load();
  }, [canSeeFollowups]);

  const getStatusColor = (date) => {
    const today = new Date();
    return date < today ? "#ef4444" : "#0ea5e9"; // red or blue
  };

  // Hide entire card if no permission
  if (!canSeeFollowups) return null;

  return (
    <div
      className="summary-card"
      style={{
        padding: "1.25rem",
        borderRadius: "1rem",
        boxShadow: "0 8px 24px rgba(15, 35, 95, 0.07)",
        height: "100%",
      }}
    >
      <h5 className="fw-bold mb-3">Upcoming Follow-ups</h5>

      {items.length === 0 ? (
        <p className="text-muted small">No upcoming follow-ups.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {items.map((fup) => (
            <li
              key={fup.id}
              className="list-group-item"
              style={{
                border: "none",
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: "0.55rem",
                paddingBottom: "0.55rem",
                background: "transparent",
              }}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{fup.name}</div>
                  <div className="text-muted small">{fup.mobile}</div>
                  <div className="small text-secondary">
                    {fup.date.toLocaleString()}
                  </div>
                </div>

                <span
                  className="badge"
                  style={{
                    background: getStatusColor(fup.date),
                    color: "#ffffff",
                    height: "fit-content",
                  }}
                >
                  {fup.date < new Date() ? "Overdue" : "Upcoming"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingFollowups;
