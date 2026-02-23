import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth-context";

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Sinh viên" },
  { to: "/lecturers", label: "Giảng viên" },
  { to: "/academics", label: "Môn/Lớp/Học phần" },
  { to: "/assignments", label: "Phân công" },
  { to: "/announcements", label: "Thông báo" },
];

const lecturerLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/lecturer/grades", label: "Nhập điểm" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const links = user?.role === "ADMIN" ? adminLinks : lecturerLinks;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
            Student Management
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{user?.fullName}</span>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">
              {user?.role}
            </span>
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-1.5 text-white"
              onClick={logout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm ${
                    isActive
                      ? "bg-slate-800 font-medium text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
