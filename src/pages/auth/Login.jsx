import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";          // ✅ toast import
import useAuth from "../../hooks/useAuth";

// ----------------------
// VALIDATION SCHEMA
// ----------------------
const schema = yup.object({
  identifier: yup
    .string()
    .trim()
    .required("Email or mobile is required")
    .test(
      "email-or-mobile",
      "Enter a valid email or a 10-digit mobile number",
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number
        return emailRegex.test(value) || mobileRegex.test(value);
      }
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
});

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // ----------------------
  // SUBMIT HANDLER
  // ----------------------
  const onSubmit = async (values) => {
    try {
      // sanitize values
      values.identifier = values.identifier.trim();

      // call login API from useAuth
      await login(values);

      // ✅ success toast
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000
      });

      // redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);

      // ✅ error toast
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid login credentials!";

      toast.error(message, {
        position: "top-right",
        autoClose: 2500
      });
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#eef2ff" }}
    >
      <div className="card shadow-lg" style={{ width: "min(420px, 90%)" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="mb-2">
              <i className="bi bi-grid-1x2-fill text-primary fs-1" />
            </div>
            <h3>Total Management System</h3>
            <p className="text-muted mb-0">Sign in to continue</p>
          </div>

          {/* ---------------------- */}
          {/*   FORM START           */}
          {/* ---------------------- */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Identifier field */}
            <div className="mb-3">
              <label className="form-label">Email or Mobile</label>
              <input
                type="text"
                autoComplete="username"
                className={`form-control ${
                  errors.identifier ? "is-invalid" : ""
                }`}
                placeholder="owner@tms.io or 9876543210"
                {...register("identifier")}
                onBlur={(e) => {
                  setValue("identifier", e.target.value.trim());
                }}
              />
              {errors.identifier && (
                <div className="invalid-feedback">
                  {errors.identifier.message}
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* remember + forgot */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              className="btn btn-primary w-100"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
