import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { permissionApi } from "../../api";
import Can from "../../components/Can";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "code", label: "Code", dataIndex: "code" },
  { key: "module", label: "Module", dataIndex: "module" }
];

const PermissionList = () => (
  <CrudListPage
    title="Permissions"
    columns={columns}
    fetcher={permissionApi.getPermissions}
    dataKey="permissions"

    /* hide default create button and use a permission-wrapped custom button */
    createPath={null}
    renderCreateButton={() => (
      <Can permission="permissions.create">
        <Link to="/permissions/new" className="btn btn-primary">
          New Permission
        </Link>
      </Can>
    )}

    responseAdapter={(response) => ({
      items: response?.permissions || [],
      total: response?.count || 0
    })}

    /* Edit button with permission check */
    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Can permission="permissions.edit">
          <Link
            to={`/permissions/${row.id || row._id}/edit`}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        </Can>
      </div>
    )}
  />
);

export default PermissionList;
