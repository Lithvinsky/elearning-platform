import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import ManageCourse from "./pages/ManageCourse";
import AdminUsers from "./pages/AdminUsers";
import Requests from "./pages/Requests";
import MyLearning from "./pages/MyLearning";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="my-learning" element={<MyLearning />} />
            <Route path="requests" element={<Requests />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/courses/new"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ManageCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit-course/:id"
              element={
                <ProtectedRoute roles={["admin", "faculty"]}>
                  <ManageCourse />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
