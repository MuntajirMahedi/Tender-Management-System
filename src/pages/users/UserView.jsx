import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { userApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Can from "../../components/Can";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

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
        subtitle={user.email}
        actions={[
          <Can permission="users.edit" key="edit">
            <Link to={`/users/${id}/edit`} className="btn btn-outline-primary">
              <i className="bi bi-pencil-square me-2" /> Edit
            </Link>
          </Can>
        ]}
      />

      <div className="row g-4">
        {/* LEFT PROFILE CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Profile</h6>

            <InfoItem label="Full Name" value={user.name} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Mobile" value={user.mobile} />
          </div>
        </div>

        {/* RIGHT ACCOUNT CARD */}
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Account Details</h6>

            <InfoItem
              label="Role"
              value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"}
            />

            <div className="mb-3">
              <div className="text-muted small">Status</div>
              <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
            </div>

            <InfoItem
              label="Created At"
              value={new Date(user.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
