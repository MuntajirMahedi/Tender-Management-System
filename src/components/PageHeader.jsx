import { Link, useLocation } from "react-router-dom";

const PageHeader = ({ title, subtitle, actions }) => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter((p) => p);

  const iconFor = (part) => {
    if (part === "new") return <i className=" "></i>;
    if (part === "edit") return <i className=" "></i>;
    if (!isNaN(part)) return <i className="bi bi-hash me-1"></i>;
    return <i className=" "></i>;
  };

  const labelFor = (part) => {
    if (part === "new") return "Add";
    if (part === "edit") return "Edit";
    if (!isNaN(part)) return "ID";
    return part.charAt(0).toUpperCase() + part.slice(1);
  };

  const breadcrumbs = [
    <span key="home">
      <Link to="/" className="text-decoration-none text-muted">
        <i className="bi bi-house-door me-1"></i> Home
      </Link>{" "}
      /{" "}
    </span>,
    ...pathParts.map((part, index) => {
      const fullPath = "/" + pathParts.slice(0, index + 1).join("/");
      const isLast = index === pathParts.length - 1;

      return isLast ? (
        <span key={fullPath} className="text-primary fw-semibold">
          {iconFor(part)}
          {labelFor(part)}
        </span>
      ) : (
        <span key={fullPath}>
          <Link to={fullPath} className="text-decoration-none text-muted">
            {iconFor(part)}
            {labelFor(part)}
          </Link>{" "}
          /{" "}
        </span>
      );
    }),
  ];

  return (
    <div className="mb-4">
      {/* Breadcrumb */}
      <div className="mb-2 small d-flex align-items-center flex-wrap">
        {breadcrumbs}
      </div>

      {/* Title + Actions */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h2 className="mb-1">{title}</h2>
          {subtitle && (
            <p className="text-muted mb-0">{subtitle}</p>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">{actions}</div>
      </div>
    </div>
  );
};

export default PageHeader;
