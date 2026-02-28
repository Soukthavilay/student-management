import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";

const departmentSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
});

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

const tabs = [
  { key: "departments", label: "Khoa" },
  { key: "classes", label: "Lớp học" },
  { key: "subjects", label: "Môn học" },
  { key: "sections", label: "Học phần" },
  { key: "schedules", label: "Lịch học" },
  { key: "exams", label: "Lịch thi" },
];

export default function AcademicsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("departments");
  const [showForm, setShowForm] = useState(false);

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => { const r = await api.admin.departments(); return r.data.data || []; },
  });
  const classGroupsQuery = useQuery({
    queryKey: ["class-groups-all"],
    queryFn: async () => { const r = await api.admin.classGroups(); return r.data.data || []; },
  });
  const subjectsQuery = useQuery({
    queryKey: ["subjects-all"],
    queryFn: async () => { const r = await api.admin.subjects(); return r.data.data || []; },
  });
  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async () => { const r = await api.admin.sections(); return r.data.data || []; },
  });
  const schedulesQuery = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => { const r = await api.admin.schedules(); return r.data.data || []; },
  });
  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: async () => { const r = await api.admin.exams(); return r.data.data || []; },
  });

  const makeMutation = (key, msg) => useMutation({
    mutationFn: (p) => api.admin[key](p),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowForm(false);
      showToast(msg);
    },
    onError: (e) => showToast(e?.response?.data?.message || "Thao tác thất bại", "error"),
  });

  const createDepartmentMutation = makeMutation("createDepartment", "Tạo khoa thành công");
  const createClassMutation = makeMutation("createClassGroup", "Tạo lớp thành công");
  const createSubjectMutation = makeMutation("createSubject", "Tạo môn học thành công");
  const createSectionMutation = makeMutation("createSection", "Tạo học phần thành công");
  const createScheduleMutation = makeMutation("createSchedule", "Tạo lịch học thành công");
  const createExamMutation = makeMutation("createExam", "Tạo lịch thi thành công");

  const departmentForm = useForm({ resolver: zodResolver(departmentSchema) });
  const classForm = useForm({ resolver: zodResolver(classSchema) });
  const subjectForm = useForm({ resolver: zodResolver(subjectSchema) });
  const sectionForm = useForm({ resolver: zodResolver(sectionSchema), defaultValues: { semester: "HK1", academicYear: "2025-2026" } });
  const scheduleForm = useForm({ resolver: zodResolver(scheduleSchema), defaultValues: { dayOfWeek: 2, startTime: "07:30", endTime: "09:30" } });
  const examForm = useForm({ resolver: zodResolver(examSchema), defaultValues: { examDate: "2026-06-10T08:00", type: "Final" } });

  const handleTabChange = (key) => { setActiveTab(key); setShowForm(false); };

  const formLabel = { departments: "khoa", classes: "lớp học", subjects: "môn học", sections: "học phần", schedules: "lịch học", exams: "lịch thi" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Quản lý đào tạo</h1>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : `Thêm ${formLabel[activeTab]}`}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DEPARTMENTS */}
      {activeTab === "departments" && (
        <>
          {showForm && (
            <TableCard title="Tạo khoa">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={departmentForm.handleSubmit(async (v) => { await createDepartmentMutation.mutateAsync(v); departmentForm.reset(); })}>
                <FormField label="Mã khoa" error={departmentForm.formState.errors.code?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...departmentForm.register("code")} />
                </FormField>
                <FormField label="Tên khoa" error={departmentForm.formState.errors.name?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...departmentForm.register("name")} />
                </FormField>
                <div className="md:col-span-2 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { departmentForm.reset(); setShowForm(false); }}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Khoa (${(departmentsQuery.data || []).length})`}>
            {(departmentsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có khoa nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Mã khoa</th><th className="py-3 font-medium">Tên khoa</th>
                </tr></thead>
                <tbody>{(departmentsQuery.data || []).map((d) => (
                  <tr key={d.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{d.code}</td><td className="py-3">{d.name}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* CLASSES */}
      {activeTab === "classes" && (
        <>
          {showForm && (
            <TableCard title="Tạo lớp học">
              <form className="grid gap-3 md:grid-cols-3" onSubmit={classForm.handleSubmit(async (v) => { await createClassMutation.mutateAsync(v); classForm.reset(); })}>
                <FormField label="Mã lớp" error={classForm.formState.errors.code?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...classForm.register("code")} />
                </FormField>
                <FormField label="Tên lớp" error={classForm.formState.errors.name?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...classForm.register("name")} />
                </FormField>
                <FormField label="Khoa" error={classForm.formState.errors.departmentId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...classForm.register("departmentId")}>
                    <option value="">Chọn khoa</option>
                    {(departmentsQuery.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-3 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { classForm.reset(); setShowForm(false); }}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Lớp học (${(classGroupsQuery.data || []).length})`}>
            {(classGroupsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có lớp học nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Mã lớp</th><th className="py-3 font-medium">Tên lớp</th><th className="py-3 font-medium">Khoa</th>
                </tr></thead>
                <tbody>{(classGroupsQuery.data || []).map((cg) => (
                  <tr key={cg.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{cg.code}</td><td className="py-3">{cg.name}</td><td className="py-3 text-slate-500">{cg.department?.name || "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* SUBJECTS */}
      {activeTab === "subjects" && (
        <>
          {showForm && (
            <TableCard title="Tạo môn học">
              <form className="grid gap-3 md:grid-cols-4" onSubmit={subjectForm.handleSubmit(async (v) => { await createSubjectMutation.mutateAsync(v); subjectForm.reset(); })}>
                <FormField label="Mã môn" error={subjectForm.formState.errors.code?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("code")} />
                </FormField>
                <FormField label="Tên môn" error={subjectForm.formState.errors.name?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("name")} />
                </FormField>
                <FormField label="Tín chỉ" error={subjectForm.formState.errors.credits?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" type="number" {...subjectForm.register("credits")} />
                </FormField>
                <FormField label="Khoa" error={subjectForm.formState.errors.departmentId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("departmentId")}>
                    <option value="">Chọn khoa</option>
                    {(departmentsQuery.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { subjectForm.reset(); setShowForm(false); }}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Môn học (${(subjectsQuery.data || []).length})`}>
            {(subjectsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có môn học nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Mã môn</th><th className="py-3 font-medium">Tên môn</th><th className="py-3 font-medium">Tín chỉ</th><th className="py-3 font-medium">Khoa</th>
                </tr></thead>
                <tbody>{(subjectsQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.code}</td><td className="py-3">{s.name}</td><td className="py-3">{s.credits}</td><td className="py-3 text-slate-500">{s.department?.name || "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* SECTIONS */}
      {activeTab === "sections" && (
        <>
          {showForm && (
            <TableCard title="Tạo học phần">
              <form className="grid gap-3 md:grid-cols-5" onSubmit={sectionForm.handleSubmit(async (v) => { await createSectionMutation.mutateAsync(v); sectionForm.reset({ semester: "HK1", academicYear: "2025-2026" }); })}>
                <FormField label="Mã HP" error={sectionForm.formState.errors.code?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("code")} />
                </FormField>
                <FormField label="Môn học" error={sectionForm.formState.errors.subjectId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("subjectId")}>
                    <option value="">Chọn môn</option>
                    {(subjectsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Lớp" error={sectionForm.formState.errors.classGroupId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("classGroupId")}>
                    <option value="">Chọn lớp</option>
                    {(classGroupsQuery.data || []).map((cg) => <option key={cg.id} value={cg.id}>{cg.code}</option>)}
                  </select>
                </FormField>
                <FormField label="Học kỳ" error={sectionForm.formState.errors.semester?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("semester")} />
                </FormField>
                <FormField label="Năm học" error={sectionForm.formState.errors.academicYear?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...sectionForm.register("academicYear")} />
                </FormField>
                <div className="md:col-span-5 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { sectionForm.reset(); setShowForm(false); }}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Học phần (${(sectionsQuery.data || []).length})`}>
            {(sectionsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có học phần nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Mã HP</th><th className="py-3 font-medium">Môn học</th><th className="py-3 font-medium">Lớp</th><th className="py-3 font-medium">Kỳ / Năm</th><th className="py-3 font-medium">Lịch học</th><th className="py-3 font-medium">Lịch thi</th>
                </tr></thead>
                <tbody>{(sectionsQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.code}</td>
                    <td className="py-3">{s.subject?.name}</td>
                    <td className="py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{s.classGroup?.code}</span></td>
                    <td className="py-3 text-slate-500">{s.semester} / {s.academicYear}</td>
                    <td className="py-3">{s._count?.schedules || 0}</td>
                    <td className="py-3">{s._count?.exams || 0}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* SCHEDULES */}
      {activeTab === "schedules" && (
        <>
          {showForm && (
            <TableCard title="Tạo lịch học">
              <form className="grid gap-3 md:grid-cols-5" onSubmit={scheduleForm.handleSubmit(async (v) => { await createScheduleMutation.mutateAsync({ ...v, room: v.room || null }); })}>
                <FormField label="Học phần" error={scheduleForm.formState.errors.sectionId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("sectionId")}>
                    <option value="">Chọn HP</option>
                    {(sectionsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code} - {s.subject?.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Thứ" error={scheduleForm.formState.errors.dayOfWeek?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...scheduleForm.register("dayOfWeek")}>
                    {[2,3,4,5,6,7,8].map((d) => <option key={d} value={d}>{d === 8 ? "CN" : `Thứ ${d}`}</option>)}
                  </select>
                </FormField>
                <FormField label="Bắt đầu" error={scheduleForm.formState.errors.startTime?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" type="time" {...scheduleForm.register("startTime")} />
                </FormField>
                <FormField label="Kết thúc" error={scheduleForm.formState.errors.endTime?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" type="time" {...scheduleForm.register("endTime")} />
                </FormField>
                <FormField label="Phòng" error={scheduleForm.formState.errors.room?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" placeholder="VD: A101" {...scheduleForm.register("room")} />
                </FormField>
                <div className="md:col-span-5 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setShowForm(false)}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Lịch học (${(schedulesQuery.data || []).length})`}>
            {(schedulesQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có lịch học nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Học phần</th><th className="py-3 font-medium">Lớp</th><th className="py-3 font-medium">Thời gian</th><th className="py-3 font-medium">Phòng</th>
                </tr></thead>
                <tbody>{(schedulesQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.section?.code} - {s.section?.subject?.name}</td>
                    <td className="py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{s.section?.classGroup?.code}</span></td>
                    <td className="py-3">Thứ {s.dayOfWeek === 8 ? "CN" : s.dayOfWeek}, {s.startTime} - {s.endTime}</td>
                    <td className="py-3 text-slate-500">{s.room || "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* EXAMS */}
      {activeTab === "exams" && (
        <>
          {showForm && (
            <TableCard title="Tạo lịch thi">
              <form className="grid gap-3 md:grid-cols-4" onSubmit={examForm.handleSubmit(async (v) => { await createExamMutation.mutateAsync({ ...v, examDate: new Date(v.examDate).toISOString(), room: v.room || null }); })}>
                <FormField label="Học phần" error={examForm.formState.errors.sectionId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...examForm.register("sectionId")}>
                    <option value="">Chọn HP</option>
                    {(sectionsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code} - {s.subject?.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Ngày thi" error={examForm.formState.errors.examDate?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" type="datetime-local" {...examForm.register("examDate")} />
                </FormField>
                <FormField label="Hình thức" error={examForm.formState.errors.type?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...examForm.register("type")}>
                    <option value="Midterm">Giữa kỳ</option>
                    <option value="Final">Cuối kỳ</option>
                  </select>
                </FormField>
                <FormField label="Phòng" error={examForm.formState.errors.room?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" placeholder="VD: B202" {...examForm.register("room")} />
                </FormField>
                <div className="md:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">Tạo</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setShowForm(false)}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Lịch thi (${(examsQuery.data || []).length})`}>
            {(examsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có lịch thi nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Học phần</th><th className="py-3 font-medium">Lớp</th><th className="py-3 font-medium">Ngày thi</th><th className="py-3 font-medium">Hình thức</th><th className="py-3 font-medium">Phòng</th>
                </tr></thead>
                <tbody>{(examsQuery.data || []).map((e) => (
                  <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{e.section?.code} - {e.section?.subject?.name}</td>
                    <td className="py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{e.section?.classGroup?.code}</span></td>
                    <td className="py-3">{new Date(e.examDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="py-3">{e.type === "Midterm" ? "Giữa kỳ" : "Cuối kỳ"}</td>
                    <td className="py-3 text-slate-500">{e.room || "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}
    </div>
  );
}
