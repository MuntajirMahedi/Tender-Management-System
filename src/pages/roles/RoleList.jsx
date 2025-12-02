// src/pages/roles/RoleList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { roleApi } from "../../api";
import useDebounce from "../../hooks/useDebounce";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "key", label: "Key", dataIndex: "key" },
  {
    key: "permissions",
    label: "Permissions",
    dataIndex: "permissions",
    render: (value) => (Array.isArray(value) ? value.length : 0)
  }
];

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // 📄 pagination: 1, 5, 10, 20, 50, 100
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await roleApi.getRoles();

        const list =
          Array.isArray(res?.roles) ? res.roles :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res) ? res : [];

        setRoles(list);
      } catch (err) {
        console.error("Unable to load roles", err);
        toast.error("Unable to load roles");
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔍 client-side search by name/key
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return roles;

    return roles.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const key = (r.key || "").toLowerCase();
      return name.includes(term) || key.includes(term);
    });
  }, [roles, debouncedSearch]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = total === 0 ? 1 : Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedRoles = filtered.slice(startIndex, endIndex);

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
    const confirmed = window.confirm(
      `Are you sure you want to delete role "${name}"?`
    );
    if (!confirmed) return;

    try {
      await roleApi.deleteRole(id);
      toast.success(`Role "${name}" deleted successfully`);

      setRoles((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      console.error("Failed to delete role", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete role";
      toast.error(msg);
    }
  };

  return (
    <div>
      {/* HEADER ROW */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Roles</h4>
          <small className="text-muted">
            Manage system roles and their permissions
          </small>
        </div>

        <Link to="/roles/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2" />
          New Role
        </Link>
      </div>

      {/* SEARCH ROW */}
      <div className="card mb-3">
        <div className="card-body row g-3 align-items-end">
          <div className="col-sm-6 col-md-4">
            <label className="form-label text-muted small mb-1">Search</label>
            <input
              className="form-control form-control-sm"
              placeholder="Search by role name or key"
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
            <p className="p-3 mb-0 text-muted">No roles found.</p>
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
                  {paginatedRoles.map((row) => {
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
                            <Link
                              to={`/roles/${rowId}`}
                              className="btn btn-outline-secondary"
                            >
                              View
                            </Link>
                            <Link
                              to={`/roles/${rowId}/edit`}
                              className="btn btn-outline-primary"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(rowId, row.name)}
                            >
                              Delete
                            </button>
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
                {total === 0 ? "0" : `${startIndex + 1}–${endIndex}`} of{" "}
                {total} entries
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
  );
};

export default RoleList;
