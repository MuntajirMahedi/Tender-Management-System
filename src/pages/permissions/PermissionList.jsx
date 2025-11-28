// src/pages/permissions/PermissionList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { permissionApi } from "../../api";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";
import { toast } from "react-toastify";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "code", label: "Code", dataIndex: "code" },
  { key: "module", label: "Module", dataIndex: "module" }
];

const PermissionList = () => {
  const { can } = usePermission();

  const canCreate = can("permission:create") || can("permission:manage");
  const canUpdate = can("permission:update") || can("permission:manage");
  const canDelete = can("permission:delete") || can("permission:manage");

  // 🔍 Local search state (only for this page)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search input to replace CrudListPage default search
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by name, code or module"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="permission:view">
      <CrudListPage
        title="Permissions"
        columns={columns}
        fetcher={permissionApi.getPermissions}
        dataKey="permissions"
        customSearchControl={customSearchControl}
        // Create button controlled by permission
        createPath={canCreate ? "/permissions/new" : undefined}
        // ✅ Search + delete handled here
        responseAdapter={(response, reload) => {
          const permissions = response?.permissions || [];
          const term = debouncedSearch.trim().toLowerCase();

          // 🔍 Client-side filter by name / code / module
          const filtered = term
            ? permissions.filter((p) => {
                const name = (p.name || "").toLowerCase();
                const code = (p.code || "").toLowerCase();
                const module = (p.module || "").toLowerCase();
                return (
                  name.includes(term) ||
                  code.includes(term) ||
                  module.includes(term)
                );
              })
            : permissions;

          return {
            items: filtered.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {
            

                    try {
                      await permissionApi.deletePermission(item._id || item.id);
                      toast.success(
                        `Permission "${item.name}" deleted successfully`
                      );
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete permission";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filtered.length
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {/* EDIT only if allowed */}
            {canUpdate && (
              <Link
                to={`/permissions/${row.id || row._id}/edit`}
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

export default PermissionList;
