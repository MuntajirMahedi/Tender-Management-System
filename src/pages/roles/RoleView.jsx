import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { roleApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import Can from "../../components/Can";

const InfoItem = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

const RoleView = () => {
  const { id } = useParams();
  const [role, setRole] = useState(null);

  useEffect(() => {
    roleApi.getRole(id).then(({ role }) => setRole(role));
  }, [id]);

  if (!role) return <p>Loading...</p>;

  return (
    <div>
      <PageHeader
        title={`Role • ${role.name}`}
        subtitle={role.description || "Role configuration overview"}
        actions={[
          <Can permission="roles.edit" key="edit">
            <Link to={`/roles/${id}/edit`} className="btn btn-outline-primary">
              <i className="bi bi-pencil-square me-2" /> Edit
            </Link>
          </Can>
        ]}
      />

      <div className="row g-4">
        {/* LEFT ROLE INFORMATION */}
        <div className="col-lg-5">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Role Information</h6>

            <InfoItem label="Role Name" value={role.name} />
            <InfoItem label="Key" value={role.key} />
            <InfoItem label="Description" value={role.description} />

            <InfoItem
              label="Created At"
              value={new Date(role.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Updated At"
              value={new Date(role.updatedAt).toLocaleString()}
            />
          </div>
        </div>

        {/* RIGHT PERMISSION LIST */}
        <div className="col-lg-7">
          <div className="card p-3 shadow-sm h-100">
            <h6 className="text-primary mb-3">Assigned Permissions</h6>

            {!role.permissions?.length ? (
              <p className="text-muted">No permissions assigned.</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {role.permissions.map((perm) => (
                  <span
                    key={perm._id}
                    className="badge text-bg-primary px-3 py-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {perm.code}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleView;
