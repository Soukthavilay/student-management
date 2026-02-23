import { useMemo, useState } from "react";
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
  studentCode: z.string().min(2),
  departmentId: z.coerce.number().int().positive(),
  classGroupId: z.coerce.number().int().positive(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");

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
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.admin.updateStudent(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
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
      <TableCard title="Thêm sinh viên">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <FormField label="Mã sinh viên" error={errors.studentCode?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("studentCode")} />
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
          <FormField label="Lớp" error={errors.classGroupId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...register("classGroupId")}>
              <option value="">Chọn lớp</option>
              {classOptions.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.code} - {classGroup.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Số điện thoại" error={errors.phone?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("phone")} />
          </FormField>
          <FormField label="Địa chỉ" error={errors.address?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...register("address")} />
          </FormField>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Đang tạo..." : "Tạo sinh viên"}
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard
        title="Danh sách sinh viên"
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
              <th className="py-2">Mã SV</th>
              <th className="py-2">Họ tên</th>
              <th className="py-2">Email</th>
              <th className="py-2">Lớp</th>
              <th className="py-2">Trạng thái</th>
              <th className="py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {(studentsQuery.data || []).map((student) => (
              <tr key={student.id} className="border-t border-slate-100">
                <td className="py-2">{student.studentCode}</td>
                <td className="py-2">{student.user.fullName}</td>
                <td className="py-2">{student.user.email}</td>
                <td className="py-2">{student.classGroup?.code}</td>
                <td className="py-2">{student.user.isActive ? "Hoạt động" : "Khóa"}</td>
                <td className="py-2">
                  <button
                    type="button"
                    className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: student.id,
                        isActive: !student.user.isActive,
                      })
                    }
                  >
                    {student.user.isActive ? "Khóa" : "Mở"}
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
