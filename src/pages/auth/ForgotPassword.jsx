import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { authApi } from "../../api";

const schema = yup.object({
  email: yup.string().email().required("Registered email is required")
});

const ForgotPassword = () => {
  const [status, setStatus] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (values) => {
    try {
      await authApi.requestPasswordReset(values);
      setStatus({
        type: "success",
        message:
          "If the account exists, reset instructions have been sent to your inbox."
      });
    } catch (error) {
      setStatus({
        type: "warning",
        message:
          "Password reset endpoint is not enabled yet. Contact your administrator."
      });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#eef2ff" }}>
      <div className="card shadow" style={{ width: "min(420px, 90%)" }}>
        <div className="card-body p-4">
          <h3>Forgot password</h3>
          <p className="text-muted">
            Enter your email and we will send you instructions to reset your password.
          </p>
          {status && (
            <div className={`alert alert-${status.type}`}>{status.message}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Send instructions"}
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

export default ForgotPassword;

