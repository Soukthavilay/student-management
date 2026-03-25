import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import { showToast } from "../components/Toast";

export default function LecturerExamRegistrationPage() {
  const [selectedExam, setSelectedExam] = useState(null);
  const queryClient = useQueryClient();

  // Fetch exam registrations
  const {
    data: examsData,
    isLoading: examsLoading,
    isError: examsError,
  } = useQuery({
    queryKey: ["lecturer-exam-registrations"],
    queryFn: async () => {
      const response = await api.lecturer.examRegistrations();
      return response.data.exams || [];
    },
  });

  // Override eligibility mutation
  const overrideMutation = useMutation({
    mutationFn: (payload) => api.lecturer.overrideExamEligibility(payload),
    onSuccess: () => {
      showToast("Đã cập nhật điều kiện dự thi", "success");
      queryClient.invalidateQueries(["lecturer-exam-registrations"]);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || "Không thể cập nhật", "error");
    },
  });

  const exams = examsData || [];

  const handleToggleEligibility = (studentId, sectionId, currentStatus) => {
    const newStatus = currentStatus === false ? true : false;
    overrideMutation.mutate({
      studentId,
      sectionId,
      isEligible: newStatus,
    });
  };

  if (examsLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (examsError) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Không thể tải danh sách đăng ký thi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Quản lý đăng ký thi</h1>
        <span className="text-sm text-slate-500">
          Tổng: {exams.length} kỳ thi
        </span>
      </div>

      {exams.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Chưa có kỳ thi nào cho các học phần bạn phụ trách
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <TableCard
              key={exam.id}
              title={`${exam.section?.subject?.name} (${exam.section?.code})`}
              subtitle={
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Ngày thi: {new Date(exam.examDate).toLocaleDateString("vi-VN")}</span>
                  <span>Phòng: {exam.room?.name || "Chưa xếp"}</span>
                  <span>Lớp: {exam.section?.classGroup?.name}</span>
                  <span>Học kỳ: {exam.section?.semester?.name} - {exam.section?.semester?.academicYear}</span>
                </div>
              }
            >
              {exam.examRegistrations?.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Chưa có sinh viên đăng ký thi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="py-3 font-medium">STT</th>
                        <th className="py-3 font-medium">Mã SV</th>
                        <th className="py-3 font-medium">Họ tên</th>
                        <th className="py-3 font-medium">Ngày đăng ký</th>
                        <th className="py-3 font-medium">Điều kiện dự thi</th>
                        <th className="py-3 font-medium">Chi tiết</th>
                        <th className="py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.examRegistrations.map((reg, index) => (
                        <tr
                          key={reg.id}
                          className="border-t border-slate-50 hover:bg-slate-50"
                        >
                          <td className="py-3 text-slate-500">{index + 1}</td>
                          <td className="py-3 font-mono text-xs">
                            {reg.student?.studentCode}
                          </td>
                          <td className="py-3 font-medium">
                            {reg.student?.user?.fullName}
                          </td>
                          <td className="py-3 text-slate-500">
                            {new Date(reg.registrationDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3">
                            {reg.eligibility?.isEligible ? (
                              <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                Đủ điều kiện
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                Không đủ điều kiện
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="space-y-1 text-xs">
                              <div className={reg.eligibility?.attendanceRate >= 0.8 ? "text-green-600" : "text-red-600"}>
                                Điểm danh: {Math.round((reg.eligibility?.attendanceRate || 0) * 100)}%
                                {reg.eligibility?.isOverridden && " (Ghi đè)"}
                              </div>
                              <div className={reg.eligibility?.hasNoDebt ? "text-green-600" : "text-red-600"}>
                                Học phí: {reg.eligibility?.hasNoDebt ? "Đã đóng" : `Nợ ${reg.eligibility?.totalDebt?.toLocaleString("vi-VN")}đ`}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() =>
                                handleToggleEligibility(
                                  reg.studentId,
                                  exam.sectionId,
                                  reg.eligibility?.isEligible
                                )
                              }
                              disabled={overrideMutation.isPending}
                              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                reg.eligibility?.isEligible
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              } disabled:opacity-50`}
                            >
                              {reg.eligibility?.isEligible ? "Huỷ" : "Cho phép"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                    Tổng số đăng ký: <strong>{exam.examRegistrations?.length || 0}</strong>
                    {" | "}
                    Đủ điều kiện: <strong className="text-green-600">
                      {exam.examRegistrations?.filter((r) => r.eligibility?.isEligible).length || 0}
                    </strong>
                    {" | "}
                    Không đủ điều kiện: <strong className="text-red-600">
                      {exam.examRegistrations?.filter((r) => !r.eligibility?.isEligible).length || 0}
                    </strong>
                  </div>
                </div>
              )}
            </TableCard>
          ))}
        </div>
      )}
    </div>
  );
}
