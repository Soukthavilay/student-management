import { http } from "./http";

export const api = {
  auth: {
    login: (payload) => http.post("/auth/login", payload),
  },
  admin: {
    dashboard: () => http.get("/admin/dashboard"),
    departments: () => http.get("/admin/departments"),
    createDepartment: (payload) => http.post("/admin/departments", payload),
    updateDepartment: (id, payload) => http.put(`/admin/departments/${id}`, payload),
    deleteDepartment: (id) => http.delete(`/admin/departments/${id}`),

    classGroups: (departmentId) =>
      http.get("/admin/class-groups", {
        params: departmentId ? { departmentId } : undefined,
      }),
    createClassGroup: (payload) => http.post("/admin/class-groups", payload),
    updateClassGroup: (id, payload) => http.put(`/admin/class-groups/${id}`, payload),
    deleteClassGroup: (id) => http.delete(`/admin/class-groups/${id}`),

    subjects: (departmentId) =>
      http.get("/admin/subjects", {
        params: departmentId ? { departmentId } : undefined,
      }),
    createSubject: (payload) => http.post("/admin/subjects", payload),
    updateSubject: (id, payload) => http.put(`/admin/subjects/${id}`, payload),
    deleteSubject: (id) => http.delete(`/admin/subjects/${id}`),

    sections: () => http.get("/admin/sections"),
    createSection: (payload) => http.post("/admin/sections", payload),
    updateSection: (id, payload) => http.put(`/admin/sections/${id}`, payload),
    deleteSection: (id) => http.delete(`/admin/sections/${id}`),

    schedules: () => http.get("/admin/schedules"),
    createSchedule: (payload) => http.post("/admin/schedules", payload),
    updateSchedule: (id, payload) => http.put(`/admin/schedules/${id}`, payload),
    deleteSchedule: (id) => http.delete(`/admin/schedules/${id}`),

    exams: () => http.get("/admin/exams"),
    createExam: (payload) => http.post("/admin/exams", payload),
    updateExam: (id, payload) => http.put(`/admin/exams/${id}`, payload),
    deleteExam: (id) => http.delete(`/admin/exams/${id}`),
    students: (params) => http.get("/admin/students", { params }),
    getStudent: (id) => http.get(`/admin/students/${id}`),
    createStudent: (payload) => http.post("/admin/students", payload),
    updateStudent: (id, payload) => http.put(`/admin/students/${id}`, payload),
    lecturers: (params) => http.get("/admin/lecturers", { params }),
    getLecturer: (id) => http.get(`/admin/lecturers/${id}`),
    createLecturer: (payload) => http.post("/admin/lecturers", payload),
    updateLecturer: (id, payload) => http.put(`/admin/lecturers/${id}`, payload),
    assignLecturer: (payload) => http.post("/admin/assignments", payload),
    createAnnouncement: (payload) => http.post("/admin/announcements", payload),

    getCurriculum: (departmentId) =>
      http.get("/admin/curriculum", { params: { departmentId } }),
    upsertCurriculum: (payload) => http.post("/admin/curriculum", payload),
    addCurriculumSubject: (payload) =>
      http.post("/admin/curriculum/subjects", payload),
    removeCurriculumSubject: (id) =>
      http.delete(`/admin/curriculum/subjects/${id}`),
    enrollBySemester: (payload) =>
      http.post("/admin/enrollments/semester", payload),
  },
  lecturer: {
    sections: () => http.get("/lecturer/sections"),
    timetable: () => http.get("/lecturer/timetable"),
    sectionStudents: (sectionId) => http.get(`/lecturer/sections/${sectionId}/students`),
    upsertGrade: (payload) => http.put("/lecturer/grades", payload),
    submitGrade: (payload) => http.post("/lecturer/grades/submit", payload),
    announcements: () => http.get("/lecturer/announcements"),
    createAnnouncement: (payload) => http.post("/lecturer/announcements", payload),
  },
};
