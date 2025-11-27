// src/pages/inquiries/InquiryList.jsx
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { inquiryApi } from "../../api";
import {
  INQUIRY_STATUSES,
  INQUIRY_INTEREST_LEVELS
} from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

/* -----------------------------------
      TABLE COLUMNS
----------------------------------- */
const columns = [
  {
    key: "name",
    label: "Prospect",
    dataIndex: "name",
    render: (value, row) => (
      <div>
        <div className="fw-semibold">{value}</div>
        <div className="text-muted small">{row.companyName || "—"}</div>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    dataIndex: "mobile",
    render: (value, row) => (
      <div>
        <div>{value || "—"}</div>
        <div className="text-muted small">{row.email || "NA"}</div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "interestLevel",
    label: "Interest",
    dataIndex: "interestLevel",
  },
  {
    key: "assignedTo",
    label: "Assigned",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "Unassigned",
  },
  {
    key: "nextFollowUpDate",
    label: "Next follow-up",
    dataIndex: "nextFollowUpDate",
    render: (value) => formatDate(value),
  },
];

/* -----------------------------------
      FILTERS
----------------------------------- */
const filters = [
  { key: "status", label: "Status", type: "select", options: INQUIRY_STATUSES },
  { key: "interestLevel", label: "Interest", type: "select", options: INQUIRY_INTEREST_LEVELS },
];

/* -----------------------------------
      MAIN COMPONENT
----------------------------------- */
const InquiryList = () => {
  const { can } = usePermission();

  const canView = can("inquiry:view");
  const canCreate = can("inquiry:create");
  const canUpdate = can("inquiry:update");
  const canDelete = can("inquiry:delete");

  return (
    <RequirePermission permission="inquiry:view">
      <CrudListPage
        title="Inquiries"
        columns={columns}
        fetcher={inquiryApi.getInquiries}
        dataKey="inquiries"

        /* Create button — only for users with permission */
        createPath={canCreate ? "/inquiries/new" : undefined}

        filters={filters}

        responseAdapter={(resp) => {
          const list = resp?.inquiries || [];

          return {
            items: list.map((item) => ({
              ...item,
              id: item.id || item._id, // ensure consistent ID
              deleteFn: canDelete ? inquiryApi.deleteInquiry : undefined,
            })),
            total: resp?.count || list.length || 0,
          };
        }}

        actions={(row) => (
          <div className="btn-group btn-group-sm">

            {/* VIEW */}
            {canView && (
              <Link
                to={`/inquiries/${row.id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* EDIT */}
            {canUpdate && (
              <Link
                to={`/inquiries/${row.id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* DELETE → handled automatically via deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default InquiryList;
