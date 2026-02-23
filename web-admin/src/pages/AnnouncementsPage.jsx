import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormField from "../components/FormField";
import TableCard from "../components/TableCard";
import { showToast } from "../components/Toast";

const schema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  scope: z.enum(["ALL", "DEPARTMENT", "CLASS", "SECTION"]),
  departmentId: z.string().optional(),
  classGroupId: z.string().optional(),
  sectionId: z.string().optional(),
});

export default function AnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);

  const { register, watch, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { scope: "ALL" },
  });

  const scope = watch("scope");

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => { const r = await api.admin.departments(); return r.data.data || []; },
  });
  const classGroupsQuery = useQuery({
    queryKey: ["class-groups-all"],
    queryFn: async () => { const r = await api.admin.classGroups(); return r.data.data || []; },
  });
  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async () => { const r = await api.admin.sections(); return r.data.data || []; },
  });

  const createMutation = useMutation({
    mutationFn: (p) => api.admin.createAnnouncement(p),
    onSuccess: () => { reset({ title: "", content: "", scope: "ALL" }); setShowForm(false); showToast("Gửi thông báo thành công"); },
    onError: (e) => showToast(e?.response?.data?.message || "Gửi thông báo thất bại", "error"),
  });

  const onSubmit = handleSubmit(async (v) => {
    await createMutation.mutateAsync({
      title: v.title, content: v.content, scope: v.scope,
      departmentId: v.departmentId ? Number(v.departmentId) : null,
      classGroupId: v.classGroupId ? Number(v.classGroupId) : null,
      sectionId: v.sectionId ? Number(v.sectionId) : null,
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Thông báo</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Tạo thông báo"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Tạo thông báo mới">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField label="Tiêu đề" error={errors.title?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="VD: Lịch thi lại HK1" {...register("title")} />
            </FormField>
            <FormField label="Phạm vi" error={errors.scope?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("scope")}>
                <option value="ALL">Toàn trường</option>
                <option value="DEPARTMENT">Theo khoa</option>
                <option value="CLASS">Theo lớp</option>
                <option value="SECTION">Theo học phần</option>
              </select>
            </FormField>
            {scope === "DEPARTMENT" && (
              <FormField label="Khoa" error={errors.departmentId?.message}>
                <select className="rounded border border-slate-300 px-3 py-2" {...register("departmentId")}>
                  <option value="">Chọn khoa</option>
                  {(departmentsQuery.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FormField>
            )}
            {scope === "CLASS" && (
              <FormField label="Lớp" error={errors.classGroupId?.message}>
                <select className="rounded border border-slate-300 px-3 py-2" {...register("classGroupId")}>
                  <option value="">Chọn lớp</option>
                  {(classGroupsQuery.data || []).map((cg) => <option key={cg.id} value={cg.id}>{cg.code} - {cg.name}</option>)}
                </select>
              </FormField>
            )}
            {scope === "SECTION" && (
              <FormField label="Học phần" error={errors.sectionId?.message}>
                <select className="rounded border border-slate-300 px-3 py-2" {...register("sectionId")}>
                  <option value="">Chọn HP</option>
                  {(sectionsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </FormField>
            )}
            <div className="md:col-span-2">
              <FormField label="Nội dung" error={errors.content?.message}>
                <textarea className="min-h-24 rounded border border-slate-300 px-3 py-2" placeholder="Nhập nội dung..." {...register("content")} />
              </FormField>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
              </button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { reset(); setShowForm(false); }}>Huỷ</button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard title="Hướng dẫn">
        <p className="py-8 text-center text-sm text-slate-400">Gửi thông báo đến sinh viên theo phạm vi: Toàn trường, Theo khoa, Theo lớp, hoặc Theo học phần.</p>
      </TableCard>
    </div>
  );
}
