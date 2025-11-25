import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { roleApi } from "../../api";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  { key: "key", label: "Key", dataIndex: "key" },
  {
    key: "permissions",
    label: "Permissions",
    dataIndex: "permissions",
    render: (value) => value?.length || 0
  }
];

const RoleList = () => (
  <CrudListPage
    title="Roles"
    columns={columns}
    fetcher={roleApi.getRoles}
    dataKey="roles"
    createPath="/roles/new"

    // ⭐ Delete support added here
    responseAdapter={(response) => ({
      items: (response.roles || []).map((item) => ({
        ...item,
        deleteFn: roleApi.deleteRole   // ⭐ KEY LINE
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/roles/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>
        <Link
          to={`/roles/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>
        {/* Delete button is auto-rendered by DataTable */}
      </div>
    )}
  />
);

export default RoleList;
