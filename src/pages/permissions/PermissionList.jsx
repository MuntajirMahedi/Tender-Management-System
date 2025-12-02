// src/pages/permissions/PermissionList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { permissionApi } from "../../api";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";
import useDebounce from "../../hooks/useDebounce";

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

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ⭐ Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await permissionApi.getPermissions();

        const list =
          Array.isArray(res?.permissions)
            ? res.permissions
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setPermissions(list);
      } catch (err) {
        toast.error("Unable to load permissions");
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // search filter
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return permissions;

    return permissions.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const code = (p.code || "").toLowerCase();
      const module = (p.module || "").toLowerCase();
      return (
        name.includes(term) ||
        code.includes(term) ||
        module.includes(term)
      );
    });
  }, [permissions, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginated = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (e) => {
    const value = Number(e.target.value) || 10;
    setPageSize(value);
    setPage(1);
  };

  // ⭐ OPEN DELETE MODAL
  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  // ⭐ ACTUAL DELETE
  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      setIsDeleting(true);

      await permissionApi.deletePermission(deleteId);

      toast.success(`Permission "${deleteName}" deleted`);

      setPermissions((prev) =>
        prev.filter((p) => (p._id || p.id) !== deleteId)
      );

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete permission");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RequirePermission permission="permission:view">
      <div>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Permissions</h4>
            <small className="text-muted">
              Manage permission codes used throughout the system
            </small>
          </div>

          {canCreate && (
            <Link to="/permissions/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              New Permission
            </Link>
          )}
        </div>

        {/* SEARCH */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label text-muted small mb-1">Search</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search by name, code or module"
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
              <p className="p-3 mb-0">Loading...</p>
            ) : total === 0 ? (
              <p className="p-3 mb-0 text-muted">No permissions found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th style={{ width: "160px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((row) => {
                      const rowId = row._id || row.id;

                      return (
                        <tr key={rowId}>
                          {columns.map((col) => {
                            const value = row[col.dataIndex];
                            return (
                              <td key={col.key}>
                                {col.render ? col.render(value, row) : value}
                              </td>
                            );
                          })}

                          {/* ACTIONS */}
                          <td>
                            <div className="btn-group btn-group-sm">
                              {canUpdate && (
                                <Link
                                  to={`/permissions/${rowId}/edit`}
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
          {!loading && total > 0 && (
            <div className="card-footer d-flex justify-content-between align-items-center">

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show</span>

                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {[1, 5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
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
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>

                <span className="small">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>

            </div>
          )}
        </div>

        {/* DELETE MODAL — SAME AS PAYMENT LIST */}
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
                    Are you sure you want to delete permission{" "}
                    <strong>{deleteName}</strong>?
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

export default PermissionList;
