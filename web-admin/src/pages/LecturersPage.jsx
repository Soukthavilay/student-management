import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

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
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.admin.updateLecturer(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lecturers"] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...values,
      title: values.title || null,
    });
  });

  return (
    <div className="space-y-6">
      <TableCard title="Thêm giảng viên">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <FormField label="Mã giảng viên" error={errors.lecturerCode?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("lecturerCode")} />
          </FormField>
          <FormField label="Họ tên" error={errors.fullName?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("fullName")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" type="email" {...register("email")} />
          </FormField>
          <FormField label="Mật khẩu" error={errors.password?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" type="password" {...register("password")} />
          </FormField>
          <FormField label="Học vị" error={errors.title?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("title")} />
          </FormField>
          <FormField label="Khoa" error={errors.departmentId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...register("departmentId")}>
              <option value="">Chọn khoa</option>
              {(departmentsQuery.data || []).map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Đang tạo..." : "Tạo giảng viên"}
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard
        title="Danh sách giảng viên"
        actions={
          <input
            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
            placeholder="Tìm mã hoặc tên"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        }
      >
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Mã GV</th>
              <th className="py-2">Họ tên</th>
              <th className="py-2">Email</th>
              <th className="py-2">Khoa</th>
              <th className="py-2">Trạng thái</th>
              <th className="py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {(lecturersQuery.data || []).map((lecturer) => (
              <tr key={lecturer.id} className="border-t border-slate-100">
                <td className="py-2">{lecturer.lecturerCode}</td>
                <td className="py-2">{lecturer.user.fullName}</td>
                <td className="py-2">{lecturer.user.email}</td>
                <td className="py-2">{lecturer.department?.name}</td>
                <td className="py-2">{lecturer.user.isActive ? "Hoạt động" : "Khóa"}</td>
                <td className="py-2">
                  <button
                    type="button"
                    className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: lecturer.id,
                        isActive: !lecturer.user.isActive,
                      })
                    }
                  >
                    {lecturer.user.isActive ? "Khóa" : "Mở"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
