import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { renewalApi } from "../../api";
import { formatDate } from "../../utils/formatters";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

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

const RenewalList = () => {
  const { can } = usePermission();

  const canView = can("renewal:view");
  const canCreate = can("renewal:create");
  const canDelete = can("renewal:delete");

  return (
    <RequirePermission permission="renewal:view">
      <CrudListPage
        title="Renewals"
        columns={columns}
        fetcher={renewalApi.getRenewals}
        dataKey="renewals"

        // ➕ Create button only if user has renewal:create
        createPath={canCreate ? "/renewals/new" : undefined}

        responseAdapter={(response) => ({
          items: (response.renewals || []).map((item) => ({
            ...item,
            deleteFn: canDelete ? renewalApi.deleteRenewal : undefined
          })),
          total: response.count || 0
        })}

        actions={(row) => (
          <div className="btn-group btn-group-sm">

            {/* 👁 VIEW only if allowed */}
            {canView && (
              <Link
                to={`/renewals/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* Delete handled by deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default RenewalList;
