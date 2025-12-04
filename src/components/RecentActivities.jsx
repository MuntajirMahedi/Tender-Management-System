import { useEffect, useState } from "react";
import { auditApi } from "../api";
import usePermission from "../hooks/usePermission";

const RecentActivities = () => {
  const { can } = usePermission();
  const canViewAudit = can("audit:view");

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!canViewAudit) return;

    const load = async () => {
      try {
        const res = await auditApi.getAuditLogs({
          sort: "-createdAt",
          limit: 5, // ⭐ EXACTLY 5 ONLY
        });

        const list = Array.isArray(res.logs) ? res.logs.slice(0, 5) : [];
        setLogs(list);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      }
    };

    load();
  }, [canViewAudit]);

  if (!canViewAudit) return null;

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
      <h5 className="fw-bold mb-3">Recent Activities</h5>

      {logs.length === 0 ? (
        <p className="text-muted small">No recent activity.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {logs.map((log) => (
            <li
              key={log.id}
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
                  <div className="fw-semibold">
                    {log.user?.name || "Unknown User"}
                  </div>

                  <div className="text-muted small">
                    {log.description || log.action}
                  </div>

                  <div className="small text-secondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>

                <span
                  className="badge bg-primary"
                  style={{ height: "fit-content" }}
                >
                  {log.module}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivities;
