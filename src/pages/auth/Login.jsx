import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuth from "../../hooks/useAuth";

const schema = yup.object({
  identifier: yup.string().required("Email or mobile is required"),
  password: yup.string().required("Password is required")
});

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#eef2ff" }}>
      <div className="card shadow-lg" style={{ width: "min(420px, 90%)" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="mb-2">
              <i className="bi bi-grid-1x2-fill text-primary fs-1" />
            </div>
            <h3>Total Management System</h3>
            <p className="text-muted mb-0">Sign in to continue</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Email or mobile</label>
              <input
                type="text"
                className={`form-control ${errors.identifier ? "is-invalid" : ""}`}
                placeholder="owner@tms.io"
                {...register("identifier")}
              />
              {errors.identifier && (
                <div className="invalid-feedback">{errors.identifier.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <button
              className="btn btn-primary w-100"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

