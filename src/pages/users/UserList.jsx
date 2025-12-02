// src/pages/users/UserList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { userApi } from "../../api";
import StatusBadge from "../../components/StatusBadge";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // 1, 5, 10, 20, 50, 100

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUsers();

        const list =
          Array.isArray(res?.users) ? res.users :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setUsers(list);
      } catch (err) {
        console.error("Unable to load users", err);
        toast.error("Unable to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // filtered + searched users
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) => {
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
    });
  }, [users, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleDelete = async (id, name) => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${name}"?`
    );
    if (!confirmed) return;

    try {
      await userApi.deleteUser(id);
      toast.success(`User "${name}" deleted successfully`);

      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete user";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="user:view">
      <div>
        {/* HEADER ROW */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Users</h4>
            <small className="text-muted">
              Manage all users and their access
            </small>
          </div>

          {canCreate && (
            <Link to="/users/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New User
            </Link>
          )}
        </div>

        {/* SEARCH ROW */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label text-muted small mb-1">
                Search
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by name, email, mobile or role"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th style={{ width: "200px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((row) => {
                      const rowId = row._id || row.id;
                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const rawValue = row[col.dataIndex];

                            return (
                              <td key={col.key}>
                                {col.render
                                  ? col.render(rawValue, row)
                                  : rawValue}
                              </td>
                            );
                          })}

                          {/* Actions */}
                          <td>
                            <div className="btn-group btn-group-sm">
                              {canView && (
                                <Link
                                  to={`/users/${rowId}`}
                                  className="btn btn-outline-secondary"
                                >
                                  View
                                </Link>
                              )}

                              {canUpdate && (
                                <Link
                                  to={`/users/${rowId}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(rowId, row.name)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          {!loading && total > 0 && (
            <div className="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
              {/* left: page size + info */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-muted small">entries</span>

                <span className="text-muted small ms-3">
                  Showing{" "}
                  {total === 0
                    ? "0"
                    : `${startIndex + 1}–${endIndex}`}{" "}
                  of {total} entries
                </span>
              </div>

              {/* right: pagination buttons */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handlePrev}
                  disabled={currentPage <= 1}
                >
                  Prev
                </button>
                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
};

export default UserList;
