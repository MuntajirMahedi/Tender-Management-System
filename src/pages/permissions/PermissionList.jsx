import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { permissionApi } from "../../api";
import usePermission from "../../hooks/usePermission";
import RequirePermission from "../../components/RequirePermission";

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

  return (
    <RequirePermission permission="permission:view">
      <CrudListPage
        title="Permissions"
        columns={columns}
        fetcher={permissionApi.getPermissions}
        dataKey="permissions"

        // Create button controlled by permission
        createPath={canCreate ? "/permissions/new" : undefined}

        responseAdapter={(response) => ({
          items: (response?.permissions || []).map((item) => ({
            ...item,
            deleteFn: canDelete ? permissionApi.deletePermission : undefined
          })),
          total: response?.count || 0
        })}

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
          </div>
        )}
      />
    </RequirePermission>
  );
};

export default PermissionList;
