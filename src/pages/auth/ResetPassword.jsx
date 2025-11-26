import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { authApi } from "../../api";

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
  otp: yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
  newPassword: yup.string().min(6).required("New password is required")
});

const ResetPassword = () => {
  const [status, setStatus] = useState(null);

  const savedEmail = localStorage.getItem("resetEmail") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { 
      email: savedEmail,   // ⭐ Auto-fill email here
      otp: "",
      newPassword: "" 
    }
  });

  const onSubmit = async (values) => {
    try {
      const res = await authApi.resetPassword(values);

      setStatus({
        type: "success",
        message: res.message || "Password reset successfully."
      });

      // Optional: Clear saved email
      localStorage.removeItem("resetEmail");

    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setStatus({ type: "danger", message: msg });
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#eef2ff" }}
    >
      <div className="card shadow" style={{ width: "min(420px, 90%)" }}>
        <div className="card-body p-4">
          <h3>Reset password</h3>

          {status && (
            <div className={`alert alert-${status.type}`}>{status.message}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Registered Email</label>
              <input
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                {...register("email")}
                disabled   // ⭐ user email change nahi karega
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">OTP</label>
              <input
                className={`form-control ${errors.otp ? "is-invalid" : ""}`}
                {...register("otp")}
              />
              {errors.otp && (
                <div className="invalid-feedback">{errors.otp.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className={`form-control ${
                  errors.newPassword ? "is-invalid" : ""
                }`}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <div className="invalid-feedback">
                  {errors.newPassword.message}
                </div>
              )}
            </div>

            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/login">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
