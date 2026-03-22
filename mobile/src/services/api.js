import { http } from './http';

export const api = {
  auth: {
    login: (payload) => http.post('/auth/login', payload),
    changePassword: (payload) => http.post('/auth/change-password', payload),
  },
  student: {
    getProfile: () => http.get('/student/profile'),
    updateProfile: (payload) => http.put('/student/profile', payload),
    getTimetable: () => http.get('/student/timetable'),
    getExams: () => http.get('/student/exams'),
    getGrades: () => http.get('/student/grades'),
    getTuitionFees: () => http.get('/student/tuition-fees'),
    getNotifications: (params) =>
      http.get('/student/notifications', { params }),
    markNotificationRead: (id) =>
      http.patch(`/student/notifications/${id}/read`),
    getAttendance: (params) => http.get('/student/attendance', { params }),
    getAvailableSections: (params) =>
      http.get('/student/enrollments/available', { params }),
    registerSection: (payload) => http.post('/student/enrollments', payload),
    dropSection: (sectionId) => http.delete(`/student/enrollments/${sectionId}`),
  },
  notifications: {
    registerDevice: (payload) =>
      http.post('/notifications/register-device', payload),
  },
};
