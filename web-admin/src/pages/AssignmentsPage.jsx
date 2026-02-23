import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";

const schema = z.object({
  sectionId: z.coerce.number().int().positive(),
  lecturerId: z.coerce.number().int().positive(),
});

export default function AssignmentsPage() {
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async () => { const r = await api.admin.sections(); return r.data.data || []; },
  });

  const lecturersQuery = useQuery({
    queryKey: ["admin-lecturers"],
    queryFn: async () => { const r = await api.admin.lecturers(); return r.data.data || []; },
  });

  const assignMutation = useMutation({
    mutationFn: (p) => api.admin.assignLecturer(p),
    onSuccess: () => { reset(); setShowForm(false); showToast("Phân công thành công"); },
    onError: (e) => showToast(e?.response?.data?.message || "Phân công thất bại", "error"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Phân công giảng viên</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Thêm phân công"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Phân công giảng viên cho học phần">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(async (v) => { await assignMutation.mutateAsync(v); })}>
            <FormField label="Học phần" error={errors.sectionId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("sectionId")}>
                <option value="">Chọn học phần</option>
                {(sectionsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code} - {s.subject?.name}</option>)}
              </select>
            </FormField>
            <FormField label="Giảng viên" error={errors.lecturerId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("lecturerId")}>
                <option value="">Chọn giảng viên</option>
                {(lecturersQuery.data || []).map((l) => <option key={l.id} value={l.id}>{l.lecturerCode} - {l.user?.fullName}</option>)}
              </select>
            </FormField>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" disabled={isSubmitting || assignMutation.isPending}>
                {assignMutation.isPending ? "Đang lưu..." : "Lưu phân công"}
              </button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { reset(); setShowForm(false); }}>Huỷ</button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard title="Hướng dẫn">
        <p className="py-8 text-center text-sm text-slate-400">Gán giảng viên phụ trách từng học phần. Chọn "Thêm phân công" để bắt đầu.</p>
      </TableCard>
    </div>
  );
}
