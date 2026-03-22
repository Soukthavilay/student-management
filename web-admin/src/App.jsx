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
import StudentDetailPage from "./pages/StudentDetailPage";
import LecturerDetailPage from "./pages/LecturerDetailPage";
import LecturerGradesPage from "./pages/LecturerGradesPage";
import LecturerTimetablePage from "./pages/LecturerTimetablePage";
import LecturerAnnouncementsPage from "./pages/LecturerAnnouncementsPage";
import LecturerAttendancePage from "./pages/LecturerAttendancePage";
import LecturerAttendanceSchedulePage from "./pages/LecturerAttendanceSchedulePage";
import CurriculumPage from "./pages/CurriculumPage";
import TuitionPage from "./pages/TuitionPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import MajorPage from "./pages/MajorPage";
import ClassGroupPage from "./pages/ClassGroupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route path="/lecturers" element={<LecturersPage />} />
            <Route path="/lecturers/:id" element={<LecturerDetailPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/majors" element={<MajorPage />} />
            <Route path="/class-groups" element={<ClassGroupPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/tuition" element={<TuitionPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/enrollments" element={<EnrollmentsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["LECTURER"]} />}>
            <Route path="/lecturer/timetable" element={<LecturerTimetablePage />} />
            <Route path="/lecturer/announcements" element={<LecturerAnnouncementsPage />} />
            <Route path="/lecturer/grades" element={<LecturerGradesPage />} />
            <Route path="/lecturer/attendance" element={<LecturerAttendancePage />} />
            <Route path="/lecturer/attendance-schedule" element={<LecturerAttendanceSchedulePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
