import React from "react";
import { useNavigate } from "react-router-dom";
import usePermission from "../hooks/usePermission";

const QuickActions = ({ className = "" }) => {
  const navigate = useNavigate();
  const { can } = usePermission();

  // Permission-based actions
  const actions = [
    {
      label: "New Inquiry",
      icon: "bi-chat-dots",
      to: "/inquiries/new",
      color: "#2563eb",
      permission: "inquiry:create",
    },
    {
      label: "New Client",
      icon: "bi-person-plus",
      to: "/clients/new",
      color: "#16a34a",
      permission: "client:create",
    },
    {
      label: "New Plan",
      icon: "bi-bookmark-plus",
      to: "/plans/new",
      color: "#9333ea",
      permission: "plan:create",
    },
    {
      label: "New Invoice",
      icon: "bi-receipt",
      to: "/invoices/new",
      color: "#dc2626",
      permission: "invoice:create",
    },
    {
      label: "New Ticket",
      icon: "bi-life-preserver",
      to: "/tickets/new",
      color: "#0ea5e9",
      permission: "ticket:create",
    },
    {
      label: "New Payment",
      icon: "bi-cash-coin",
      to: "/payments/new",
      color: "#ca8a04",
      permission: "payment:create",
    },
  ];

  // Filter only allowed actions
  const allowedActions = actions.filter((a) => can(a.permission));

  // If no options → hide entire component
  if (allowedActions.length === 0) return null;

  return (
    <div
      className={`quick-actions-card ${className}`}
      style={{
        borderRadius: "1.1rem",
        padding: "1.8rem",
        width: "100%",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Quick Actions</h4>
          <p className="text-muted mb-0">Instant actions to speed up workflow</p>
        </div>
      </div>

      {/* GRID BUTTONS */}
      <div
        className="quick-actions-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.2rem",
          marginTop: "1.3rem",
        }}
      >
        {allowedActions.map((a) => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="quick-action-btn"
            style={{
              background: "#f8fafc",
              border: "none",
              padding: "1.2rem",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              cursor: "pointer",
              transition: "0.25s ease",
            }}
          >
            <div
              className="quick-action-icon"
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: a.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.55rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              }}
            >
              <i className={`bi ${a.icon}`} />
            </div>

            <div
              className="quick-action-text"
              style={{ fontSize: "1.05rem", fontWeight: 600, color: "#0f172a" }}
            >
              {a.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
