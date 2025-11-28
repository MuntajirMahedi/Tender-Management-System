// src/pages/payments/PaymentList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { paymentApi } from "../../api";
import { PAYMENT_MODES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

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

  // 🔍 Local search (frontend)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Our search box – used in CrudListPage instead of default one
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by client, plan, mode or amount"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="payment:view">
      <CrudListPage
        title="Payments"
        columns={columns}
        filters={filters}
        fetcher={paymentApi.getPayments}
        dataKey="payments"
        customSearchControl={customSearchControl}
        // ➕ Create button only if payment:create
        createPath={canCreate ? "/payments/new" : undefined}
        // ✅ Frontend search + delete toast
        responseAdapter={(response, reload) => {
          const payments = response.payments || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredPayments = term
            ? payments.filter((p) => {
                const clientName = (p.client?.name || "").toLowerCase();
                const planName = (p.plan?.planName || "").toLowerCase();
                const paymentMode = (p.paymentMode || "").toLowerCase();
                const amountStr = String(p.amount || "").toLowerCase();

                return (
                  clientName.includes(term) ||
                  planName.includes(term) ||
                  paymentMode.includes(term) ||
                  amountStr.includes(term)
                );
              })
            : payments;

          return {
            items: filteredPayments.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {


                    try {
                      await paymentApi.deletePayment(item._id || item.id);
                      toast.success("Payment deleted successfully");
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete payment";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredPayments.length
          };
        }}
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
            {/* 🗑 Delete handled via deleteFn + permission + toast */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default PaymentList;
