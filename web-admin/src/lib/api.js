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

    majors: (departmentId) =>
      http.get("/admin/majors", {
        params: departmentId ? { departmentId } : undefined,
      }),
    createMajor: (payload) => http.post("/admin/majors", payload),
    updateMajor: (id, payload) => http.put(`/admin/majors/${id}`, payload),
    deleteMajor: (id) => http.delete(`/admin/majors/${id}`),

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
    semesters: () => http.get("/admin/semesters"),
    createSemester: (payload) => http.post("/admin/semesters", payload),
    updateSemester: (id, payload) => http.put(`/admin/semesters/${id}`, payload),
    deleteSemester: (id) => http.delete(`/admin/semesters/${id}`),

    rooms: () => http.get("/admin/rooms"),
    createRoom: (payload) => http.post("/admin/rooms", payload),
    updateRoom: (id, payload) => http.put(`/admin/rooms/${id}`, payload),
    deleteRoom: (id) => http.delete(`/admin/rooms/${id}`),

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

    createEnrollment: (payload) => http.post("/admin/enrollments", payload),

    getCurriculum: (departmentId) =>
      http.get("/admin/curriculum", { params: { departmentId } }),
    upsertCurriculum: (payload) => http.post("/admin/curriculum", payload),
    addCurriculumSubject: (payload) =>
      http.post("/admin/curriculum/subjects", payload),
    removeCurriculumSubject: (id) =>
      http.delete(`/admin/curriculum/subjects/${id}`),
    enrollBySemester: (payload) =>
      http.post("/admin/enrollments/semester", payload),

    tuitionFees: (params) => http.get("/admin/tuition-fees", { params }),
    generateTuitionFees: (payload) => http.post("/admin/tuition-fees/generate", payload),
    updateTuitionFeeItem: (id, payload) => http.put(`/admin/tuition-fees/items/${id}`, payload),
    deleteTuitionFee: (id) => http.delete(`/admin/tuition-fees/${id}`),
    tuitionConfigs: () => http.get("/admin/tuition-configs"),
    upsertTuitionConfig: (payload) => http.post("/admin/tuition-configs", payload),
    deleteTuitionConfig: (id) => http.delete(`/admin/tuition-configs/${id}`),

    listAssignments: () => http.get("/admin/assignments"),

    paymentTransactions: (params) => http.get("/admin/payment-transactions", { params }),
  },
  lecturer: {
    sections: () => http.get("/lecturer/sections"),
    timetable: () => http.get("/lecturer/timetable"),
    sectionStudents: (sectionId) => http.get(`/lecturer/sections/${sectionId}/students`),
    upsertGrade: (payload) => http.put("/lecturer/grades", payload),
    submitGrade: (payload) => http.post("/lecturer/grades/submit", payload),
    announcements: () => http.get("/lecturer/announcements"),
    createAnnouncement: (payload) => http.post("/lecturer/announcements", payload),
    getAttendance: (params) => http.get("/lecturer/attendance", { params }),
    markAttendance: (payload) => http.post("/lecturer/attendance", payload),
    getAttendanceSchedule: (params) => http.get("/lecturer/attendance/schedule", { params }),
  },
};
