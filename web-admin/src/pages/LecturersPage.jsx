import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  lecturerCode: z.string().min(2),
  departmentId: z.coerce.number().int().positive(),
  title: z.string().optional(),
});

export default function LecturersPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const lecturersQuery = useQuery({
    queryKey: ["admin-lecturers", keyword],
    queryFn: async () => {
      const response = await api.admin.lecturers(keyword ? { q: keyword } : undefined);
      return response.data.data || [];
    },
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.admin.departments();
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.admin.createLecturer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lecturers"] });
      reset();
      setShowForm(false);
      showToast("Tạo giảng viên thành công");
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Tạo giảng viên thất bại", "error");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.admin.updateLecturer(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lecturers"] });
      showToast("Cập nhật trạng thái thành công");
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({ ...values, title: values.title || null });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Giảng viên</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            showForm
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Thêm giảng viên"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Thêm giảng viên mới">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField label="Mã giảng viên" error={errors.lecturerCode?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" {...register("lecturerCode")} autoComplete="off" />
            </FormField>
            <FormField label="Họ tên" error={errors.fullName?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" {...register("fullName")} autoComplete="off" />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" type="email" {...register("email")} autoComplete="new-email" />
            </FormField>
            <FormField label="Mật khẩu" error={errors.password?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" type="password" {...register("password")} autoComplete="new-password" />
            </FormField>
            <FormField label="Học vị" error={errors.title?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="VD: ThS., TS., PGS." {...register("title")} autoComplete="off" />
            </FormField>
            <FormField label="Khoa" error={errors.departmentId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("departmentId")}>
                <option value="">Chọn khoa</option>
                {(departmentsQuery.data || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FormField>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? "Đang tạo..." : "Tạo giảng viên"}
              </button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { reset(); setShowForm(false); }}>
                Huỷ
              </button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard
        title={`Danh sách (${(lecturersQuery.data || []).length})`}
        actions={
          <input
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            placeholder="Tìm mã hoặc tên..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        }
      >
        {(lecturersQuery.data || []).length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Chưa có giảng viên nào</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 font-medium">Mã GV</th>
                <th className="py-3 font-medium">Họ tên</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Khoa</th>
                <th className="py-3 font-medium">Trạng thái</th>
                <th className="py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(lecturersQuery.data || []).map((lecturer) => (
                <tr key={lecturer.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono text-xs">
                    <Link to={`/lecturers/${lecturer.id}`} className="hover:underline text-slate-900">
                      {lecturer.lecturerCode}
                    </Link>
                  </td>
                  <td className="py-3 font-medium">
                    <Link to={`/lecturers/${lecturer.id}`} className="hover:underline text-slate-900 flex items-center">
                      {lecturer.title && <span className="text-slate-400 mr-1">{lecturer.title}</span>}
                      {lecturer.user.fullName}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-500">{lecturer.user.email}</td>
                  <td className="py-3">{lecturer.department?.name}</td>
                  <td className="py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${lecturer.user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {lecturer.user.isActive ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      onClick={() => toggleActiveMutation.mutate({ id: lecturer.id, isActive: !lecturer.user.isActive })}
                    >
                      {lecturer.user.isActive ? "Khóa" : "Mở"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
