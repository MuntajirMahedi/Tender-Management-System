import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { renewalApi } from "../../api";
import { formatDate } from "../../utils/formatters";

const columns = [
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "plan",
    label: "Plan",
    dataIndex: "plan",
    render: (value) => value?.planName || "—"
  },
  {
    key: "newStartDate",
    label: "New Start",
    dataIndex: "newStartDate",
    render: (value) => formatDate(value)
  },
  {
    key: "newExpiryDate",
    label: "New Expiry",
    dataIndex: "newExpiryDate",
    render: (value) => formatDate(value)
  },
  {
    key: "durationMonths",
    label: "Duration",
    dataIndex: "durationMonths"
  }
];

const RenewalList = () => (
  <CrudListPage
    title="Renewals"
    columns={columns}
    fetcher={renewalApi.getRenewals}
    dataKey="renewals"
    createPath="/renewals/new"

    // ⭐ Add deleteFn to each row
    responseAdapter={(response) => ({
      items: (response.renewals || []).map((item) => ({
        ...item,
        deleteFn: renewalApi.deleteRenewal   // ⭐ DELETE ENABLED
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/renewals/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>
        {/* Delete button auto-added by DataTable */}
      </div>
    )}
  />
);

export default RenewalList;
