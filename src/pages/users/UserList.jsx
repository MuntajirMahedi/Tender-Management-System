// src/pages/users/UserList.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { userApi } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  {
    key: "email",
    label: "Email",
    dataIndex: "email"
  },
  {
    key: "mobile",
    label: "Mobile",
    dataIndex: "mobile"
  },
  {
    key: "role",
    label: "Role",
    dataIndex: "role",
    render: (value) => value?.toUpperCase()
  },
  {
    key: "isActive",
    label: "Status",
    dataIndex: "isActive",
    render: (value) => <StatusBadge status={value ? "Active" : "Inactive"} />
  }
];

const UserList = () => {
  const { can } = usePermission();

  const canView = can("user:view");
  const canCreate = can("user:create");
  const canUpdate = can("user:update");
  const canDelete = can("user:delete");

  // 🔍 Local search (inside this file)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Custom search UI to plug into CrudListPage
  const customSearchControl = (
    <>
      <label className="form-label text-muted small mb-1">Search</label>
      <input
        className="form-control"
        placeholder="Search by name, email, mobile or role"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  );

  return (
    <RequirePermission permission="user:view">
      <CrudListPage
        title="Users"
        columns={columns}
        fetcher={userApi.getUsers}
        dataKey="users"
        customSearchControl={customSearchControl}
        // ➕ Add button only if user:create
        createPath={canCreate ? "/users/new" : undefined}
        // ✅ Search + delete with toast handled here
        responseAdapter={(response, reload) => {
          const users = response.users || [];
          const term = debouncedSearch.trim().toLowerCase();

          const filteredUsers = term
            ? users.filter((u) => {
                const name = (u.name || "").toLowerCase();
                const email = (u.email || "").toLowerCase();
                const mobile = (u.mobile || "").toLowerCase();
                const role = (u.role || "").toLowerCase();

                return (
                  name.includes(term) ||
                  email.includes(term) ||
                  mobile.includes(term) ||
                  role.includes(term)
                );
              })
            : users;

          return {
            items: filteredUsers.map((item) => ({
              ...item,
              deleteFn: canDelete
                ? async () => {

                    try {
                      await userApi.deleteUser(item._id || item.id);
                      toast.success(`User "${item.name}" deleted successfully`);
                      // window.location.reload?.();
                    } catch (err) {
                      const msg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to delete user";
                      toast.error(msg);
                      throw err;
                    }
                  }
                : undefined
            })),
            total: filteredUsers.length
          };
        }}
        actions={(row) => (
          <div className="btn-group btn-group-sm">
            {canView && (
              <Link
                to={`/users/${row.id || row._id}`}
                className="btn btn-outline-secondary"
              >
                View
              </Link>
            )}

            {canUpdate && (
              <Link
                to={`/users/${row.id || row._id}/edit`}
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

export default UserList;
