import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";

const DAY_NAMES = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};

function formatSchedule(schedules) {
  if (!schedules || schedules.length === 0) return "Chưa có lịch";
  return schedules
    .map((s) => `${DAY_NAMES[s.dayOfWeek] || s.dayOfWeek}: ${s.startTime}-${s.endTime} (${s.room})`)
    .join(", ");
}

export default function LecturerTimetablePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lecturer-timetable"],
    queryFn: async () => {
      const response = await api.lecturer.timetable();
      return response.data.timetable || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Không thể tải thời khóa biểu</p>
      </div>
    );
  }

  const timetable = data || [];

  // Group by semester/academic year
  const bySemester = timetable.reduce((acc, item) => {
    const key = `${item.semester} - ${item.academicYear}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Thời khóa biểu giảng dạy</h1>
        <span className="text-sm text-slate-500">
          Tổng: {timetable.length} học phần
        </span>
      </div>

      {timetable.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Bạn chưa được phân công giảng dạy học phần nào
        </div>
      ) : (
        Object.entries(bySemester).map(([semesterKey, sections]) => (
          <TableCard key={semesterKey} title={semesterKey}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-3 font-medium">Mã HP</th>
                    <th className="py-3 font-medium">Môn học</th>
                    <th className="py-3 font-medium">TC</th>
                    <th className="py-3 font-medium">Lớp</th>
                    <th className="py-3 font-medium">Khoa</th>
                    <th className="py-3 font-medium">Lịch học</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs">{section.code}</td>
                      <td className="py-3">
                        <div className="font-medium">{section.subject?.name}</div>
                        <div className="text-xs text-slate-400">{section.subject?.code}</div>
                      </td>
                      <td className="py-3">{section.subject?.credits}</td>
                      <td className="py-3">
                        <div className="font-medium">{section.classGroup?.name}</div>
                        <div className="text-xs text-slate-400">{section.classGroup?.code}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm">{section.department?.name}</div>
                        <div className="text-xs text-slate-400">{section.department?.code}</div>
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {section.schedules && section.schedules.length > 0 ? (
                            section.schedules.map((s, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{DAY_NAMES[s.dayOfWeek] || s.dayOfWeek}</span>
                                <span className="text-slate-500">: {s.shift ? `Ca ${s.shift}` : `${s.startTime}-${s.endTime}`}</span>
                                <span className="text-slate-400 ml-1">({s.room?.name || s.room || "Không có phòng"})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Chưa có lịch</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>
        ))
      )}
    </div>
  );
}
