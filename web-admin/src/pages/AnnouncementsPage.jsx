import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormField from "../components/FormField";
import TableCard from "../components/TableCard";

const schema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  scope: z.enum(["ALL", "DEPARTMENT", "CLASS", "SECTION"]),
  departmentId: z.string().optional(),
  classGroupId: z.string().optional(),
  sectionId: z.string().optional(),
});

export default function AnnouncementsPage() {
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      scope: "ALL",
    },
  });

  const scope = watch("scope");

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.admin.departments();
      return response.data.data || [];
    },
  });

  const classGroupsQuery = useQuery({
    queryKey: ["class-groups-all"],
    queryFn: async () => {
      const response = await api.admin.classGroups();
      return response.data.data || [];
    },
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const response = await api.admin.sections();
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.admin.createAnnouncement(payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      title: values.title,
      content: values.content,
      scope: values.scope,
      departmentId: values.departmentId ? Number(values.departmentId) : null,
      classGroupId: values.classGroupId ? Number(values.classGroupId) : null,
      sectionId: values.sectionId ? Number(values.sectionId) : null,
    });

    reset({
      title: "",
      content: "",
      scope: "ALL",
      departmentId: "",
      classGroupId: "",
      sectionId: "",
    });
  });

  return (
    <TableCard title="Tạo thông báo">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <FormField label="Tiêu đề" error={errors.title?.message}>
          <input className="rounded border border-slate-300 px-3 py-2" {...register("title")} />
        </FormField>

        <FormField label="Phạm vi" error={errors.scope?.message}>
          <select className="rounded border border-slate-300 px-3 py-2" {...register("scope")}>
            <option value="ALL">Toàn trường</option>
            <option value="DEPARTMENT">Theo khoa</option>
            <option value="CLASS">Theo lớp</option>
            <option value="SECTION">Theo học phần</option>
          </select>
        </FormField>

        {scope === "DEPARTMENT" ? (
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
        ) : null}

        {scope === "CLASS" ? (
          <FormField label="Lớp" error={errors.classGroupId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...register("classGroupId")}>
              <option value="">Chọn lớp</option>
              {(classGroupsQuery.data || []).map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.code} - {classGroup.name}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        {scope === "SECTION" ? (
          <FormField label="Học phần" error={errors.sectionId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...register("sectionId")}>
              <option value="">Chọn học phần</option>
              {(sectionsQuery.data || []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        <div className="md:col-span-2">
          <FormField label="Nội dung" error={errors.content?.message}>
            <textarea className="min-h-28 rounded border border-slate-300 px-3 py-2" {...register("content")} />
          </FormField>
        </div>

        <div className="md:col-span-2 space-y-2">
          <button
            type="submit"
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            disabled={isSubmitting || createMutation.isPending}
          >
            {createMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </button>

          {createMutation.isSuccess ? (
            <p className="text-sm text-emerald-700">Tạo thông báo thành công.</p>
          ) : null}
          {createMutation.isError ? (
            <p className="text-sm text-rose-600">
              {createMutation.error?.response?.data?.message || "Tạo thông báo thất bại"}
            </p>
          ) : null}
        </div>
      </form>
    </TableCard>
  );
}
