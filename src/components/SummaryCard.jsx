import clsx from "clsx";

const colors = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-info",
  "bg-danger"
];

const SummaryCard = ({
  icon,
  title,
  value,
  trend,
  trendLabel,
  colorIndex = 0,
}) => {
  return (
    <div className="summary-card" style={{ padding: "1.25rem" }}>
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ marginBottom: "0.65rem" }}
      >
        {/* Title + Value */}
        <div>
          <p
            className="text-muted text-uppercase small mb-1"
            style={{
              fontWeight: 600,
              letterSpacing: "0.5px",
              fontSize: "0.78rem",
            }}
          >
            {title}
          </p>

          <div
            className="value"
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#0f172a",
            }}
          >
            {value}
          </div>
        </div>

        {/* Icon pill */}
        {icon && (
          <div
            className={clsx(
              "icon-pill",
              colors[colorIndex % colors.length] || "bg-primary"
            )}
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 6px 18px rgba(20,20,20,0.12)",
              color: "#fff",
            }}
          >
            <i
              className={`bi ${icon}`}
              style={{ fontSize: "1.4rem", lineHeight: 0 }}
            />
          </div>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <p
          className={clsx("trend", { negative: Number(trend) < 0 })}
          style={{
            marginTop: "0.35rem",
            marginBottom: 0,
            fontSize: "0.9rem",
            fontWeight: 500,
            color: Number(trend) < 0 ? "#ef4444" : "#16a34a",
          }}
        >
          {trend > 0 ? "+" : ""}
          {trend}%{" "}
          <span style={{ color: "#64748b", fontWeight: 400 }}>
            {trendLabel}
          </span>
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
