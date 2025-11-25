import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { permissionApi } from "../../api";

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
    createPath="/permissions/new"
    responseAdapter={(response) => ({
      items: response.permissions || [],
      total: response.count || 0
    })}
    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link to={`/permissions/${row.id || row._id}/edit`} className="btn btn-outline-primary">
          Edit
        </Link>
      </div>
    )}
  />
);

export default PermissionList;

