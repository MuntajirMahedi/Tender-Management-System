import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { inquiryApi } from "../../api";
import {
  INQUIRY_STATUSES,
  INQUIRY_INTEREST_LEVELS
} from "../../utils/constants";
import { formatDate } from "../../utils/formatters";

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
    )
  },
  {
    key: "contact",
    label: "Contact",
    dataIndex: "mobile",
    render: (value, row) => (
      <div>
        <div>{value}</div>
        <div className="text-muted small">{row.email || "NA"}</div>
      </div>
    )
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "interestLevel",
    label: "Interest",
    dataIndex: "interestLevel"
  },
  {
    key: "assignedTo",
    label: "Assigned",
    dataIndex: "assignedTo",
    render: (value) => value?.name || "Unassigned"
  },
  {
    key: "nextFollowUpDate",
    label: "Next follow-up",
    dataIndex: "nextFollowUpDate",
    render: (value) => formatDate(value)
  }
];

const filters = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: INQUIRY_STATUSES
  },
  {
    key: "interestLevel",
    label: "Interest",
    type: "select",
    options: INQUIRY_INTEREST_LEVELS
  }
];

const InquiryList = () => (
  <CrudListPage
    title="Inquiries"
    columns={columns}
    fetcher={inquiryApi.getInquiries}
    dataKey="inquiries"
    createPath="/inquiries/new"
    filters={filters}
    
    // ⭐ ADD THIS PART
    responseAdapter={(response) => ({
      items: (response.inquiries || []).map((item) => ({
        ...item,
        deleteFn: inquiryApi.deleteInquiry
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link to={`/inquiries/${row.id || row._id}`} className="btn btn-outline-secondary">
          View
        </Link>
        <Link to={`/inquiries/${row.id || row._id}/edit`} className="btn btn-outline-primary">
          Edit
        </Link>
      </div>
    )}
  />
);

export default InquiryList;
