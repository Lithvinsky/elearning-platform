import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { EnrollmentRequestsPage } from "./pages/EnrollmentRequestsPage";
import { CreateCoursePage } from "./pages/CreateCoursePage";
import { EditCoursePage } from "./pages/EditCoursePage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route
          path="/courses/new"
          element={
            <ProtectedRoute roles={["admin", "faculty"]}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/edit"
          element={
            <ProtectedRoute roles={["admin"]}>
              <EditCoursePage />
            </ProtectedRoute>
          }
        />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute roles={["admin", "faculty"]}>
              <EnrollmentRequestsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
