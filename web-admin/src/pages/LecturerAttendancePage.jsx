import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";

export default function LecturerAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceList, setAttendanceList] = useState([]);

  // 1. Fetch sections assigned to the lecturer
  const sectionsQuery = useQuery({
    queryKey: ["lecturer-sections"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data.sections || [];
    },
  });

  // 2. Fetch existing attendance for the selected section and date
  const attendanceQuery = useQuery({
    queryKey: ["lecturer-attendance", selectedSectionId, selectedDate],
    queryFn: async () => {
      const response = await api.lecturer.getAttendance({ 
        sectionId: selectedSectionId, 
        date: selectedDate 
      });
      return response.data.data || [];
    },
    enabled: Boolean(selectedSectionId) && Boolean(selectedDate),
  });

  // 3. Fetch all students in the section (to initialize attendance if not exists)
  const studentsQuery = useQuery({
    queryKey: ["lecturer-section-students", selectedSectionId],
    queryFn: async () => {
      const response = await api.lecturer.sectionStudents(selectedSectionId);
      return response.data.students || [];
    },
    enabled: Boolean(selectedSectionId),
  });

  // Sync attendanceList state when queries finish
  useEffect(() => {
    if (attendanceQuery.data && attendanceQuery.data.length > 0) {
      // Use existing attendance data
      setAttendanceList(attendanceQuery.data.map(item => ({
        studentId: item.studentId,
        studentCode: item.student.studentCode,
        fullName: item.student.user.fullName,
        status: item.status,
        remark: item.remark || "",
      })));
    } else if (studentsQuery.data) {
      // Initialize with default UNKNOWN or PRESENT status
      setAttendanceList(studentsQuery.data.map(item => ({
        studentId: item.student.id,
        studentCode: item.student.studentCode,
        fullName: item.student.user.fullName,
        status: "PRESENT",
        remark: "",
      })));
    }
  }, [attendanceQuery.data, studentsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.lecturer.markAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lecturer-attendance", selectedSectionId, selectedDate],
      });
      alert("Đã lưu điểm danh thành công!");
    },
    onError: (error) => {
      alert(error?.response?.data?.message || "Lỗi khi lưu điểm danh");
    }
  });

  const handleStatusChange = (studentId, status) => {
    setAttendanceList(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  const handleRemarkChange = (studentId, remark) => {
    setAttendanceList(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, remark } : item
    ));
  };

  const handleMarkAllPresent = () => {
    setAttendanceList(prev => prev.map(item => ({ ...item, status: "PRESENT" })));
  };

  const onSave = () => {
    if (!selectedSectionId || !selectedDate) return;
    saveMutation.mutate({
      sectionId: Number(selectedSectionId),
      date: selectedDate,
      attendanceData: attendanceList.map(item => ({
        studentId: item.studentId,
        status: item.status,
        remark: item.remark
      }))
    });
  };

  const isLoading = sectionsQuery.isLoading || attendanceQuery.isFetching || studentsQuery.isFetching;

  return (
    <div className="space-y-6">
      <TableCard title="Quản lý Điểm danh">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Học phần</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
            >
              <option value="">Chọn học phần</option>
              {(sectionsQuery.data || []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code} - {section.subject?.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Ngày điểm danh</span>
            <input
              type="date"
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>

          <div className="flex items-end">
            <button
              onClick={handleMarkAllPresent}
              disabled={!selectedSectionId}
              className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Tất cả hiện diện
            </button>
          </div>
        </div>
      </TableCard>

      <TableCard title={`Danh sách sinh viên ${selectedSectionId ? `(${attendanceList.length})` : ""}`}>
        {isLoading && <div className="py-10 text-center text-slate-500">Đang tải dữ liệu...</div>}
        
        {!isLoading && !selectedSectionId && (
          <div className="py-10 text-center text-slate-400">Vui lòng chọn học phần để bắt đầu điểm danh</div>
        )}

        {!isLoading && selectedSectionId && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2">MSSV</th>
                  <th className="py-3 px-2">Họ tên</th>
                  <th className="py-3 px-2 text-center">Trạng thái</th>
                  <th className="py-3 px-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((item) => (
                  <tr key={item.studentId} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-2 font-medium">{item.studentCode}</td>
                    <td className="py-3 px-2">{item.fullName}</td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center gap-1">
                        {[
                          { val: "PRESENT", label: "P", color: "bg-emerald-100 text-emerald-700 border-emerald-200", active: "bg-emerald-600 text-white border-emerald-600" },
                          { val: "ABSENT", label: "A", color: "bg-red-100 text-red-700 border-red-200", active: "bg-red-600 text-white border-red-600" },
                          { val: "LATE", label: "L", color: "bg-amber-100 text-amber-700 border-amber-200", active: "bg-amber-600 text-white border-amber-600" },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            onClick={() => handleStatusChange(item.studentId, btn.val)}
                            className={`w-10 h-8 rounded border text-xs font-bold transition-all ${
                              item.status === btn.val ? btn.active : `text-slate-400 border-slate-200 hover:border-slate-300`
                            }`}
                            title={btn.label === "P" ? "Present" : btn.label === "A" ? "Absent" : "Late"}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        className="w-full rounded border border-slate-200 bg-transparent px-2 py-1 text-xs focus:border-slate-400 focus:outline-none"
                        placeholder="Thêm ghi chú..."
                        value={item.remark}
                        onChange={(e) => handleRemarkChange(item.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={saveMutation.isPending || attendanceList.length === 0}
                className="rounded bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Đang lưu..." : "Lưu điểm danh"}
              </button>
            </div>
          </div>
        )}
      </TableCard>
    </div>
  );
}
