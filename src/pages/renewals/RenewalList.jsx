// src/pages/renewals/RenewalList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { renewalApi } from "../../api";
import { formatDate } from "../../utils/formatters";
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
    label: "Duration (months)",
    dataIndex: "durationMonths"
  }
];

const RenewalList = () => {
  const { can } = usePermission();

  const canView = can("renewal:view");
  const canCreate = can("renewal:create");
  const canUpdate = can("renewal:update");
  const canDelete = can("renewal:delete");

  // 🔍 Local search for this page
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search input to replace CrudListPage default search
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by client, plan or duration"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="renewal:view">
      <CrudListPage
        title="Renewals"
        columns={columns}
        fetcher={renewalApi.getRenewals}
        dataKey="renewals"
        customSearchControl={customSearchControl}
        // ➕ Create button only if user has renewal:create
        createPath={canCreate ? "/renewals/new" : undefined}
        // ✅ Search + delete with toast handled here
        responseAdapter={(response, reload) => {
          const renewals = response.renewals || [];

          const term = debouncedSearch.trim().toLowerCase();

          const filteredRenewals = term
            ? renewals.filter((r) => {
                const clientName = (r.client?.name || "").toLowerCase();
                const planName = (r.plan?.planName || "").toLowerCase();
                const durationStr = String(r.durationMonths || "").toLowerCase();

                return (
                  clientName.includes(term) ||
                  planName.includes(term) ||
                  durationStr.includes(term)
                );
              })
            : renewals;

          return {
            items: filteredRenewals.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {


                    try {
                      await renewalApi.deleteRenewal(item._id || item.id);
                      toast.success("Renewal deleted successfully");
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete renewal";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredRenewals.length
          };
        }}
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

            {/* ✏ EDIT only if renewal:update */}
            {canUpdate && (
              <Link
                to={`/renewals/${row.id || row._id}/edit`}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            )}

            {/* 🗑 Delete handled via deleteFn + toast */}
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default RenewalList;
