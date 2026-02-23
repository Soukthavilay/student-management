import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import LecturersPage from "./pages/LecturersPage";
import AcademicsPage from "./pages/AcademicsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import LecturerGradesPage from "./pages/LecturerGradesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/lecturers" element={<LecturersPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["LECTURER"]} />}>
            <Route path="/lecturer/grades" element={<LecturerGradesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
