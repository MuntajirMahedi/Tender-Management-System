import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { roleApi } from "../../api";
import PageHeader from "../../components/PageHeader";
import Can from "../../components/Can";

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
        actions={[
          <Can permission="roles.edit" key="edit">
            <Link to={`/roles/${id}/edit`} className="btn btn-outline-primary">
              Edit
            </Link>
          </Can>
        ]}
      />
      <div className="table-card">
        <p className="text-muted mb-1">Key</p>
        <p className="fw-semibold">{role.key}</p>
        <p className="text-muted mb-1">Description</p>
        <p>{role.description || "—"}</p>
        <hr />
        <h6>Permissions</h6>
        <div className="d-flex flex-wrap gap-2">
          {role.permissions?.map((perm) => (
            <span key={perm._id} className="badge text-bg-primary">
              {perm.code}
            </span>
          )) || <p className="text-muted">No permissions assigned.</p>}
        </div>
      </div>
    </div>
  );
};

export default RoleView;
