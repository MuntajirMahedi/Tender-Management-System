import { useEffect, useState } from "react";
import { authApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.getProfile().then(({ user }) => setUser(user));
  }, []);

  if (!user) return <p>Loading...</p>;

  const info = [
    { label: "Full Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Mobile", value: user.mobile },
    { label: "Role", value: user.role },
    { label: "Status", value: user.isActive ? "Active" : "Inactive", isStatus: true },
    { label: "Username", value: user.username },
    { label: "Address", value: user.address },
    { label: "Last Login", value: user.lastLogin },
    { label: "Created At", value: new Date(user.createdAt).toLocaleString() },
    { label: "Updated At", value: new Date(user.updatedAt).toLocaleString() },
    {
      label: "Permissions",
      value: Array.isArray(user.permissions)
        ? user.permissions.join(", ")
        : "",
    },
  ];

  return (
    <div>

      {/* HEADER */}
      <PageHeader
        title="My Profile"
        actions={[
          <button
            key="back"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left" /> Back
          </button>
        ]}
      />

      {/* CARD */}
      <div className="table-card p-4">

        {/* TOP SECTION WITH AVATAR */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#e9ecef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: "bold",
              color: "#6c757d",
              textTransform: "uppercase",
            }}
          >
            {user.name?.charAt(0)}
          </div>

          <div>
            <h4 className="mb-0">{user.name}</h4>
            <div className="text-muted">{user.email}</div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="row">
          {info.map(
            (item, idx) =>
              item.value && (
                <div className="col-md-6 mb-3" key={idx}>
                  <div className="text-muted small">{item.label}</div>
                  <div className="fw-semibold">
                    {item.isStatus ? (
                      <StatusBadge status={item.value} />
                    ) : (
                      item.value
                    )}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
