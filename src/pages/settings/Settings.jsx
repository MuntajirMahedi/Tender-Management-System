// src/pages/settings/Settings.jsx
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import PageHeader from "../../components/PageHeader";
import useAuth from "../../hooks/useAuth";
import { userApi } from "../../api";

// ⭐ Phone Input
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Settings = () => {
  const { user, refreshProfile } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      role: "",
      isActive: "",
      createdAt: "",
      updatedAt: "",
      permissionsCount: ""
    }
  });

  // Prefill data
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
        role: user.role,
        isActive: user.isActive ? "Active" : "Inactive",
        createdAt: new Date(user.createdAt).toLocaleString(),
        updatedAt: new Date(user.updatedAt).toLocaleString(),
        permissionsCount: user.permissions?.length || 0
      });
    }
  }, [user, reset]);

  // Submit — only update name + mobile
  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      mobile: values.mobile
    };

    await userApi.updateUser(user.id || user._id, payload);
    await refreshProfile();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile" />

      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">

          {/* NAME (editable) */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              className="form-control"
              {...register("name")}
              placeholder="Enter full name"
            />
          </div>

          {/* EMAIL (disabled) */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Email</label>
            <input
              className="form-control"
              {...register("email")}
              disabled
            />
          </div>

          {/* MOBILE Editable */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Mobile</label>

            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  country={"in"}
                  enableSearch={true}
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputClass="form-control"
                  containerClass="w-100"
                  inputStyle={{ height: "38px", fontSize: "14px" }}
                  buttonStyle={{
                    height: "38px",
                    border: "1px solid #ced4da",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              )}
            />
          </div>

          {/* ROLE (disabled) */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Role</label>
            <input className="form-control" {...register("role")} disabled />
          </div>

          {/* ACTIVE STATUS (disabled) */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Account Status</label>
            <input className="form-control" {...register("isActive")} disabled />
          </div>

          {/* PERMISSIONS COUNT (disabled) */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Permissions</label>
            <input
              className="form-control"
              {...register("permissionsCount")}
              disabled
            />
          </div>

          {/* CREATED AT */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Created At</label>
            <input className="form-control" {...register("createdAt")} disabled />
          </div>

          {/* UPDATED AT */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Last Updated</label>
            <input className="form-control" {...register("updatedAt")} disabled />
          </div>

        </div>

        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
