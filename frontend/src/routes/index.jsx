import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";
import AdminDashboardPage from "../pages/admin/Dashboard";
import GuestHomePage from "../pages/guest/Home";
import LoginPage from "../pages/guest/Login";
import OrganizationDashboardPage from "../pages/organization/Dashboard";
import NotFoundPage from "../pages/shared/NotFound";
import UnauthorizedPage from "../pages/shared/Unauthorized";
import UserDashboardPage from "../pages/user/Dashboard";

function RequireRole({ allowedRoles, children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  if (!allowedRoles || allowedRoles.length === 0) return children;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <GuestHomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route path="/403" element={<UnauthorizedPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={["nguoi_dung", "admin"]}>
                <UserDashboardPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/org"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={["to_chuc", "admin"]}>
                <OrganizationDashboardPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
