import { http } from "./http";

export const api = {
  auth: {
    login: (payload) => http.post("/auth/login", payload),
  },
  admin: {
    dashboard: () => http.get("/admin/dashboard"),
    departments: () => http.get("/admin/departments"),
    classGroups: (departmentId) =>
      http.get("/admin/class-groups", {
        params: departmentId ? { departmentId } : undefined,
      }),
    subjects: (departmentId) =>
      http.get("/admin/subjects", {
        params: departmentId ? { departmentId } : undefined,
      }),
    sections: () => http.get("/admin/sections"),
    createClassGroup: (payload) => http.post("/admin/class-groups", payload),
    createSubject: (payload) => http.post("/admin/subjects", payload),
    createSection: (payload) => http.post("/admin/sections", payload),
    createSchedule: (payload) => http.post("/admin/schedules", payload),
    createExam: (payload) => http.post("/admin/exams", payload),
    students: (params) => http.get("/admin/students", { params }),
    getStudent: (id) => http.get(`/admin/students/${id}`),
    createStudent: (payload) => http.post("/admin/students", payload),
    updateStudent: (id, payload) => http.put(`/admin/students/${id}`, payload),
    lecturers: (params) => http.get("/admin/lecturers", { params }),
    createLecturer: (payload) => http.post("/admin/lecturers", payload),
    updateLecturer: (id, payload) => http.put(`/admin/lecturers/${id}`, payload),
    assignLecturer: (payload) => http.post("/admin/assignments", payload),
    createAnnouncement: (payload) => http.post("/admin/announcements", payload),
  },
  lecturer: {
    sections: () => http.get("/lecturer/sections"),
    sectionStudents: (sectionId) => http.get(`/lecturer/sections/${sectionId}/students`),
    upsertGrade: (payload) => http.put("/lecturer/grades", payload),
    submitGrade: (payload) => http.post("/lecturer/grades/submit", payload),
  },
};
