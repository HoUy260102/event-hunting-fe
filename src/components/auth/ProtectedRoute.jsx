import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingPage from "../../pages/LoadingPage";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role;

  // Enforce role-based access for admin routes
  if (location.pathname.startsWith("/admin")) {
    if (role === "USER") {
      // Regular users are not allowed in admin pages at all
      return <Navigate to="/" replace />;
    }

    if (role === "ORGANIZER") {
      // Organizers are only allowed to access specific sections
      const restrictedPaths = [
        "/admin/users",
        "/admin/add-user",
        "/admin/update-user",
        "/admin/categories",
        "/admin/add-category",
        "/admin/update-category",
        "/admin/roles",
      ];

      const isRestricted = restrictedPaths.some((path) =>
        location.pathname.startsWith(path)
      );

      if (isRestricted) {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

