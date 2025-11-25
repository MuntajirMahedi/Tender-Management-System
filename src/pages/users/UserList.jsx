import { Link } from "react-router-dom";
import CrudListPage from "../common/CrudListPage";
import { userApi } from "../../api";
import StatusBadge from "../../components/StatusBadge";

const columns = [
  { key: "name", label: "Name", dataIndex: "name" },
  {
    key: "email",
    label: "Email",
    dataIndex: "email"
  },
  {
    key: "mobile",
    label: "Mobile",
    dataIndex: "mobile"
  },
  {
    key: "role",
    label: "Role",
    dataIndex: "role",
    render: (value) => value?.toUpperCase()
  },
  {
    key: "isActive",
    label: "Status",
    dataIndex: "isActive",
    render: (value) => <StatusBadge status={value ? "Active" : "Inactive"} />
  }
];

const UserList = () => (
  <CrudListPage
    title="Users"
    columns={columns}
    fetcher={userApi.getUsers}
    dataKey="users"
    createPath="/users/new"

    // ⭐ ENABLE DELETE SUPPORT FOR USERS
    responseAdapter={(response) => ({
      items: (response.users || []).map((item) => ({
        ...item,
        deleteFn: userApi.deleteUser   // ⭐ KEY LINE FOR DELETE BUTTON
      })),
      total: response.count || 0
    })}

    actions={(row) => (
      <div className="btn-group btn-group-sm">
        <Link
          to={`/users/${row.id || row._id}`}
          className="btn btn-outline-secondary"
        >
          View
        </Link>
        <Link
          to={`/users/${row.id || row._id}/edit`}
          className="btn btn-outline-primary"
        >
          Edit
        </Link>

        {/* DELETE BUTTON is auto-rendered by DataTable */}
      </div>
    )}
  />
);

export default UserList;
