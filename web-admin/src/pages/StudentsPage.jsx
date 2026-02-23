import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  studentCode: z.string().min(2),
  departmentId: z.coerce.number().int().positive(),
  classGroupId: z.coerce.number().int().positive(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedDepartmentId = watch("departmentId");

  const studentsQuery = useQuery({
    queryKey: ["admin-students", keyword],
    queryFn: async () => {
      const response = await api.admin.students(keyword ? { q: keyword } : undefined);
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

  const classGroupsQuery = useQuery({
    queryKey: ["class-groups", selectedDepartmentId],
    queryFn: async () => {
      const response = await api.admin.classGroups(selectedDepartmentId || undefined);
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.admin.createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      reset();
      setShowForm(false);
      showToast("Tạo sinh viên thành công");
    },
    onError: (error) => {
      showToast(error?.response?.data?.message || "Tạo sinh viên thất bại", "error");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.admin.updateStudent(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      showToast("Cập nhật trạng thái thành công");
    },
  });

  const classOptions = useMemo(() => classGroupsQuery.data || [], [classGroupsQuery.data]);

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...values,
      phone: values.phone || null,
      address: values.address || null,
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Sinh viên</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            showForm
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Thêm sinh viên"}
        </button>
      </div>

      {showForm && (
        <TableCard title="Thêm sinh viên mới">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField label="Mã sinh viên" error={errors.studentCode?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" {...register("studentCode")} autoComplete="off" />
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
            <FormField label="Khoa" error={errors.departmentId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("departmentId")}>
                <option value="">Chọn khoa</option>
                {(departmentsQuery.data || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Lớp" error={errors.classGroupId?.message}>
              <select className="rounded border border-slate-300 px-3 py-2" {...register("classGroupId")}>
                <option value="">Chọn lớp</option>
                {classOptions.map((cg) => (
                  <option key={cg.id} value={cg.id}>{cg.code} - {cg.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Số điện thoại" error={errors.phone?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" {...register("phone")} autoComplete="off" />
            </FormField>
            <FormField label="Địa chỉ" error={errors.address?.message}>
              <input className="rounded border border-slate-300 px-3 py-2" {...register("address")} autoComplete="off" />
            </FormField>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? "Đang tạo..." : "Tạo sinh viên"}
              </button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { reset(); setShowForm(false); }}>
                Huỷ
              </button>
            </div>
          </form>
        </TableCard>
      )}

      <TableCard
        title={`Danh sách (${(studentsQuery.data || []).length})`}
        actions={
          <input
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            placeholder="Tìm mã hoặc tên..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        }
      >
        {(studentsQuery.data || []).length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Chưa có sinh viên nào</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 font-medium">Mã SV</th>
                <th className="py-3 font-medium">Họ tên</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Lớp</th>
                <th className="py-3 font-medium">Trạng thái</th>
                <th className="py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(studentsQuery.data || []).map((student) => (
                <tr key={student.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>
                  <td className="py-3 font-mono text-xs">{student.studentCode}</td>
                  <td className="py-3 font-medium">{student.user.fullName}</td>
                  <td className="py-3 text-slate-500">{student.user.email}</td>
                  <td className="py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{student.classGroup?.code}</span>
                  </td>
                  <td className="py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${student.user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {student.user.isActive ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActiveMutation.mutate({ id: student.id, isActive: !student.user.isActive });
                      }}
                    >
                      {student.user.isActive ? "Khóa" : "Mở"}
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
