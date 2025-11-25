import { useEffect } from "react";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/PageHeader";
import useAuth from "../../hooks/useAuth";
import { userApi } from "../../api";

const Settings = () => {
  const { user, refreshProfile } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: ""
    }
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, mobile: user.mobile });
    }
  }, [user, reset]);

  const onSubmit = async (values) => {
    await userApi.updateUser(user.id || user._id, values);
    await refreshProfile();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile" />
      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input className="form-control" {...register("name")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input className="form-control" {...register("email")} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label">Mobile</label>
            <input className="form-control" {...register("mobile")} />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

