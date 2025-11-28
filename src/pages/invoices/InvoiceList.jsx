// src/pages/invoices/InvoiceList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { invoiceApi } from "../../api";
import { PAYMENT_STATUSES } from "../../utils/constants";
import StatusBadge from "../../components/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

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

  // 🔍 Local search (frontend)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search input to replace CrudListPage's default one
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by invoice, client or status"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="invoice:view">
      <CrudListPage
        title="Invoices"
        columns={columns}
        filters={filters}
        fetcher={invoiceApi.getInvoices}
        dataKey="invoices"
        customSearchControl={customSearchControl}
        // ➕ Create allowed only when invoice:create permission exists
        createPath={canCreate ? "/invoices/new" : undefined}
        // ✅ Search + delete handled here
        responseAdapter={(response, reload) => {
          const invoices = response.invoices || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredInvoices = term
            ? invoices.filter((inv) => {
                const invNo = (inv.invoiceNumber || "").toLowerCase();
                const clientName = (inv.client?.name || "").toLowerCase();
                const status = (inv.paymentStatus || "").toLowerCase();
                const amountStr = String(inv.totalAmount || "").toLowerCase();

                return (
                  invNo.includes(term) ||
                  clientName.includes(term) ||
                  status.includes(term) ||
                  amountStr.includes(term)
                );
              })
            : invoices;

          return {
            items: filteredInvoices.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {


                    try {
                      await invoiceApi.deleteInvoice(item._id || item.id);
                      toast.success(
                        `Invoice "${item.invoiceNumber}" deleted successfully`
                      );
                      reload?.(); // refresh list if CrudListPage passes reload
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete invoice";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredInvoices.length
          };
        }}
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
            {/* 🗑 Delete handled by deleteFn with toast */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default InvoiceList;
