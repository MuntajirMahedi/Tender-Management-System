// src/pages/plans/PlanList.jsx
import { useState } from "react";
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
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

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

  // 🔍 Local search (for this page only, frontend filtering)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Our custom search input (replaces default in CrudListPage)
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by plan name, code or client"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="plan:view">
      <CrudListPage
        title="Plans"
        columns={columns}
        filters={filters}
        fetcher={planApi.getPlans}
        dataKey="plans"
        customSearchControl={customSearchControl}
        // ❌ No transformParams – we don't touch API params for search
        // ✅ We filter the data on the frontend using debouncedSearch
        responseAdapter={(response, reload) => {
          const plans = response.plans || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredPlans = term
            ? plans.filter((p) => {
                const name = (p.planName || "").toLowerCase();
                const code = (p.planCode || "").toLowerCase();
                const clientName = (p.client?.name || "").toLowerCase();

                return (
                  name.includes(term) ||
                  code.includes(term) ||
                  clientName.includes(term)
                );
              })
            : plans;

          return {
            items: filteredPlans.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {


                    try {
                      await planApi.deletePlan(item._id || item.id);
                      toast.success(
                        `Plan "${item.planName}" deleted successfully`
                      );
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete plan";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredPlans.length
          };
        }}
        // ➕ Create button controlled by permissions
        createPath={canCreate ? "/plans/new" : undefined}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {canView && (
              <Link
                to={`/plans/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {canUpdate && (
              <Link
                to={`/plans/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}
            {/* 🗑 Delete handled via deleteFn + permission */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default PlanList;
