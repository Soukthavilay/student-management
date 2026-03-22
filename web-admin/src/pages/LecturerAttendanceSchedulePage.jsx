import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";

export default function LecturerAttendanceSchedulePage() {
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Fetch sections assigned to the lecturer
  const sectionsQuery = useQuery({
    queryKey: ["lecturer-sections"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data.sections || [];
    },
  });

  // Fetch attendance schedule for the selected section
  const scheduleQuery = useQuery({
    queryKey: ["lecturer-attendance-schedule", selectedSectionId],
    queryFn: async () => {
      const response = await api.lecturer.getAttendanceSchedule({
        sectionId: selectedSectionId,
      });
      return response.data.data || {};
    },
    enabled: Boolean(selectedSectionId),
  });

  const data = scheduleQuery.data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Lịch Điểm Danh</h1>

        {/* Section Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Chọn Học Phần</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn học phần --</option>
            {sectionsQuery.data?.map((section) => (
              <option key={section.id} value={section.id}>
                {section.code} - {section.subject?.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSectionId && scheduleQuery.isLoading && (
          <div className="text-center py-8">Đang tải...</div>
        )}

        {selectedSectionId && scheduleQuery.isError && (
          <div className="text-center py-8 text-red-600">
            Lỗi khi tải dữ liệu
          </div>
        )}

        {selectedSectionId && data && (
          <>
            {/* Section Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{data.section?.subjectName}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Mã lớp:</span> {data.section?.code}
                </div>
                <div>
                  <span className="font-medium">Học kỳ:</span> {data.section?.semesterName}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Lịch học:</span>
                <div className="mt-1">
                  {data.section?.schedules?.map((sch, idx) => (
                    <div key={idx} className="text-sm">
                      Thứ {sch.dayOfWeek}, Ca {sch.shift} - {sch.room}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance Records by Date */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lịch Điểm Danh</h3>
              {data.attendanceByDate && data.attendanceByDate.length > 0 ? (
                data.attendanceByDate.map((dateRecord) => (
                  <div key={dateRecord.date} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-semibold">
                      {new Date(dateRecord.date).toLocaleDateString("vi-VN")}
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Sinh Viên</th>
                          <th className="px-4 py-2 text-left">Trạng Thái</th>
                          <th className="px-4 py-2 text-left">Ghi Chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateRecord.records.map((record) => (
                          <tr key={record.studentId} className="border-t">
                            <td className="px-4 py-2">{record.studentName}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  record.status === "PRESENT"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "ABSENT"
                                      ? "bg-red-100 text-red-800"
                                      : record.status === "LATE"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {record.status === "PRESENT"
                                  ? "Có mặt"
                                  : record.status === "ABSENT"
                                    ? "Vắng"
                                    : record.status === "LATE"
                                      ? "Muộn"
                                      : "Có lý do"}
                              </span>
                            </td>
                            <td className="px-4 py-2">{record.note || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch điểm danh
                </div>
              )}
            </div>

            {/* Student Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Danh Sách Sinh Viên ({data.students?.length || 0})</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {data.students?.map((student) => (
                  <div key={student.studentId} className="py-1">
                    {student.studentName}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
