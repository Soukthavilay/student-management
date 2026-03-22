import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import TableCard from "../components/TableCard";
import FormField from "../components/FormField";
import ConfirmModal from "../components/ConfirmModal";
import { showToast } from "../components/Toast";

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [curriculumName, setCurriculumName] = useState("");
  const [totalSemesters, setTotalSemesters] = useState(8);
  const [addSubjectForm, setAddSubjectForm] = useState({ semester: "", subjectId: "" });
  const [showAddSubject, setShowAddSubject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const [enrollForm, setEnrollForm] = useState({ studentId: "", curriculumSemester: "", semesterId: "" });
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => { const r = await api.admin.departments(); return r.data.data || []; },
  });

  const curriculumQuery = useQuery({
    queryKey: ["curriculum", selectedDeptId],
    queryFn: async () => {
      if (!selectedDeptId) return null;
      const r = await api.admin.getCurriculum(selectedDeptId);
      return r.data.data;
    },
    enabled: !!selectedDeptId,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects-dept", selectedDeptId],
    queryFn: async () => {
      if (!selectedDeptId) return [];
      const r = await api.admin.subjects(selectedDeptId);
      return r.data.data || [];
    },
    enabled: !!selectedDeptId,
  });

  const studentsQuery = useQuery({
    queryKey: ["students-all"],
    queryFn: async () => { const r = await api.admin.students({ pageSize: 1000 }); return r.data.data || []; },
  });

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => { const r = await api.admin.semesters(); return r.data.data || []; },
  });

  const upsertCurriculumMutation = useMutation({
    mutationFn: (payload) => api.admin.upsertCurriculum(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      setShowCurriculumForm(false);
      showToast("Lưu chương trình đào tạo thành công");
    },
    onError: (e) => showToast(e?.response?.data?.message || "Thao tác thất bại", "error"),
  });

  const addSubjectMutation = useMutation({
    mutationFn: (payload) => api.admin.addCurriculumSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      setShowAddSubject(null);
      setAddSubjectForm({ semester: "", subjectId: "" });
      showToast("Thêm môn học thành công");
    },
    onError: (e) => showToast(e?.response?.data?.message || "Thao tác thất bại", "error"),
  });

  const removeSubjectMutation = useMutation({
    mutationFn: (id) => api.admin.removeCurriculumSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      showToast("Xóa môn học thành công");
    },
    onError: (e) => showToast(e?.response?.data?.message || "Thao tác thất bại", "error"),
  });

  const enrollMutation = useMutation({
    mutationFn: (payload) => api.admin.enrollBySemester(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      setShowEnrollForm(false);
      setEnrollForm({ studentId: "", curriculumSemester: "", semesterId: "" });
      const count = res.data?.data?.enrolledCount || 0;
      showToast(`Đăng ký thành công ${count} học phần`);
    },
    onError: (e) => showToast(e?.response?.data?.message || "Đăng ký thất bại", "error"),
  });

  const curriculum = curriculumQuery.data;
  const departments = departmentsQuery.data || [];
  const subjects = subjectsQuery.data || [];

  const semesterCount = curriculum?.totalSemesters || 4;
  const subjectsBySemester = {};
  for (let i = 1; i <= semesterCount; i++) subjectsBySemester[i] = [];
  if (curriculum?.subjects) {
    curriculum.subjects.forEach((cs) => {
      if (subjectsBySemester[cs.semester]) {
        subjectsBySemester[cs.semester].push(cs);
      }
    });
  }

  const assignedSubjectIds = new Set(curriculum?.subjects?.map((cs) => cs.subjectId) || []);
  const availableSubjects = subjects.filter((s) => !assignedSubjectIds.has(s.id));

  const totalCredits = curriculum?.subjects?.reduce((sum, cs) => sum + (cs.subject?.credits || 0), 0) || 0;

  const handleDeptChange = (deptId) => {
    setSelectedDeptId(deptId);
    setShowCurriculumForm(false);
    setShowAddSubject(null);
    setShowEnrollForm(false);
  };

  const openCurriculumForm = () => {
    setCurriculumName(
      curriculum?.name || `CTĐT ${departments.find((d) => d.id === Number(selectedDeptId))?.name || ""}`
    );
    setTotalSemesters(curriculum?.totalSemesters || 8);
    setShowCurriculumForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Chương trình đào tạo</h1>
        <div className="flex gap-3">
          {selectedDeptId && (
            <>
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                onClick={openCurriculumForm}
              >
                {curriculum ? "Chỉnh sửa CTĐT" : "Tạo CTĐT"}
              </button>

              <button
                type="button"
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                onClick={() => setShowEnrollForm(!showEnrollForm)}
              >
                {showEnrollForm ? "Đóng đăng ký" : "Đăng ký học"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Department Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Chọn khoa:</label>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm min-w-[250px]"
          value={selectedDeptId}
          onChange={(e) => handleDeptChange(e.target.value)}
        >
          <option value="">-- Chọn khoa --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
          ))}
        </select>
      </div>

      {!selectedDeptId && (
        <div className="py-20 text-center text-sm text-slate-400">
          Vui lòng chọn một khoa để xem chương trình đào tạo
        </div>
      )}

      {/* Enroll by Semester Form */}
      {showEnrollForm && selectedDeptId && (
        <TableCard title="Đăng ký học theo kỳ">
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              enrollMutation.mutate({
                studentId: Number(enrollForm.studentId),
                curriculumSemester: Number(enrollForm.curriculumSemester),
                semesterId: Number(enrollForm.semesterId),
              });
            }}
          >
            <FormField label="Sinh viên">
              <select
                className="rounded border border-slate-300 px-3 py-2"
                value={enrollForm.studentId}
                onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                required
              >
                <option value="">Chọn sinh viên</option>
                {(studentsQuery.data || [])
                  .filter((s) => s.departmentId === Number(selectedDeptId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentCode} - {s.user?.fullName}
                    </option>
                  ))}
              </select>
            </FormField>
            <FormField label="Kỳ (CTĐT)">
              <select
                className="rounded border border-slate-300 px-3 py-2"
                value={enrollForm.curriculumSemester}
                onChange={(e) => setEnrollForm({ ...enrollForm, curriculumSemester: e.target.value })}
                required
              >
                <option value="">Chọn kỳ</option>
                {Array.from({ length: semesterCount }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>Kỳ {s}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Học kỳ thực tế">
              <select
                className="rounded border border-slate-300 px-3 py-2"
                value={enrollForm.semesterId}
                onChange={(e) => setEnrollForm({ ...enrollForm, semesterId: e.target.value })}
                required
              >
                <option value="">Chọn học kỳ</option>
                {(semestersQuery.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.academicYear})
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={enrollMutation.isPending}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {enrollMutation.isPending ? "Đang xử lý..." : "Đăng ký học"}
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Hệ thống sẽ tự động tìm các học phần (section) đã mở cho kỳ và năm học tương ứng, rồi đăng ký sinh viên vào tất cả.
          </p>
        </TableCard>
      )}

      {selectedDeptId && (
        <>
          {/* Curriculum Info */}
          <TableCard
            title={
              curriculum
                ? `${curriculum.name} (${curriculum.subjects?.length || 0} môn - ${totalCredits} tín chỉ)`
                : "Chưa có chương trình đào tạo"
            }
          >
            {!curriculum && !showCurriculumForm && (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500 mb-3">Khoa này chưa có chương trình đào tạo</p>
                <button
                  type="button"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                  onClick={openCurriculumForm}
                >
                  Tạo chương trình đào tạo
                </button>
              </div>
            )}

            {curriculum && !showCurriculumForm && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{semesterCount} kỳ</span>
                  <span className="mx-2">|</span>
                  <span>{curriculum.subjects?.length || 0} môn học</span>
                  <span className="mx-2">|</span>
                  <span>{totalCredits} tín chỉ</span>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                  onClick={openCurriculumForm}
                >
                  Chỉnh sửa
                </button>
              </div>
            )}

            {showCurriculumForm && (
              <form
                className="grid gap-3 md:grid-cols-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  upsertCurriculumMutation.mutate({
                    departmentId: Number(selectedDeptId),
                    name: curriculumName,
                    totalSemesters,
                  });
                }}
              >
                <FormField label="Tên CTĐT">
                  <input
                    className="rounded border border-slate-300 px-3 py-2"
                    value={curriculumName}
                    onChange={(e) => setCurriculumName(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Số kỳ">
                  <input
                    className="rounded border border-slate-300 px-3 py-2"
                    type="number"
                    min={1}
                    max={12}
                    value={totalSemesters}
                    onChange={(e) => setTotalSemesters(Number(e.target.value))}
                    required
                  />
                </FormField>
                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    disabled={upsertCurriculumMutation.isPending}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    onClick={() => setShowCurriculumForm(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </TableCard>

          {/* Semester Cards */}
          {curriculum && Array.from({ length: semesterCount }, (_, i) => i + 1).map((sem) => (
            <TableCard
              key={sem}
              title={`Kỳ ${sem} (${subjectsBySemester[sem]?.length || 0} môn - ${subjectsBySemester[sem]?.reduce((s, cs) => s + (cs.subject?.credits || 0), 0) || 0} TC)`}
            >
              {subjectsBySemester[sem]?.length > 0 ? (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 font-medium">Mã môn</th>
                      <th className="py-3 font-medium">Tên môn</th>
                      <th className="py-3 font-medium">Tín chỉ</th>
                      <th className="py-3 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectsBySemester[sem].map((cs) => (
                      <tr key={cs.id} className="border-t border-slate-50 hover:bg-slate-50">
                        <td className="py-3 font-mono text-xs">{cs.subject?.code}</td>
                        <td className="py-3">{cs.subject?.name}</td>
                        <td className="py-3">{cs.subject?.credits}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ isOpen: true, id: cs.id })}
                            className="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">Chưa có môn học nào</p>
              )}

              {/* Add Subject to Semester */}
              {showAddSubject === sem ? (
                <form
                  className="mt-3 flex items-end gap-3 border-t border-slate-100 pt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSubjectMutation.mutate({
                      curriculumId: curriculum.id,
                      subjectId: Number(addSubjectForm.subjectId),
                      semester: sem,
                    });
                  }}
                >
                  <div className="flex-1">
                    <select
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      value={addSubjectForm.subjectId}
                      onChange={(e) => setAddSubjectForm({ ...addSubjectForm, subjectId: e.target.value })}
                      required
                    >
                      <option value="">Chọn môn học</option>
                      {availableSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name} ({s.credits} TC)
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={addSubjectMutation.isPending}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    onClick={() => { setShowAddSubject(null); setAddSubjectForm({ semester: "", subjectId: "" }); }}
                  >
                    Huỷ
                  </button>
                </form>
              ) : (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-800"
                    onClick={() => setShowAddSubject(sem)}
                  >
                    + Thêm môn học vào kỳ {sem}
                  </button>
                </div>
              )}
            </TableCard>
          ))}
        </>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa môn học này khỏi chương trình đào tạo?"
        onConfirm={() => {
          if (confirmDelete.id) {
            removeSubjectMutation.mutate(confirmDelete.id);
          }
          setConfirmDelete({ isOpen: false, id: null });
        }}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
