import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { paymentApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

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

const PaymentList = () => (
  <CrudListPage
    title="Payments"
    columns={columns}
    filters={filters}
    fetcher={paymentApi.getPayments}
    dataKey="payments"
    createPath="/payments/new"

    responseAdapter={(response) => ({
      items: (response.payments || []).map((item) => ({
        ...item,
        deleteFn: paymentApi.deletePayment   // ⭐ DELETE BUTTON ENABLED
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/payments/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>

        <Link
          to={`/payments/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>
      </div>
    )}
  />
);

export default PaymentList;
