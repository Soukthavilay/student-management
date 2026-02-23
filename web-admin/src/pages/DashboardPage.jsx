import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../state/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  const adminQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.admin.dashboard();
      return response.data;
    },
    enabled: user?.role === "ADMIN",
  });

  const lecturerQuery = useQuery({
    queryKey: ["lecturer-sections-summary"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data;
    },
    enabled: user?.role === "LECTURER",
  });

  if (user?.role === "LECTURER") {
    const sections = lecturerQuery.data?.sections || [];
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Tổng quan giảng viên</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Học phần được phân công" value={sections.length} />
        </div>
      </div>
    );
  }

  const dashboard = adminQuery.data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard quản trị</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sinh viên" value={dashboard?.students || 0} />
        <StatCard label="Giảng viên" value={dashboard?.lecturers || 0} />
        <StatCard label="Học phần" value={dashboard?.sections || 0} />
        <StatCard label="Thông báo" value={dashboard?.announcements || 0} />
      </div>
    </div>
  );
}
