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

  // 🔍 local search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // 📄 pagination: 1, 5, 10, 20, 50, 100
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await permissionApi.getPermissions();

        const list =
          Array.isArray(res?.permissions) ? res.permissions :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setPermissions(list);
      } catch (err) {
        console.error("Unable to load permissions", err);
        toast.error("Unable to load permissions");
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔍 client-side search by name / code / module
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
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedPermissions = filtered.slice(startIndex, endIndex);

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
      `Are you sure you want to delete permission "${name}"?`
    );
    if (!confirmed) return;

    try {
      await permissionApi.deletePermission(id);
      toast.success(`Permission "${name}" deleted successfully`);

      setPermissions((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error("Failed to delete permission", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete permission";
      toast.error(msg);
    }
  };

  return (
    <RequirePermission permission="permission:view">
      <div>
        {/* HEADER ROW */}
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

        {/* SEARCH ROW */}
        <div className="card mb-3">
          <div className="card-body row g-3 align-items-end">
            <div className="col-sm-6 col-md-4">
              <label className="form-label text-muted small mb-1">
                Search
              </label>
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

        {/* TABLE CARD */}
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
                    {paginatedPermissions.map((row) => {
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

export default PermissionList;
