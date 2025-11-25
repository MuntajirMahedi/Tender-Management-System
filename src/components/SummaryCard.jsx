import clsx from "clsx";

const colors = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-info",
  "bg-danger"
];

const SummaryCard = ({ icon, title, value, trend, trendLabel, colorIndex }) => (
  <div className="summary-card">
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <p className="text-muted text-uppercase small mb-1">{title}</p>
        <div className="value">{value}</div>
      </div>
      {icon && (
        <div
          className={clsx(
            "icon-pill",
            colors[colorIndex % colors.length] || "bg-primary"
          )}
        >
          <i className={`bi ${icon}`} />
        </div>
      )}
    </div>
    {trend !== undefined && (
      <p className={clsx("trend", { negative: Number(trend) < 0 })}>
        {trend > 0 ? "+" : ""}
        {trend}% {trendLabel}
      </p>
    )}
  </div>
);

export default SummaryCard;

