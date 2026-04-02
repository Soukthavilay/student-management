import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import { showToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const departmentSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
});

const classSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  departmentId: z.coerce.number().int().positive(),
  majorId: z.coerce.number().int().positive(),
});

const subjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  credits: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  type: z.enum(["GENERAL", "SPECIALIZED"]),
});

const semesterSchema = z.object({
  name: z.string().min(2),
  academicYear: z.string().min(4),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  status: z.enum(["UPCOMING", "ENROLLMENT", "ONGOING", "COMPLETED"]),
});

const roomSchema = z.object({
  name: z.string().min(2),
  capacity: z.coerce.number().int().positive(),
  type: z.enum(["THEORY", "LAB"]),
});

const sectionSchema = z.object({
  code: z.string().min(2),
  subjectId: z.coerce.number().int().positive(),
  classGroupId: z.coerce.number().int().positive(),
  semesterId: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive().default(40),
});

const scheduleSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  dayOfWeek: z.coerce.number().int().min(2).max(8),
  shift: z.coerce.number().int().min(1).max(10).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  roomId: z.coerce.number().int().positive(),
});

const examSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  examDate: z.string().min(10),
  roomId: z.coerce.number().int().positive(),
  type: z.string().min(2),
});

const tabs = [
  { key: "departments", label: "Khoa" },
  { key: "semesters", label: "Học kỳ" },
  { key: "rooms", label: "Phòng học" },
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
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, deleteMutation: null });

  const departmentsQuery = useQuery({ queryKey: ["departments"], queryFn: async () => { const r = await api.admin.departments(); return r.data.data || []; } });
  const semestersQuery = useQuery({ queryKey: ["semesters"], queryFn: async () => { const r = await api.admin.semesters(); return r.data.data || []; } });
  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: async () => { const r = await api.admin.rooms(); return r.data.data || []; } });
  const majorsQuery = useQuery({ queryKey: ["majors-all"], queryFn: async () => { const r = await api.admin.majors(); return r.data.data || []; } });
  const classGroupsQuery = useQuery({ queryKey: ["class-groups-all"], queryFn: async () => { const r = await api.admin.classGroups(); return r.data.data || []; } });
  const subjectsQuery = useQuery({ queryKey: ["subjects-all"], queryFn: async () => { const r = await api.admin.subjects(); return r.data.data || []; } });
  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: async () => { const r = await api.admin.sections(); return r.data.data || []; } });
  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: async () => { const r = await api.admin.schedules(); return r.data.data || []; } });
  const examsQuery = useQuery({ queryKey: ["exams"], queryFn: async () => { const r = await api.admin.exams(); return r.data.data || []; } });

  const makeMutation = (key, msg) => useMutation({
    mutationFn: (p) => {
      // If p has id and payload, it's an update. If it's a primitive string/number, it's a delete. Else create.
      if (p?.id && p?.payload) return api.admin[key](p.id, p.payload);
      if (typeof p === "number" || typeof p === "string") return api.admin[key](p);
      return api.admin[key](p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowForm(false);
      setEditingItem(null);
      showToast(msg);
    },
    onError: (e) => showToast(e?.response?.data?.message || "Thao tác thất bại", "error"),
  });

  const createDepartmentMutation = makeMutation("createDepartment", "Tạo khoa thành công");
  const updateDepartmentMutation = makeMutation("updateDepartment", "Cập nhật khoa thành công");
  const deleteDepartmentMutation = makeMutation("deleteDepartment", "Xóa khoa thành công");

  const createSemesterMutation = makeMutation("createSemester", "Tạo học kỳ thành công");
  const updateSemesterMutation = makeMutation("updateSemester", "Cập nhật học kỳ thành công");
  const deleteSemesterMutation = makeMutation("deleteSemester", "Xóa học kỳ thành công");

  const createRoomMutation = makeMutation("createRoom", "Tạo phòng học thành công");
  const updateRoomMutation = makeMutation("updateRoom", "Cập nhật phòng học thành công");
  const deleteRoomMutation = makeMutation("deleteRoom", "Xóa phòng học thành công");

  const createClassMutation = makeMutation("createClassGroup", "Tạo lớp thành công");
  const updateClassMutation = makeMutation("updateClassGroup", "Cập nhật lớp thành công");
  const deleteClassMutation = makeMutation("deleteClassGroup", "Xóa lớp thành công");

  const createSubjectMutation = makeMutation("createSubject", "Tạo môn học thành công");
  const updateSubjectMutation = makeMutation("updateSubject", "Cập nhật môn học thành công");
  const deleteSubjectMutation = makeMutation("deleteSubject", "Xóa môn học thành công");

  const createSectionMutation = makeMutation("createSection", "Tạo học phần thành công");
  const updateSectionMutation = makeMutation("updateSection", "Cập nhật học phần thành công");
  const deleteSectionMutation = makeMutation("deleteSection", "Xóa học phần thành công");

  const createScheduleMutation = makeMutation("createSchedule", "Tạo lịch học thành công");
  const updateScheduleMutation = makeMutation("updateSchedule", "Cập nhật lịch học thành công");
  const deleteScheduleMutation = makeMutation("deleteSchedule", "Xóa lịch học thành công");

  const createExamMutation = makeMutation("createExam", "Tạo lịch thi thành công");
  const updateExamMutation = makeMutation("updateExam", "Cập nhật lịch thi thành công");
  const deleteExamMutation = makeMutation("deleteExam", "Xóa lịch thi thành công");

  const departmentForm = useForm({ resolver: zodResolver(departmentSchema) });
  const semesterForm = useForm({ resolver: zodResolver(semesterSchema), defaultValues: { status: "UPCOMING" } });
  const roomForm = useForm({ resolver: zodResolver(roomSchema), defaultValues: { type: "THEORY" } });
  const classForm = useForm({ resolver: zodResolver(classSchema) });
  const subjectForm = useForm({ resolver: zodResolver(subjectSchema), defaultValues: { type: "SPECIALIZED" } });
  const sectionForm = useForm({ resolver: zodResolver(sectionSchema), defaultValues: { capacity: 40 } });
  const scheduleForm = useForm({ resolver: zodResolver(scheduleSchema), defaultValues: { dayOfWeek: 2, shift: 1 } });
  const examForm = useForm({ resolver: zodResolver(examSchema), defaultValues: { type: "Cuối kỳ" } });

  const handleTabChange = (key) => { setActiveTab(key); setShowForm(false); setEditingItem(null); };

  const closeForm = (form) => {
    form.reset();
    setShowForm(false);
    setEditingItem(null);
  };

  const openEdit = (item, form, mapItemToForm) => {
    setEditingItem(item);
    form.reset(mapItemToForm ? mapItemToForm(item) : item);
    setShowForm(true);
  };

  const handleDelete = (e, id, deleteMutation) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ isOpen: true, id, deleteMutation });
  };

  const formLabel = { departments: "khoa", semesters: "học kỳ", rooms: "phòng học", classes: "lớp học", subjects: "môn học", sections: "học phần", schedules: "lịch học", exams: "lịch thi" };

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
            <TableCard title={editingItem ? "Sửa khoa" : "Tạo khoa"}>
              <form className="grid gap-3 md:grid-cols-2" onSubmit={departmentForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateDepartmentMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createDepartmentMutation.mutateAsync(v); 
                }
                closeForm(departmentForm);
              })}>
                <FormField label="Mã khoa" error={departmentForm.formState.errors.code?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...departmentForm.register("code")} />
                </FormField>
                <FormField label="Tên khoa" error={departmentForm.formState.errors.name?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...departmentForm.register("name")} />
                </FormField>
                <div className="md:col-span-2 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(departmentForm)}>Huỷ</button>
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
                  <th className="py-3 font-medium">Mã khoa</th><th className="py-3 font-medium">Tên khoa</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(departmentsQuery.data || []).map((d) => (
                  <tr key={d.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{d.code}</td><td className="py-3">{d.name}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit(d, departmentForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, d.id, deleteDepartmentMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* SEMESTERS */}
      {activeTab === "semesters" && (
        <>
          {showForm && (
            <TableCard title={editingItem ? "Sửa học kỳ" : "Tạo học kỳ"}>
              <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={semesterForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateSemesterMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createSemesterMutation.mutateAsync(v); 
                }
                closeForm(semesterForm);
              })}>
                <FormField label="Tên học kỳ (VD: HK1)" error={semesterForm.formState.errors.name?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...semesterForm.register("name")} />
                </FormField>
                <FormField label="Năm học (VD: 2025-2026)" error={semesterForm.formState.errors.academicYear?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...semesterForm.register("academicYear")} />
                </FormField>
                <FormField label="Trạng thái" error={semesterForm.formState.errors.status?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...semesterForm.register("status")}>
                    <option value="UPCOMING">Sắp tới (UPCOMING)</option>
                    <option value="ENROLLMENT">Đang đăng ký (ENROLLMENT)</option>
                    <option value="ONGOING">Đang học (ONGOING)</option>
                    <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                  </select>
                </FormField>
                <FormField label="Ngày bắt đầu" error={semesterForm.formState.errors.startDate?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="date" {...semesterForm.register("startDate")} />
                </FormField>
                <FormField label="Ngày kết thúc" error={semesterForm.formState.errors.endDate?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="date" {...semesterForm.register("endDate")} />
                </FormField>
                <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(semesterForm)}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Học kỳ (${(semestersQuery.data || []).length})`}>
            {(semestersQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có học kỳ nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Tên học kỳ</th><th className="py-3 font-medium">Năm học</th><th className="py-3 font-medium">Trạng thái</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(semestersQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{s.name}</td><td className="py-3">{s.academicYear}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        s.status === "ONGOING" ? "bg-green-100 text-green-700" :
                        s.status === "ENROLLMENT" ? "bg-blue-100 text-blue-700" :
                        s.status === "UPCOMING" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit(s, semesterForm, (item) => ({ ...item, startDate: item.startDate.split("T")[0], endDate: item.endDate.split("T")[0] })); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, s.id, deleteSemesterMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      {/* ROOMS */}
      {activeTab === "rooms" && (
        <>
          {showForm && (
            <TableCard title={editingItem ? "Sửa phòng học" : "Tạo phòng học"}>
              <form className="grid gap-3 md:grid-cols-3" onSubmit={roomForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateRoomMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createRoomMutation.mutateAsync(v); 
                }
                closeForm(roomForm);
              })}>
                <FormField label="Tên phòng" error={roomForm.formState.errors.name?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...roomForm.register("name")} />
                </FormField>
                <FormField label="Sức chứa" error={roomForm.formState.errors.capacity?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="number" {...roomForm.register("capacity")} />
                </FormField>
                <FormField label="Loại phòng" error={roomForm.formState.errors.type?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...roomForm.register("type")}>
                    <option value="THEORY">Lý thuyết (THEORY)</option>
                    <option value="LAB">Thực hành (LAB)</option>
                  </select>
                </FormField>
                <div className="md:col-span-3 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(roomForm)}>Huỷ</button>
                </div>
              </form>
            </TableCard>
          )}
          <TableCard title={`Phòng học (${(roomsQuery.data || []).length})`}>
            {(roomsQuery.data || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có phòng học nào</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 font-medium">Tên phòng</th><th className="py-3 font-medium">Sức chứa</th><th className="py-3 font-medium">Loại phòng</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(roomsQuery.data || []).map((r) => (
                  <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium">{r.name}</td><td className="py-3">{r.capacity}</td><td className="py-3 text-slate-500">{r.type}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit(r, roomForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, r.id, deleteRoomMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
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
            <TableCard title={editingItem ? "Sửa lớp học" : "Tạo lớp học"}>
              <form className="grid gap-3 md:grid-cols-4" onSubmit={classForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateClassMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createClassMutation.mutateAsync(v); 
                }
                closeForm(classForm);
              })}>
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
                <FormField label="Ngành" error={classForm.formState.errors.majorId?.message}>
                  <select className="rounded border border-slate-300 px-3 py-2" {...classForm.register("majorId")}>
                    <option value="">Chọn ngành</option>
                    {(majorsQuery.data || []).map((m) => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(classForm)}>Huỷ</button>
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
                  <th className="py-3 font-medium">Mã lớp</th><th className="py-3 font-medium">Tên lớp</th><th className="py-3 font-medium">Khoa</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(classGroupsQuery.data || []).map((cg) => (
                  <tr key={cg.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{cg.code}</td><td className="py-3">{cg.name}</td><td className="py-3 text-slate-500">{cg.department?.name || "-"}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit(cg, classForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, cg.id, deleteClassMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
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
            <TableCard title={editingItem ? "Sửa môn học" : "Tạo môn học"}>
              <form className="grid gap-3 md:grid-cols-4" onSubmit={subjectForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateSubjectMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createSubjectMutation.mutateAsync(v); 
                }
                closeForm(subjectForm);
              })}>
                <FormField label="Mã môn" error={subjectForm.formState.errors.code?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("code")} />
                </FormField>
                <FormField label="Tên môn" error={subjectForm.formState.errors.name?.message}>
                  <input className="rounded border border-slate-300 px-3 py-2" {...subjectForm.register("name")} />
                </FormField>
                <FormField label="Tín chỉ" error={subjectForm.formState.errors.credits?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="number" {...subjectForm.register("credits")} />
                </FormField>
                <FormField label="Loại môn học" error={subjectForm.formState.errors.type?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...subjectForm.register("type")}>
                    <option value="SPECIALIZED">Chuyên ngành (SPECIALIZED)</option>
                    <option value="GENERAL">Đại cương (GENERAL)</option>
                  </select>
                </FormField>
                <FormField label="Khoa" error={subjectForm.formState.errors.departmentId?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...subjectForm.register("departmentId")}>
                    <option value="">Chọn khoa</option>
                    {(departmentsQuery.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(subjectForm)}>Huỷ</button>
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
                  <th className="py-3 font-medium">Mã môn</th><th className="py-3 font-medium">Tên môn</th><th className="py-3 font-medium">Tín chỉ</th><th className="py-3 font-medium">Loại</th><th className="py-3 font-medium">Khoa</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(subjectsQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.code}</td><td className="py-3">{s.name}</td><td className="py-3 text-center">{s.credits}</td>
                    <td className="py-3 text-[10px] font-bold text-slate-500 uppercase">{s.type}</td>
                    <td className="py-3 text-slate-500">{s.department?.name || "-"}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit(s, subjectForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, s.id, deleteSubjectMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
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
            <TableCard title={editingItem ? "Sửa học phần" : "Tạo học phần"}>
              <form className="grid gap-3 md:grid-cols-5" onSubmit={sectionForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateSectionMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createSectionMutation.mutateAsync(v); 
                }
                closeForm(sectionForm);
              })}>
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
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...sectionForm.register("classGroupId")}>
                    <option value="">Chọn lớp</option>
                    {(classGroupsQuery.data || []).map((cg) => <option key={cg.id} value={cg.id}>{cg.code}</option>)}
                  </select>
                </FormField>
                <FormField label="Học kỳ" error={sectionForm.formState.errors.semesterId?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...sectionForm.register("semesterId")}>
                    <option value="">Chọn học kỳ</option>
                    {(semestersQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>)}
                  </select>
                </FormField>
                <FormField label="Sức chứa" error={sectionForm.formState.errors.capacity?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="number" {...sectionForm.register("capacity")} />
                </FormField>
                <div className="md:col-span-5 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => { sectionForm.reset({ semester: "HK1", academicYear: "2025-2026" }); setShowForm(false); setEditingItem(null); }}>Huỷ</button>
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
                  <th className="py-3 font-medium">Mã HP</th><th className="py-3 font-medium">Môn học</th><th className="py-3 font-medium">Lớp</th><th className="py-3 font-medium">Học kỳ</th><th className="py-3 font-medium">Lịch học</th><th className="py-3 font-medium">Lịch thi</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(sectionsQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.code}</td>
                    <td className="py-3 font-medium">{s.subject?.name}</td>
                    <td className="py-3 text-center"><span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">{s.classGroup?.code}</span></td>
                    <td className="py-3 text-slate-500">{s.semester?.name} ({s.semester?.academicYear})</td>
                    <td className="py-3">{s._count?.schedules || 0}</td>
                    <td className="py-3">{s._count?.exams || 0}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(evt) => { evt.preventDefault(); openEdit({ ...s, subjectId: s.subject?.id, classGroupId: s.classGroup?.id, semesterId: s.semester?.id }, sectionForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(evt) => handleDelete(evt, s.id, deleteSectionMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
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
            <TableCard title={editingItem ? "Sửa lịch học" : "Tạo lịch học"}>
              <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={scheduleForm.handleSubmit(async (v) => { 
                if (editingItem) {
                  await updateScheduleMutation.mutateAsync({ id: editingItem.id, payload: v });
                } else {
                  await createScheduleMutation.mutateAsync(v); 
                }
                closeForm(scheduleForm);
              })}>
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
                <FormField label="Tiết bắt đầu" error={scheduleForm.formState.errors.shift?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" type="number" {...scheduleForm.register("shift")} />
                </FormField>
                <FormField label="Giờ (Tùy chọn)" error={scheduleForm.formState.errors.startTime?.message}>
                  <div className="flex items-center gap-2">
                    <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm" type="time" {...scheduleForm.register("startTime")} />
                    <span>-</span>
                    <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm" type="time" {...scheduleForm.register("endTime")} />
                  </div>
                </FormField>
                <FormField label="Phòng" error={scheduleForm.formState.errors.roomId?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...scheduleForm.register("roomId")}>
                    <option value="">Chọn phòng</option>
                    {(roomsQuery.data || []).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-2 lg:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(scheduleForm)}>Huỷ</button>
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
                  <th className="py-3 font-medium">Học phần</th><th className="py-3 font-medium">Lớp</th><th className="py-3 font-medium">Thời gian</th><th className="py-3 font-medium">Phòng</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(schedulesQuery.data || []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{s.section?.code} - {s.section?.subject?.name}</td>
                    <td className="py-3 text-center"><span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">{s.section?.classGroup?.code}</span></td>
                    <td className="py-3">Thứ {s.dayOfWeek === 8 ? "CN" : s.dayOfWeek}, Tiết {s.shift} {s.startTime && `(${s.startTime}-${s.endTime})`}</td>
                    <td className="py-3 font-medium">{s.room?.name || "-"}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(e) => { e.preventDefault(); openEdit({ ...s, roomId: s.room?.id }, scheduleForm); }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(e) => handleDelete(e, s.id, deleteScheduleMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
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
            <TableCard title={editingItem ? "Sửa lịch thi" : "Tạo lịch thi"}>
              <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={examForm.handleSubmit(async (v) => { 
                const payload = { ...v, examDate: new Date(v.examDate).toISOString() };
                if (editingItem && editingItem.id) {
                  await updateExamMutation.mutateAsync({ id: Number(editingItem.id), payload });
                } else {
                  await createExamMutation.mutateAsync(payload); 
                }
                closeForm(examForm);
              })}>
                <FormField label="Học phần" error={examForm.formState.errors.sectionId?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" {...examForm.register("sectionId")}>
                    <option value="">Chọn HP</option>
                    {(sectionsQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.code} - {s.subject?.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Ngày thi" error={examForm.formState.errors.examDate?.message}>
                  <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm" type="datetime-local" {...examForm.register("examDate")} />
                </FormField>
                <FormField label="Hình thức" error={examForm.formState.errors.type?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" {...examForm.register("type")}>
                    <option value="Midterm">Giữa kỳ</option>
                    <option value="Final">Cuối kỳ</option>
                  </select>
                </FormField>
                <FormField label="Phòng" error={examForm.formState.errors.roomId?.message}>
                  <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" {...examForm.register("roomId")}>
                    <option value="">Chọn phòng</option>
                    {(roomsQuery.data || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-2 lg:col-span-4 flex gap-3">
                  <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" type="submit">{editingItem ? "Cập nhật" : "Tạo"}</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => closeForm(examForm)}>Huỷ</button>
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
                  <th className="py-3 font-medium">Học phần</th><th className="py-3 font-medium text-center">Lớp</th><th className="py-3 font-medium">Ngày thi</th><th className="py-3 font-medium">Hình thức</th><th className="py-3 font-medium">Phòng</th><th className="py-3 font-medium text-right">Thao tác</th>
                </tr></thead>
                <tbody>{(examsQuery.data || []).map((e) => (
                  <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs">{e.section?.code} - {e.section?.subject?.name}</td>
                    <td className="py-3 text-center"><span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">{e.section?.classGroup?.code}</span></td>
                    <td className="py-3">{new Date(e.examDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="py-3 font-medium text-slate-600">{e.type === "Midterm" ? "Giữa kỳ" : "Cuối kỳ"}</td>
                    <td className="py-3 font-medium">{e.room?.name || "-"}</td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(evt) => { 
                        evt.preventDefault(); 
                        openEdit(e, examForm, (item) => {
                          let formattedDate = "";
                          if (item.examDate) {
                             const d = new Date(item.examDate);
                             if (!isNaN(d.getTime())) {
                                formattedDate = d.toISOString().substring(0, 16);
                             }
                          }
                          return { ...item, roomId: item.room?.id, examDate: formattedDate };
                        }); 
                      }} className="text-blue-600 hover:text-blue-800 mr-3 font-medium text-xs uppercase tracking-wide">Sửa</button>
                      <button type="button" onClick={(evt) => handleDelete(evt, e.id, deleteExamMutation)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide">Xóa</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </TableCard>
        </>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa dữ liệu này? Hành động này không thể hoàn tác."
        onConfirm={() => {
          if (confirmDelete.deleteMutation && confirmDelete.id) {
            confirmDelete.deleteMutation.mutateAsync(confirmDelete.id);
          }
          setConfirmDelete({ isOpen: false, id: null, deleteMutation: null });
        }}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, deleteMutation: null })}
      />
    </div>
  );
}
