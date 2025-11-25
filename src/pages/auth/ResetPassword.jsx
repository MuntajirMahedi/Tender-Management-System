import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { authApi } from "../../api";

const schema = yup.object({
  password: yup.string().min(6).required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
});

const ResetPassword = () => {
  const { token } = useParams();
  const [status, setStatus] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const onSubmit = async ({ password }) => {
    try {
      await authApi.resetPassword(token, { password });
      setStatus({
        type: "success",
        message: "Password updated. You can login with new credentials."
      });
    } catch (error) {
      setStatus({
        type: "warning",
        message:
          "Reset endpoint is unavailable. Please reach your administrator."
      });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#eef2ff" }}>
      <div className="card shadow" style={{ width: "min(420px, 90%)" }}>
        <div className="card-body p-4">
          <h3>Reset password</h3>
          <p className="text-muted">
            Provide a new password to secure your account.
          </p>
          {status && (
            <div className={`alert alert-${status.type}`}>{status.message}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                {...register("password")}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm password</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

