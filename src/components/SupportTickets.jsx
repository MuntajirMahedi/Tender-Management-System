// src/components/SupportTickets.jsx
import { useEffect, useState } from "react";
import { getTickets } from "../api/tickets"; // adjust path based on project
import usePermission from "../hooks/usePermission";

const SupportTickets = () => {
  const { can } = usePermission();
  const canView = can("ticket:view");

  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        // Load all tickets
        const res = await getTickets();

        const tickets = res.tickets || [];

        // Count by status
        const counts = {
          Open: 0,
          "In Progress": 0,
          Resolved: 0,
          Closed: 0,
        };

        tickets.forEach((t) => {
          if (counts[t.status] !== undefined) {
            counts[t.status] += 1;
          }
        });

        // Convert to array with UI friendly structure
        const data = [
          { label: "Open", value: counts["Open"], max: tickets.length },
          { label: "In Progress", value: counts["In Progress"], max: tickets.length },
          { label: "Resolved", value: counts["Resolved"], max: tickets.length },
          { label: "Closed", value: counts["Closed"], max: tickets.length },
        ];

        setStats(data);
      } catch (err) {
        console.error("Support Ticket Summary Error", err);
      }
    };

    load();
  }, [canView]);

  if (!canView) return null;

  return (
    <div
      className="summary-card"
      style={{
        borderRadius: "16px",
        padding: "20px",
        height: "100%",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <h5 className="fw-bold mb-3">Support Tickets</h5>

      {stats.map((item) => (
        <div key={item.label} className="mb-3">
          <div className="d-flex justify-content-between">
            <span className="fw-semibold">{item.label}</span>
            <span>{item.value}</span>
          </div>

          <div
            style={{
              height: "6px",
              borderRadius: "4px",
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: item.max > 0 ? `${(item.value / item.max) * 100}%` : "0%",
                background: "#0f172a",
                height: "100%",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      ))}

    </div>
  );
};

export default SupportTickets;
