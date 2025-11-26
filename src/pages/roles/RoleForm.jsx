import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PageHeader from "../../components/PageHeader";
import LoadingScreen from "../../components/LoadingScreen";
import { permissionApi, roleApi } from "../../api";
import useAuth from "../../hooks/useAuth"; // ✅ NEW

// Validation schema
const schema = yup.object({
  name: yup.string().required("Role name is required"),
  key: yup.string().required("Key is required")
});

const RoleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { user, refreshProfile } = useAuth(); // ✅ get current user + refresher

  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", key: "", description: "" }
  });

  // Load permissions
  useEffect(() => {
    permissionApi
      .getPermissions()
      .then((res) => setPermissions(res.permissions || []));
  }, []);

  // Load role when editing
  useEffect(() => {
    const loadRole = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }

      try {
        const { role } = await roleApi.getRole(id);
        reset({
          name: role.name,
          key: role.key,
          description: role.description || ""
        });
        // role.permissions might be array of Permission docs
        setSelectedPermissions(role.permissions?.map((perm) => perm.code) || []);
      } catch (err) {
        console.error("Unable to load role", err);
      }

      setLoading(false);
    };

    loadRole();
  }, [id, isEdit, reset]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      acc[perm.module] = acc[perm.module] || [];
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  // Toggle permission selection
  const togglePermission = (code) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  // Submit form
const onSubmit = async (values) => {
  try {
    let roleId = id;

    if (isEdit) {
      await roleApi.updateRole(roleId, values);
    } else {
      // Create new role
      const { role } = await roleApi.createRole(values);
      roleId = role._id;
    }

    // Save permissions
    await roleApi.updateRolePermissions(roleId, selectedPermissions);

    // ✅ Always refresh current user profile (permissions)
    try {
      await refreshProfile();
      console.log("[RoleForm] Profile refreshed after role update");
    } catch (e) {
      console.error("Failed to refresh profile after role update", e);
    }

    navigate("/roles");
  } catch (error) {
    console.error("Unable to save role", error);
  }
};


  if (loading) return <LoadingScreen label="Loading role..." />;

  return (
    <div>
      <PageHeader title={`${isEdit ? "Edit" : "Add"} Role`} />

      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Role Name *</label>
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              {...register("name")}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Key *</label>
            <input
              className={`form-control ${errors.key ? "is-invalid" : ""}`}
              {...register("key")}
            />
            {errors.key && (
              <div className="invalid-feedback">{errors.key.message}</div>
            )}
          </div>

          <div className="col-12">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              rows={3}
              {...register("description")}
            />
          </div>
        </div>

        <hr />

        <h5>Permissions</h5>
        <div className="row">
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="col-md-4 mb-3">
              <h6>{module}</h6>
              {perms.map((perm) => (
                <div className="form-check" key={perm.code}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={perm.code}
                    checked={selectedPermissions.includes(perm.code)}
                    onChange={() => togglePermission(perm.code)}
                  />
                  <label className="form-check-label" htmlFor={perm.code}>
                    {perm.name}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate("/roles")}
          >
            Cancel
          </button>

          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
