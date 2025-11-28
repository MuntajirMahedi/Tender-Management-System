// src/pages/roles/RoleList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { roleApi } from "../../api";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "key", label: "Key", dataIndex: "key" },
  {
    key: "permissions",
    label: "Permissions",
    dataIndex: "permissions",
    render: (value) => value?.length || 0
  }
];

const RoleList = () => {
  // 🔍 Local search state (only for this page)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search input (same pattern as other pages)
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by role name or key"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <CrudListPage
      title="Roles"
      columns={columns}
      fetcher={roleApi.getRoles}
      dataKey="roles"
      createPath="/roles/new"
      customSearchControl={customSearchControl}
      // ✅ Search + delete handled here in this file
      responseAdapter={(response, reload) => {
        const roles = response.roles || [];
        const term = debouncedSearch.trim().toLowerCase();

        // 🔍 Client-side filter by name / key
        const filteredRoles = term
          ? roles.filter((r) => {
              const name = (r.name || "").toLowerCase();
              const key = (r.key || "").toLowerCase();
              return name.includes(term) || key.includes(term);
            })
          : roles;

        return {
          items: filteredRoles.map((item) => ({
            ...item,
            deleteFn: async () => {


              try {
                await roleApi.deleteRole(item._id || item.id);
                toast.success(`Role "${item.name}" deleted successfully`);
              } catch (err) {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Failed to delete role";
                toast.error(msg);
                throw err;
              }
            }
          })),
          total: filteredRoles.length
        };
      }}
      actions={(row) => (
        <div className="btn-group btn-group-sm">
          <Link
            to={`/roles/${row.id || row._id}`}
            className="btn btn-outline-secondary"
          >
            View
          </Link>
          <Link
            to={`/roles/${row.id || row._id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
          {/* 🗑 Delete handled via deleteFn + toast */}
        </div>
      )}
    />
  );
};

export default RoleList;
