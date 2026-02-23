import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";

const classSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  departmentId: z.coerce.number().int().positive(),
});

const subjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  credits: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
});

const sectionSchema = z.object({
  code: z.string().min(2),
  subjectId: z.coerce.number().int().positive(),
  classGroupId: z.coerce.number().int().positive(),
  semester: z.string().min(2),
  academicYear: z.string().min(4),
});

const scheduleSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  dayOfWeek: z.coerce.number().int().min(2).max(8),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  room: z.string().optional(),
});

const examSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  examDate: z.string().min(10),
  room: z.string().optional(),
  type: z.string().min(2),
});

export default function AcademicsPage() {
  const queryClient = useQueryClient();

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

  const subjectsQuery = useQuery({
    queryKey: ["subjects-all"],
    queryFn: async () => {
      const response = await api.admin.subjects();
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

  const createClassMutation = useMutation({
    mutationFn: (payload) => api.admin.createClassGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-groups-all"] });
      queryClient.invalidateQueries({ queryKey: ["class-groups"] });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (payload) => api.admin.createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-all"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: (payload) => api.admin.createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: (payload) => api.admin.createSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  const createExamMutation = useMutation({
    mutationFn: (payload) => api.admin.createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  const classForm = useForm({ resolver: zodResolver(classSchema) });
  const subjectForm = useForm({ resolver: zodResolver(subjectSchema) });
  const sectionForm = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      semester: "HK1",
      academicYear: "2025-2026",
    },
  });
  const scheduleForm = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dayOfWeek: 2,
      startTime: "07:30",
      endTime: "09:30",
    },
  });
  const examForm = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examDate: "2026-06-10T08:00",
      type: "Final",
    },
  });

  return (
    <div className="space-y-6">
      <TableCard title="Tạo lớp học">
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={classForm.handleSubmit(async (values) => {
            await createClassMutation.mutateAsync(values);
            classForm.reset();
          })}
        >
          <FormField label="Mã lớp" error={classForm.formState.errors.code?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...classForm.register("code")} />
          </FormField>
          <FormField label="Tên lớp" error={classForm.formState.errors.name?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...classForm.register("name")} />
          </FormField>
          <FormField label="Khoa" error={classForm.formState.errors.departmentId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...classForm.register("departmentId")}>
              <option value="">Chọn khoa</option>
              {(departmentsQuery.data || []).map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="md:col-span-3">
            <button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" type="submit">
              Tạo lớp
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard title="Tạo môn học">
        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={subjectForm.handleSubmit(async (values) => {
            await createSubjectMutation.mutateAsync(values);
            subjectForm.reset();
          })}
        >
          <FormField label="Mã môn" error={subjectForm.formState.errors.code?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("code")} />
          </FormField>
          <FormField label="Tên môn" error={subjectForm.formState.errors.name?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("name")} />
          </FormField>
          <FormField label="Số tín chỉ" error={subjectForm.formState.errors.credits?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" type="number" {...subjectForm.register("credits")} />
          </FormField>
          <FormField label="Khoa" error={subjectForm.formState.errors.departmentId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("departmentId")}>
              <option value="">Chọn khoa</option>
              {(departmentsQuery.data || []).map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="md:col-span-4">
            <button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" type="submit">
              Tạo môn học
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard title="Tạo học phần">
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={sectionForm.handleSubmit(async (values) => {
            await createSectionMutation.mutateAsync(values);
            sectionForm.reset({ semester: "HK1", academicYear: "2025-2026" });
          })}
        >
          <FormField label="Mã học phần" error={sectionForm.formState.errors.code?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("code")} />
          </FormField>
          <FormField label="Môn học" error={sectionForm.formState.errors.subjectId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("subjectId")}>
              <option value="">Chọn môn</option>
              {(subjectsQuery.data || []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Lớp" error={sectionForm.formState.errors.classGroupId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("classGroupId")}>
              <option value="">Chọn lớp</option>
              {(classGroupsQuery.data || []).map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.code}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Học kỳ" error={sectionForm.formState.errors.semester?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("semester")} />
          </FormField>
          <FormField label="Năm học" error={sectionForm.formState.errors.academicYear?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("academicYear")} />
          </FormField>
          <div className="md:col-span-5">
            <button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" type="submit">
              Tạo học phần
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard title="Tạo lịch học cho học phần">
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={scheduleForm.handleSubmit(async (values) => {
            await createScheduleMutation.mutateAsync({
              sectionId: values.sectionId,
              dayOfWeek: values.dayOfWeek,
              startTime: values.startTime,
              endTime: values.endTime,
              room: values.room || null,
            });
          })}
        >
          <FormField label="Học phần" error={scheduleForm.formState.errors.sectionId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("sectionId")}>
              <option value="">Chọn học phần</option>
              {(sectionsQuery.data || []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Thứ" error={scheduleForm.formState.errors.dayOfWeek?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" type="number" {...scheduleForm.register("dayOfWeek")} />
          </FormField>
          <FormField label="Bắt đầu (HH:mm)" error={scheduleForm.formState.errors.startTime?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("startTime")} />
          </FormField>
          <FormField label="Kết thúc (HH:mm)" error={scheduleForm.formState.errors.endTime?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("endTime")} />
          </FormField>
          <FormField label="Phòng" error={scheduleForm.formState.errors.room?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("room")} />
          </FormField>
          <div className="md:col-span-5">
            <button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" type="submit">
              Tạo lịch học
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard title="Tạo lịch thi cho học phần">
        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={examForm.handleSubmit(async (values) => {
            await createExamMutation.mutateAsync({
              sectionId: values.sectionId,
              examDate: new Date(values.examDate).toISOString(),
              room: values.room || null,
              type: values.type,
            });
          })}
        >
          <FormField label="Học phần" error={examForm.formState.errors.sectionId?.message}>
            <select className="rounded border border-slate-300 px-3 py-2" {...examForm.register("sectionId")}>
              <option value="">Chọn học phần</option>
              {(sectionsQuery.data || []).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Ngày thi" error={examForm.formState.errors.examDate?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" type="datetime-local" {...examForm.register("examDate")} />
          </FormField>
          <FormField label="Hình thức" error={examForm.formState.errors.type?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...examForm.register("type")} />
          </FormField>
          <FormField label="Phòng" error={examForm.formState.errors.room?.message}>
            <input className="rounded border border-slate-300 px-3 py-2" {...examForm.register("room")} />
          </FormField>
          <div className="md:col-span-4">
            <button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" type="submit">
              Tạo lịch thi
            </button>
          </div>
        </form>
      </TableCard>

      <TableCard title="Danh sách học phần">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Mã học phần</th>
              <th className="py-2">Môn học</th>
              <th className="py-2">Lớp</th>
              <th className="py-2">Kỳ/Năm</th>
              <th className="py-2">Lịch học</th>
              <th className="py-2">Lịch thi</th>
            </tr>
          </thead>
          <tbody>
            {(sectionsQuery.data || []).map((section) => (
              <tr key={section.id} className="border-t border-slate-100">
                <td className="py-2">{section.code}</td>
                <td className="py-2">{section.subject?.name}</td>
                <td className="py-2">{section.classGroup?.code}</td>
                <td className="py-2">
                  {section.semester} / {section.academicYear}
                </td>
                <td className="py-2">{section._count?.schedules || 0}</td>
                <td className="py-2">{section._count?.exams || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
