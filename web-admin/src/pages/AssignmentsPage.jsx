import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";

const schema = z.object({
  sectionId: z.coerce.number().int().positive(),
  lecturerId: z.coerce.number().int().positive(),
});

export default function AssignmentsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const response = await api.admin.sections();
      return response.data.data || [];
    },
  });

  const lecturersQuery = useQuery({
    queryKey: ["admin-lecturers"],
    queryFn: async () => {
      const response = await api.admin.lecturers();
      return response.data.data || [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: (payload) => api.admin.assignLecturer(payload),
    onSuccess: () => reset(),
  });

  const onSubmit = handleSubmit(async (values) => {
    await assignMutation.mutateAsync(values);
  });

  return (
    <TableCard title="Phân công giảng viên cho học phần">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <FormField label="Học phần" error={errors.sectionId?.message}>
          <select className="rounded border border-slate-300 px-3 py-2" {...register("sectionId")}>
            <option value="">Chọn học phần</option>
            {(sectionsQuery.data || []).map((section) => (
              <option key={section.id} value={section.id}>
                {section.code} - {section.subject?.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Giảng viên" error={errors.lecturerId?.message}>
          <select className="rounded border border-slate-300 px-3 py-2" {...register("lecturerId")}>
            <option value="">Chọn giảng viên</option>
            {(lecturersQuery.data || []).map((lecturer) => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.lecturerCode} - {lecturer.user?.fullName}
              </option>
            ))}
          </select>
        </FormField>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            disabled={isSubmitting || assignMutation.isPending}
          >
            {assignMutation.isPending ? "Đang lưu..." : "Lưu phân công"}
          </button>
        </div>
      </form>

      {assignMutation.isSuccess ? (
        <p className="mt-3 text-sm text-emerald-700">Phân công thành công.</p>
      ) : null}
      {assignMutation.isError ? (
        <p className="mt-3 text-sm text-rose-600">
          {assignMutation.error?.response?.data?.message || "Phân công thất bại"}
        </p>
      ) : null}
    </TableCard>
  );
}
