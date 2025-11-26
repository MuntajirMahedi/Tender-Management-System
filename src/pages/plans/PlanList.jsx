import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import StatusBadge from "../../components/StatusBadge";
import { planApi } from "../../api";
import {
  PLAN_TYPES,
  PLAN_STATUSES,
  PAYMENT_STATUSES
} from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

const columns = [
  {
    key: "planName",
    label: "Plan",
    dataIndex: "planName",
    render: (value, row) => (
      <div>
        <div className="fw-semibold">{value}</div>
        <div className="text-muted small">{row.planCode}</div>
      </div>
    )
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "planType",
    label: "Type",
    dataIndex: "planType"
  },
  {
    key: "status",
    label: "Status",
    dataIndex: "status",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "paymentStatus",
    label: "Payment",
    dataIndex: "paymentStatus",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "netAmount",
    label: "Net Amount",
    dataIndex: "netAmount",
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
  }
];

const filters = [
  { key: "planType", label: "Plan Type", type: "select", options: PLAN_TYPES },
  { key: "status", label: "Status", type: "select", options: PLAN_STATUSES },
  {
    key: "paymentStatus",
    label: "Payment",
    type: "select",
    options: PAYMENT_STATUSES
  }
];

const PlanList = () => {
  const { can } = usePermission();

  const canView = can("plan:view");
  const canCreate = can("plan:create");
  const canUpdate = can("plan:update");
  const canDelete = can("plan:delete");

  return (
    <RequirePermission permission="plan:view">
      <CrudListPage
        title="Plans"
        columns={columns}
        filters={filters}
        fetcher={planApi.getPlans}
        dataKey="plans"

        // ➕ Create button controlled by permissions
        createPath={canCreate ? "/plans/new" : undefined}

        responseAdapter={(response) => {
          const plans = response.plans || [];
          return {
            items: plans.map((item) => ({
              ...item,
              deleteFn: canDelete ? planApi.deletePlan : undefined
            })),
            total: response.count || 0
          };
        }}

        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {/* 👁 View button (plan:view required) */}
            {canView && (
              <Link
                to={`/plans/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏ Edit button (plan:update required) */}
            {canUpdate && (
              <Link
                to={`/plans/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* 🗑 Delete handled by deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default PlanList;
