import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { invoiceApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const columns = [
  {
    key: "invoiceNumber",
    label: "Invoice",
    dataIndex: "invoiceNumber"
  },
  {
    key: "client",
    label: "Client",
    dataIndex: "client",
    render: (value) => value?.name || "—"
  },
  {
    key: "totalAmount",
    label: "Total",
    dataIndex: "totalAmount",
    align: "right",
    render: (value) => formatCurrency(value || 0, "INR")
  },
  {
    key: "paymentStatus",
    label: "Payment",
    dataIndex: "paymentStatus",
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    dataIndex: "invoiceDate",
    render: (value) => formatDate(value)
  }
];

const filters = [
  {
    key: "paymentStatus",
    label: "Payment Status",
    type: "select",
    options: PAYMENT_STATUSES
  }
];

const InvoiceList = () => (
  <CrudListPage
    title="Invoices"
    columns={columns}
    filters={filters}
    fetcher={invoiceApi.getInvoices}
    dataKey="invoices"
    createPath="/invoices/new"
    
    responseAdapter={(response) => ({
      items: (response.invoices || []).map((item) => ({
        ...item,
        deleteFn: invoiceApi.deleteInvoice   // ⭐ DELETE ENABLED
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/invoices/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>

        <Link
          to={`/invoices/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>

        {/* ⚡ Delete button automatically handled by DataTable */}
      </div>
    )}
  />
);

export default InvoiceList;
