import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../state/auth-context";

const quickStartSteps = [
  { step: 1, title: "Tạo Khoa", description: "Thiết lập các khoa/bộ môn", link: "/academics" },
  { step: 2, title: "Tạo Lớp", description: "Tạo lớp học thuộc từng khoa", link: "/academics" },
  { step: 3, title: "Thêm Sinh viên", description: "Nhập danh sách sinh viên", link: "/students" },
  { step: 4, title: "Tạo Môn học", description: "Khai báo môn học + tín chỉ", link: "/academics" },
  { step: 5, title: "Tạo Học phần", description: "Mở học phần cho kỳ học", link: "/academics" },
  { step: 6, title: "Phân công GV", description: "Gán giảng viên cho học phần", link: "/assignments" },
  { step: 7, title: "Gửi Thông báo", description: "Thông báo đến sinh viên", link: "/announcements" },
];

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
        <h1 className="text-xl font-semibold text-slate-900">Tổng quan</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Học phần phụ trách" value={sections.length} />
        </div>
      </div>
    );
  }

  const dashboard = adminQuery.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Xin chào, {user?.fullName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sinh viên" value={dashboard?.students || 0} />
        <StatCard label="Giảng viên" value={dashboard?.lecturers || 0} />
        <StatCard label="Học phần" value={dashboard?.sections || 0} />
        <StatCard label="Thông báo" value={dashboard?.announcements || 0} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Hướng dẫn bắt đầu
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickStartSteps.map((item) => (
            <Link
              key={item.step}
              to={item.link}
              className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {item.step}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
