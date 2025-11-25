import { useState } from "react";
import clsx from "clsx";
import Pagination from "./Pagination";
import LoadingScreen from "./LoadingScreen";
import DeleteConfirmModal from "./DeleteConfirmModal";
import toast from "../utils/toast";

const DataTable = ({
  columns,
  data = [],
  loading,
  emptyMessage = "No records found",
  actions,
  pagination
}) => {
  const [deleteId, setDeleteId] = useState(null);
  const [deleteFn, setDeleteFn] = useState(null);

  const handleConfirmDelete = async () => {
    try {
      await deleteFn(deleteId);
      toast.success("Deleted successfully");
      setDeleteId(null);

      // 🔥 TRIGGER LIST RELOAD
      window.dispatchEvent(new Event("reloadList"));

    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx({ "text-end": col.align === "right" })}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="text-end">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <LoadingScreen label="Loading data..." />
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  className="text-center text-muted py-4"
                  colSpan={columns.length + (actions ? 1 : 0)}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row) => {
                const actionButtons = actions ? actions(row) : null;

                return (
                  <tr key={row.id || row._id}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx({
                          "text-end": col.align === "right"
                        })}
                      >
                        {col.render
                          ? col.render(row[col.dataIndex], row)
                          : row[col.dataIndex]}
                      </td>
                    ))}

                    {actions && (
                      <td className="text-end">
                        {actionButtons}

                        {/* DELETE BUTTON */}
                        {row.deleteFn && (
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => {
                              setDeleteFn(() => row.deleteFn);
                              setDeleteId(row.id || row._id);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}

      <DeleteConfirmModal
        open={!!deleteId}
        title="Are you sure you want to delete?"
        message="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DataTable;
