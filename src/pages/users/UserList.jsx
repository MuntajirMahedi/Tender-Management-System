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
  { key: "email", label: "Email", dataIndex: "email" },
  { key: "mobile", label: "Mobile", dataIndex: "mobile" },
  {
    key: "role",
    label: "Role",
    dataIndex: "role",
    render: (value) => value?.toUpperCase(),
  },
  {
    key: "isActive",
    label: "Status",
    dataIndex: "isActive",
    render: (value) => <StatusBadge status={value ? "Active" : "Inactive"} />,
  },
];

const UserList = () => {
  const { can } = usePermission();
  const canView = can("user:view");
  const canCreate = can("user:create");
  const canUpdate = can("user:update");
  const canDelete = can("user:delete");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load users
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUsers();

        const list =
          Array.isArray(res?.users)
            ? res.users
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setUsers(list);
      } catch (err) {
        toast.error("Unable to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter + Search
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) => {
      return (
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.mobile || "").toLowerCase().includes(term) ||
        (u.role || "").toLowerCase().includes(term)
      );
    });
  }, [users, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

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

  // 🔥 NEW — Delete Modal Triggers
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  // 🔥 NEW — Actual delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await userApi.deleteUser(deleteId);

      toast.success(`User "${deleteName}" deleted`);

      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== deleteId));

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="user:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Users</h4>
            <small className="text-muted">Manage all users and their access</small>
          </div>

          {canCreate && (
            <Link to="/users/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New User
            </Link>
          )}
        </div>

        {/* SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label small text-muted">Search</label>
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

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-muted">No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th width="200">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const raw = row[col.dataIndex];
                            return (
                              <td key={col.key}>
                                {col.render ? col.render(raw, row) : raw}
                              </td>
                            );
                          })}

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
                                  className="btn btn-outline-danger"
                                  onClick={() => confirmDelete(rowId, row.name)}
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

          {/* PAGINATION */}
          {!loading && filtered.length > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="text-muted small">
                  Showing {startIndex + 1}–{endIndex} of {total}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={handlePrev}
                >
                  Prev
                </button>

                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>

            </div>
          )}
        </div>

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      className="btn-close"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    Are you sure you want to delete user  
                    <strong> {deleteName} </strong>?
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-danger"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </RequirePermission>
  );
};

export default UserList;
