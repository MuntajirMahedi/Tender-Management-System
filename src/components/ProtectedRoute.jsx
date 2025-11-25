import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen label="Preparing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

