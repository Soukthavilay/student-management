import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LecturerDetailPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lecturer-detail", id],
    queryFn: async () => {
      const response = await api.admin.getLecturer(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Không tìm thấy giảng viên</p>
        <Link to="/lecturers" className="mt-3 inline-block text-sm text-slate-600 underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/lecturers" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">{data.user.fullName}</h1>
          <p className="text-sm text-slate-500">Mã GV: <span className="font-mono">{data.lecturerCode}</span></p>
        </div>
        <span className={`rounded px-2.5 py-1 text-xs font-medium ${data.user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {data.user.isActive ? "Hoạt động" : "Đã khóa"}
        </span>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-slate-200 bg-white items-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
          {[
            { label: "Email", value: data.user.email },
            { label: "Khoa", value: data.department?.name || "-" },
            { label: "Học vị", value: data.title || "-" },
            { label: "Ngày tạo", value: formatDate(data.user.createdAt) },
          ].map((item) => (
            <div key={item.label} className="p-4">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-800 truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Lớp phân công</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{data.teachingAssignments?.length || 0}</p>
        </div>
      </div>

      {/* Teaching Assignments */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Danh sách lớp giảng dạy ({data.teachingAssignments?.length || 0})
        </h2>

        {(!data.teachingAssignments || data.teachingAssignments.length === 0) ? (
          <p className="py-10 text-center text-sm text-slate-400">Chưa được phân công giảng dạy lớp nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Lớp sinh hoạt</th>
                  <th className="py-3 font-medium">Học phần</th>
                  <th className="py-3 font-medium">Môn học</th>
                  <th className="py-3 font-medium">Số lịch học</th>
                </tr>
              </thead>
              <tbody>
                {data.teachingAssignments.map((a) => (
                  <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                        {a.section?.classGroup?.code || "-"}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs">{a.section?.code}</td>
                    <td className="py-3">
                      <span className="font-medium">{a.section?.subject?.name}</span>
                      <span className="ml-1 text-xs text-slate-400">{a.section?.subject?.code}</span>
                    </td>
                    <td className="py-3 font-medium">{a.section?.schedules?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
