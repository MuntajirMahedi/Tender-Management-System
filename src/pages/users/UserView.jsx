import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Can from "../../components/Can";

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    userApi.getUser(id).then(({ user }) => setUser(user));
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`User • ${user.name}`}
        actions={[
          <Can permission="users.edit" key="edit">
            <Link to={`/users/${id}/edit`} className="btn btn-outline-primary">
              Edit
            </Link>
          </Can>
        ]}
      />
      <div className="table-card">
        <div className="row">
          <div className="col-6">
            <div className="text-muted small">Email</div>
            <div className="fw-semibold">{user.email}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Mobile</div>
            <div className="fw-semibold">{user.mobile}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Role</div>
            <div className="fw-semibold text-capitalize">{user.role}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Status</div>
            <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
