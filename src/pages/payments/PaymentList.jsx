import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { paymentApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

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
    key: "planType",
    label: "Plan Type",
    dataIndex: "plan",
    render: (value) => value?.planType || "—"
  },
  {
    key: "amount",
    label: "Amount",
    dataIndex: "amount",
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
  },
  {
    key: "paymentMode",
    label: "Mode",
    dataIndex: "paymentMode"
  },
  {
    key: "paymentDate",
    label: "Date",
    dataIndex: "paymentDate",
    render: (value) => formatDate(value)
  }
];

const filters = [
  { key: "paymentMode", label: "Mode", type: "select", options: PAYMENT_MODES }
];

const PaymentList = () => {
  const { can } = usePermission();

  const canView = can("payment:view");
  const canCreate = can("payment:create");
  const canUpdate = can("payment:update");
  const canDelete = can("payment:delete");

  return (
    <RequirePermission permission="payment:view">
      <CrudListPage
        title="Payments"
        columns={columns}
        filters={filters}
        fetcher={paymentApi.getPayments}
        dataKey="payments"

        // ➕ Create button only if payment:create
        createPath={canCreate ? "/payments/new" : undefined}

        responseAdapter={(response) => ({
          items: (response.payments || []).map((item) => ({
            ...item,
            deleteFn: canDelete ? paymentApi.deletePayment : undefined
          })),
          total: response.count || 0
        })}

        actions={(row) => (
          <div className="btn-group btn-group-sm">

            {/* 👁 View only if payment:view */}
            {canView && (
              <Link
                to={`/payments/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏ Edit only if payment:update */}
            {canUpdate && (
              <Link
                to={`/payments/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* Delete auto handled in deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default PaymentList;
