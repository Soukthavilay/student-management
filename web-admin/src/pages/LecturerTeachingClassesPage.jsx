import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";

export default function LecturerTeachingClassesPage() {
  const [selectedSection, setSelectedSection] = useState(null);

  // Fetch assigned sections
  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    isError: sectionsError,
  } = useQuery({
    queryKey: ["lecturer-sections"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data.sections || [];
    },
  });

  // Fetch students for selected section
  const {
    data: studentsData,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useQuery({
    queryKey: ["lecturer-section-students", selectedSection?.id],
    queryFn: async () => {
      if (!selectedSection) return null;
      const response = await api.lecturer.sectionStudents(selectedSection.id);
      return response.data.students || [];
    },
    enabled: !!selectedSection,
  });

  const sections = sectionsData || [];
  const students = studentsData || [];

  if (sectionsLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Không thể tải danh sách lớp giảng dạy</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Lớp giảng dạy</h1>
        <span className="text-sm text-slate-500">
          Tổng: {sections.length} học phần
        </span>
      </div>

      {sections.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Bạn chưa được phân công giảng dạy học phần nào
        </div>
      ) : (
        <TableCard title="Danh sách học phần">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Mã HP</th>
                  <th className="py-3 font-medium">Môn học</th>
                  <th className="py-3 font-medium">TC</th>
                  <th className="py-3 font-medium">Lớp</th>
                  <th className="py-3 font-medium">Học kỳ</th>
                  <th className="py-3 font-medium">Năm học</th>
                  <th className="py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr
                    key={section.id}
                    className={`border-t border-slate-50 cursor-pointer transition-colors ${
                      selectedSection?.id === section.id
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedSection(section)}
                  >
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
                    <td className="py-3">{section.semester}</td>
                    <td className="py-3">{section.academicYear}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                          selectedSection?.id === section.id
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {selectedSection?.id === section.id ? "Đang chọn" : "Xem SV"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      )}

      {/* Student list for selected section */}
      {selectedSection && (
        <TableCard
          title={`Danh sách sinh viên - ${selectedSection.code} (${selectedSection.subject?.name})`}
        >
          {studentsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
            </div>
          ) : studentsError ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Không thể tải danh sách sinh viên
            </div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              Lớp học phần này chưa có sinh viên đăng ký
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-3 font-medium">STT</th>
                    <th className="py-3 font-medium">Mã SV</th>
                    <th className="py-3 font-medium">Họ tên</th>
                    <th className="py-3 font-medium">Email</th>
                    <th className="py-3 font-medium">Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 text-slate-500">{index + 1}</td>
                      <td className="py-3 font-mono text-xs">
                        {item.student?.studentCode}
                      </td>
                      <td className="py-3 font-medium">
                        {item.student?.user?.fullName}
                      </td>
                      <td className="py-3 text-slate-500">
                        {item.student?.user?.email}
                      </td>
                      <td className="py-3">
                        {item.grade ? (
                          <span
                            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                              item.grade.status === "SUBMITTED"
                                ? "bg-green-100 text-green-700"
                                : item.grade.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.grade.finalScore?.toFixed(1) || "-"} (
                            {item.grade.status === "SUBMITTED"
                              ? "Đã nhập"
                              : item.grade.status === "DRAFT"
                              ? "Nháp"
                              : "Chưa nhập"}
                            )
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Chưa nhập</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                Tổng số sinh viên: <strong>{students.length}</strong>
              </div>
            </div>
          )}
        </TableCard>
      )}
    </div>
  );
}
