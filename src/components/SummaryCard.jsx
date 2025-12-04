import clsx from "clsx";

const colors = ["bg-primary", "bg-success", "bg-warning", "bg-info", "bg-danger"];

const SummaryCard = ({
  icon,
  title,
  value,
  trend,
  trendLabel,
  colorIndex = 0,
  clickable,
  onClick
}) => {
  return (
    <div
      className={clsx("summary-card", clickable && "clickable")}
      onClick={clickable ? onClick : undefined}
      style={{
        padding: "1.25rem",
        background: "#fff",
        borderRadius: "1rem",
        boxShadow: "0 8px 24px rgba(15, 35, 95, 0.07)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <p className="text-muted text-uppercase small mb-1">{title}</p>

          <div
            className="value"
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {value}
          </div>
        </div>

        {icon && (
          <div
            className={clsx(
              "icon-pill",
              colors[colorIndex % colors.length]
            )}
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              color: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            }}
          >
            <i className={`bi ${icon}`}></i>
          </div>
        )}
      </div>

      {trend !== undefined && (
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 500,
            color: Number(trend) < 0 ? "#ef4444" : "#16a34a",
          }}
        >
          {trend}{" "}
          <span style={{ color: "#64748b", fontWeight: 400 }}>
            {trendLabel}
          </span>
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
