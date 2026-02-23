import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";

const gradeSchema = z.object({
  enrollmentId: z.coerce.number().int().positive(),
  attendance: z.coerce.number().min(0).max(10),
  midterm: z.coerce.number().min(0).max(10),
  finalExam: z.coerce.number().min(0).max(10),
});

function calculateFinalScore(attendance, midterm, finalExam) {
  return Number((attendance * 0.1 + midterm * 0.3 + finalExam * 0.6).toFixed(2));
}

export default function LecturerGradesPage() {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const sectionsQuery = useQuery({
    queryKey: ["lecturer-sections"],
    queryFn: async () => {
      const response = await api.lecturer.sections();
      return response.data.sections || [];
    },
  });

  const studentsQuery = useQuery({
    queryKey: ["lecturer-section-students", selectedSectionId],
    queryFn: async () => {
      const response = await api.lecturer.sectionStudents(selectedSectionId);
      return response.data.students || [];
    },
    enabled: Boolean(selectedSectionId),
  });

  const gradeForm = useForm({
    resolver: zodResolver(gradeSchema),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => api.lecturer.upsertGrade(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lecturer-section-students", selectedSectionId],
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => api.lecturer.submitGrade(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lecturer-section-students", selectedSectionId],
      });
    },
  });

  const selectedStudent = useMemo(() => {
    const id = Number(gradeForm.watch("enrollmentId"));
    return (studentsQuery.data || []).find((item) => item.id === id);
  }, [gradeForm, studentsQuery.data]);

  const onSave = gradeForm.handleSubmit(async (values) => {
    const finalScore = calculateFinalScore(values.attendance, values.midterm, values.finalExam);

    await saveMutation.mutateAsync({
      enrollmentId: values.enrollmentId,
      finalScore,
      components: [
        { name: "Chuyên cần", weight: 0.1, score: values.attendance },
        { name: "Giữa kỳ", weight: 0.3, score: values.midterm },
        { name: "Cuối kỳ", weight: 0.6, score: values.finalExam },
      ],
    });
  });

  const handleSubmitGrade = async () => {
    const enrollmentId = Number(gradeForm.getValues("enrollmentId"));
    if (!enrollmentId) {
      return;
    }
    await submitMutation.mutateAsync({ enrollmentId });
  };

  return (
    <div className="space-y-6">
      <TableCard title="Nhập điểm học phần">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Học phần</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
            >
              <option value="">Chọn học phần</option>
              {(sectionsQuery.data || []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code} - {section.subject?.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={onSave}>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Sinh viên</span>
            <select className="w-full rounded border border-slate-300 px-3 py-2" {...gradeForm.register("enrollmentId")}>
              <option value="">Chọn sinh viên</option>
              {(studentsQuery.data || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.student.studentCode} - {item.student.user.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Chuyên cần (10%)</span>
            <input className="w-full rounded border border-slate-300 px-3 py-2" type="number" step="0.1" {...gradeForm.register("attendance")} />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Giữa kỳ (30%)</span>
            <input className="w-full rounded border border-slate-300 px-3 py-2" type="number" step="0.1" {...gradeForm.register("midterm")} />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Cuối kỳ (60%)</span>
            <input className="w-full rounded border border-slate-300 px-3 py-2" type="number" step="0.1" {...gradeForm.register("finalExam")} />
          </label>

          <div className="md:col-span-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Đang lưu..." : "Lưu điểm nháp"}
            </button>
            <button
              type="button"
              className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
              onClick={handleSubmitGrade}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Đang nộp..." : "Nộp điểm"}
            </button>
          </div>
        </form>

        {selectedStudent ? (
          <p className="mt-3 text-sm text-slate-600">
            Đang nhập điểm cho: <strong>{selectedStudent.student.user.fullName}</strong>
          </p>
        ) : null}
      </TableCard>

      <TableCard title="Danh sách điểm theo học phần">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Mã SV</th>
              <th className="py-2">Họ tên</th>
              <th className="py-2">Điểm tổng</th>
              <th className="py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {(studentsQuery.data || []).map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2">{item.student.studentCode}</td>
                <td className="py-2">{item.student.user.fullName}</td>
                <td className="py-2">{item.grade?.finalScore ?? "-"}</td>
                <td className="py-2">{item.grade?.status ?? "CHUA_NHAP"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
