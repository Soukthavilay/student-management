import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";

const schema = z.object({
  studentId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
});

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const studentsQuery = useQuery({
    queryKey: ["enrollment-students"],
    queryFn: async () => {
      const res = await api.admin.students();
      return res.data?.data || [];
    },
  });

  const sectionsQuery = useQuery({
    queryKey: ["enrollment-sections"],
    queryFn: async () => {
      const res = await api.admin.sections();
      return res.data?.data || [];
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (payload) => api.admin.createEnrollment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment-sections"] });
      showToast("Đăng ký thành công");
      reset();
    },
    onError: (e) => showToast(e?.response?.data?.message || "Đăng ký thất bại", "error"),
  });

  const onSubmit = handleSubmit(async (values) => {
    await enrollMutation.mutateAsync(values);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Đăng ký học phần (admin)</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Mở form"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Đăng ký hộ sinh viên vào lớp học phần">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField label="Sinh viên" error={errors.studentId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("studentId")}> 
                <option value="">Chọn sinh viên</option>
                {(studentsQuery.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentCode} - {s.user?.fullName}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Lớp học phần" error={errors.sectionId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("sectionId")}>
                <option value="">Chọn học phần</option>
                {(sectionsQuery.data || []).map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.code} - {section.subject?.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                disabled={isSubmitting || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => reset()}
              >
                Làm mới
              </button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard title="Gợi ý" subtitle="Chỉ dùng cho đăng ký hộ; sinh viên tự đăng ký sẽ thực hiện trên mobile.">
        <p className="text-sm text-slate-500">
          - Chọn đúng sinh viên và lớp học phần còn chỗ. Hệ thống backend sẽ kiểm tra trùng lịch, capacity và cấu hình học kỳ.
        </p>
      </TableCard>
    </div>
  );
}
