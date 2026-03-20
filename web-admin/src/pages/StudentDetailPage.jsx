import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function SemesterTable({ semester, curriculumSubjects, enrollments, allEnrollments }) {
  // Find enrollments for this semester's subjects
  const semesterEnrollments = curriculumSubjects.map(cs => {
    const enrollment = enrollments.find(e => e.section?.subject?.id === cs.subject.id);
    return {
      curriculumSubject: cs,
      enrollment: enrollment || null,
    };
  });

  // Also include enrollments that don't match curriculum (electives or extras)
  const extraEnrollments = enrollments.filter(e => 
    !curriculumSubjects.some(cs => cs.subject.id === e.section?.subject?.id)
  );

  const totalCredits = semesterEnrollments
    .filter(e => e.enrollment)
    .reduce((sum, e) => sum + (e.enrollment.section?.subject?.credits || 0), 0);

  const gradedEnrollments = semesterEnrollments.filter(e => e.enrollment?.grade);
  const semesterGPA = gradedEnrollments.length > 0
    ? (gradedEnrollments.reduce((s, e) => s + (e.enrollment.grade?.gpaPoint || 0) * (e.enrollment.section?.subject?.credits || 0), 0) /
       gradedEnrollments.reduce((s, e) => s + (e.enrollment.section?.subject?.credits || 0), 0)).toFixed(2)
    : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Học kỳ {semester}</span>
          <span className="text-xs text-slate-500">
            {semesterEnrollments.filter(e => e.enrollment).length}/{semesterEnrollments.length} môn học
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">
            Tín chỉ: <span className="font-medium text-slate-700">{totalCredits}</span>
          </span>
          {semesterGPA && (
            <span className="text-slate-500">
              GPA: <span className="font-medium text-slate-700">{semesterGPA}</span>
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 bg-slate-50/50">
              <th className="px-5 py-3 font-medium">Mã môn</th>
              <th className="px-5 py-3 font-medium">Tên môn học</th>
              <th className="px-5 py-3 font-medium">Tín chỉ</th>
              <th className="px-5 py-3 font-medium">Học phần</th>
              <th className="px-5 py-3 font-medium">Điểm</th>
              <th className="px-5 py-3 font-medium">GPA</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {semesterEnrollments.map(({ curriculumSubject, enrollment }) => (
              <tr key={curriculumSubject.subject.id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{curriculumSubject.subject.code}</td>
                <td className="px-5 py-3">
                  <span className="font-medium text-slate-800">{curriculumSubject.subject.name}</span>
                </td>
                <td className="px-5 py-3 text-slate-600">{curriculumSubject.subject.credits}</td>
                <td className="px-5 py-3">
                  {enrollment ? (
                    <span className="font-mono text-xs text-slate-600">{enrollment.section?.code}</span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-5 py-3 font-medium">
                  {enrollment?.grade ? enrollment.grade.finalScore?.toFixed(1) : "-"}
                </td>
                <td className="px-5 py-3 font-medium">
                  {enrollment?.grade ? enrollment.grade.gpaPoint?.toFixed(1) : "-"}
                </td>
                <td className="px-5 py-3">
                  {!enrollment ? (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">
                      Chưa đăng ký
                    </span>
                  ) : enrollment.grade?.status === "PASSED" ? (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                      Đạt
                    </span>
                  ) : enrollment.grade?.status === "FAILED" ? (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700">
                      Không đạt
                    </span>
                  ) : (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                      Đang học
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExtraCoursesTable({ enrollments }) {
  if (enrollments.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between bg-amber-50 px-5 py-3 border-b border-amber-200">
        <span className="text-sm font-semibold text-amber-800">Môn học ngoài chương trình</span>
        <span className="text-xs text-amber-600">{enrollments.length} môn học</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 bg-slate-50/50">
              <th className="px-5 py-3 font-medium">Mã HP</th>
              <th className="px-5 py-3 font-medium">Môn học</th>
              <th className="px-5 py-3 font-medium">Tín chỉ</th>
              <th className="px-5 py-3 font-medium">Kỳ / Năm</th>
              <th className="px-5 py-3 font-medium">Điểm</th>
              <th className="px-5 py-3 font-medium">GPA</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{e.section?.code}</td>
                <td className="px-5 py-3">
                  <span className="font-medium text-slate-800">{e.section?.subject?.name}</span>
                  <span className="ml-1 text-xs text-slate-400">{e.section?.subject?.code}</span>
                </td>
                <td className="px-5 py-3 text-slate-600">{e.section?.subject?.credits}</td>
                <td className="px-5 py-3 text-slate-500">{e.section?.semester} / {e.section?.academicYear}</td>
                <td className="px-5 py-3 font-medium">{e.grade ? e.grade.finalScore?.toFixed(1) : "-"}</td>
                <td className="px-5 py-3 font-medium">{e.grade ? e.grade.gpaPoint?.toFixed(1) : "-"}</td>
                <td className="px-5 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    e.grade?.status === "PASSED" ? "bg-green-50 text-green-700" :
                    e.grade?.status === "FAILED" ? "bg-red-50 text-red-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {e.grade?.status === "PASSED" ? "Đạt" : e.grade?.status === "FAILED" ? "Không đạt" : "Đang học"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-detail", id],
    queryFn: async () => {
      const response = await api.admin.getStudent(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Không tìm thấy sinh viên</p>
        <Link to="/students" className="mt-3 inline-block text-sm text-slate-600 underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const totalCredits = data.enrollments?.reduce((sum, e) => sum + (e.section?.subject?.credits || 0), 0);

  const gradedEnrollments = data.enrollments?.filter((e) => e.grade) || [];
  const gpa = gradedEnrollments.length > 0
    ? (gradedEnrollments.reduce((s, e) => s + (e.grade?.gpaPoint || 0) * (e.section?.subject?.credits || 0), 0) /
       gradedEnrollments.reduce((s, e) => s + (e.section?.subject?.credits || 0), 0)).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/students" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">{data.user.fullName}</h1>
          <p className="text-sm text-slate-500">Mã SV: <span className="font-mono">{data.studentCode}</span></p>
        </div>
        <span className={`rounded px-2.5 py-1 text-xs font-medium ${data.user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {data.user.isActive ? "Hoạt động" : "Đã khóa"}
        </span>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
          {[
            { label: "Email", value: data.user.email },
            { label: "Khoa", value: data.department?.name || "-" },
            { label: "Lớp", value: data.classGroup ? `${data.classGroup.code} - ${data.classGroup.name}` : "-" },
            { label: "Học kỳ hiện tại", value: data.currentSemester ? `Kỳ ${data.currentSemester}` : "Kỳ 1" },
          ].map((item) => (
            <div key={item.label} className="p-4">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-800 truncate">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
          <div className="p-4">
            <p className="text-xs text-slate-400">Số điện thoại</p>
            <p className="mt-1 text-sm text-slate-800">{data.phone || "Chưa cập nhật"}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-400">Địa chỉ</p>
            <p className="mt-1 text-sm text-slate-800">{data.address || "Chưa cập nhật"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Học phần đăng ký</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{data.enrollments?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Tổng tín chỉ</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalCredits}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">GPA tích lũy</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{gpa || "N/A"}</p>
        </div>
      </div>

      {/* Enrollments by Semester */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Bảng điểm theo chương trình đào tạo
          </h2>
          {data.curriculum && (
            <span className="text-xs text-slate-500">
              {data.curriculum.name}
            </span>
          )}
        </div>

        {!data.curriculum ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Khoa chưa có chương trình đào tạo. Vui lòng thiết lập chương trình đào tạo cho khoa.
            </p>
          </div>
        ) : (
          <>
            {/* Group curriculum subjects by semester */}
            {Array.from({ length: data.curriculum.totalSemesters }, (_, i) => i + 1).map((semester) => {
              const semesterSubjects = data.curriculum.subjects.filter(cs => cs.semester === semester);
              // If no subjects in curriculum for this semester, skip
              if (semesterSubjects.length === 0) return null;
              
              return (
                <SemesterTable
                  key={semester}
                  semester={semester}
                  curriculumSubjects={semesterSubjects}
                  enrollments={data.enrollments || []}
                  allEnrollments={data.enrollments || []}
                />
              );
            })}

            {/* Show extra courses that don't match curriculum */}
            <ExtraCoursesTable enrollments={data.enrollments || []} />
          </>
        )}
      </div>
    </div>
  );
}
