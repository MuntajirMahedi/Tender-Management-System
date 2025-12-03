import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { roleApi } from "../../api";
import useDebounce from "../../hooks/useDebounce";
import PageHeader from "../../components/PageHeader";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "key", label: "Key", dataIndex: "key" },
  {
    key: "permissions",
    label: "Permissions",
    dataIndex: "permissions",
    render: (value) => (Array.isArray(value) ? value.length : 0),
  },
];

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // MULTI SELECT
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await roleApi.getRoles();

        const list =
          Array.isArray(res?.roles)
            ? res.roles
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setRoles(list);
      } catch (err) {
        toast.error("Unable to load roles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // FILTER + SEARCH
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return roles;

    return roles.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(term) ||
        (r.key || "").toLowerCase().includes(term)
    );
  }, [roles, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedRoles = filtered.slice(startIndex, endIndex);

  /* ---------------------------------------
        SINGLE DELETE
  --------------------------------------- */
  const confirmDelete = (id, name) => {
    setIsBulkDelete(false);
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  /* ---------------------------------------
        BULK DELETE OPEN
  --------------------------------------- */
  const openBulkDelete = () => {
    if (selected.length === 0) {
      toast.info("No roles selected");
      return;
    }

    setIsBulkDelete(true);
    setDeleteName(`${selected.length} roles`);
    setShowDeleteModal(true);
  };

  /* ---------------------------------------
        DELETE HANDLER
  --------------------------------------- */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isBulkDelete) {
        await Promise.all(selected.map((id) => roleApi.deleteRole(id)));

        setRoles((prev) =>
          prev.filter((r) => !selected.includes(r._id || r.id))
        );

        toast.success("Selected roles deleted");

        setSelected([]);
        setSelectAll(false);
      } else {
        await roleApi.deleteRole(deleteId);

        setRoles((prev) =>
          prev.filter((r) => (r._id || r.id) !== deleteId)
        );

        toast.success(`Role "${deleteName}" deleted`);
      }

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------------------------------------
        MULTI SELECT LOGIC
  --------------------------------------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const ids = paginatedRoles.map((r) => r._id || r.id);
      setSelected(ids);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <PageHeader
          title="Roles"
          subtitle="Manage system roles and their permissions"
        />

        <div className="d-flex gap-2">
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={openBulkDelete}>
              <i className="bi bi-trash me-1" />
              Delete Selected ({selected.length})
            </button>
          )}

          <Link to="/roles/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" />
            New Role
          </Link>
        </div>
      </div>

      {/* SEARCH */}
      <div className="card mb-3">
        <div className="card-body row g-3 align-items-end">
          <div className="col-sm-6 col-md-4">
            <label className="form-label text-muted small">Search</label>
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

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th width="50">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>

                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}

                <th width="200">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-3">
                    Loading...
                  </td>
                </tr>
              ) : paginatedRoles.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-3 text-muted">
                    No roles found.
                  </td>
                </tr>
              ) : (
                paginatedRoles.map((row) => {
                  const rowId = row._id || row.id;

                  return (
                    <tr key={rowId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(rowId)}
                          onChange={() => toggleSelect(rowId)}
                        />
                      </td>

                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render
                            ? col.render(row[col.dataIndex], row)
                            : row[col.dataIndex]}
                        </td>
                      ))}

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
                            className="btn btn-outline-danger"
                            onClick={() => confirmDelete(rowId, row.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50, 100].map((n) => (
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

              <span className="small">Page {currentPage} of {totalPages}</span>

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
                  />
                </div>

                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteName}</strong>?
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

          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default RoleList;
