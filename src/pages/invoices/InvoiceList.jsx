import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { invoiceApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

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

const InvoiceList = () => {
  const { can } = usePermission();

  const canView = can("invoice:view");
  const canCreate = can("invoice:create");
  const canUpdate = can("invoice:update");
  const canDelete = can("invoice:delete");

  return (
    <RequirePermission permission="invoice:view">
      <CrudListPage
        title="Invoices"
        columns={columns}
        filters={filters}
        fetcher={invoiceApi.getInvoices}
        dataKey="invoices"

        // ➕ Create allowed only when invoice:create permission exists
        createPath={canCreate ? "/invoices/new" : undefined}

        responseAdapter={(response) => ({
          items: (response.invoices || []).map((item) => ({
            ...item,
            deleteFn: canDelete ? invoiceApi.deleteInvoice : undefined
          })),
          total: response.count || 0
        })}

        actions={(row) => (
          <div className="btn-group btn-group-sm">

            {/* 👁 View invoice only if invoice:view */}
            {canView && (
              <Link
                to={`/invoices/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {/* ✏ Edit invoice only if invoice:update */}
            {canUpdate && (
              <Link
                to={`/invoices/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* 🗑 Delete comes from deleteFn */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default InvoiceList;
