import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
