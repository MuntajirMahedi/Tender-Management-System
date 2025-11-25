import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { userApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";

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
          <Link key="edit" to={`/users/${id}/edit`} className="btn btn-outline-primary">
            Edit
          </Link>
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

