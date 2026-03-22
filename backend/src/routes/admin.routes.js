import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  assignLecturer,
  createAnnouncement,
  createClassGroup,
  createDepartment,
  createEnrollment,
  createExam,
  createLecturer,
  createSchedule,
  createSection,
  createStudent,
  createSubject,
  dashboard,
  getLecturerDetail,
  getStudentDetail,
  listClassGroups,
  listDepartments,
  listLecturers,
  listSections,
  listSchedules,
  listExams,
  listStudents,
  listSubjects,
  updateDepartment,
  deleteDepartment,
  updateClassGroup,
  deleteClassGroup,
  updateSubject,
  deleteSubject,
  updateSection,
  deleteSection,
  updateSchedule,
  deleteSchedule,
  updateExam,
  deleteExam,
  updateLecturer,
  updateStudent,
  getCurriculum,
  upsertCurriculum,
  addCurriculumSubject,
  removeCurriculumSubject,
  enrollStudentBySemester,
  listTuitionFees,
  generateTuitionFees,
  updateTuitionFeeItem,
  deleteTuitionFee,
  listTuitionConfigs,
  upsertTuitionConfig,
  deleteTuitionConfig,
  listSemesters,
  createSemester,
  updateSemester,
  listRooms,
  createRoom,
  updateRoom,
  listAssignments,
} from "../controllers/admin.controller.js";
import {
  assignLecturerSchema,
  createAnnouncementSchema,
  createClassGroupSchema,
  createDepartmentSchema,
  createEnrollmentSchema,
  upsertCurriculumSchema,
  addCurriculumSubjectSchema,
  enrollBySemesterSchema,
  createExamSchema,
  createLecturerSchema,
  createScheduleSchema,
  createSectionSchema,
  createStudentSchema,
  createSubjectSchema,
  updateDepartmentSchema,
  updateClassGroupSchema,
  updateSubjectSchema,
  updateSectionSchema,
  updateScheduleSchema,
  updateExamSchema,
  updateLecturerSchema,
  updateStudentSchema,
  createSemesterSchema,
  updateSemesterSchema,
  createRoomSchema,
  updateRoomSchema,
} from "../validators/admin.validator.js";
import { validate } from "../middleware/validate.js";

export const adminRouter = Router();

adminRouter.use(requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboard);

adminRouter.get("/departments", listDepartments);
adminRouter.post("/departments", validate(createDepartmentSchema), createDepartment);
adminRouter.put("/departments/:id", validate(updateDepartmentSchema), updateDepartment);
adminRouter.delete("/departments/:id", deleteDepartment);

adminRouter.get("/class-groups", listClassGroups);
adminRouter.post("/class-groups", validate(createClassGroupSchema), createClassGroup);
adminRouter.put("/class-groups/:id", validate(updateClassGroupSchema), updateClassGroup);
adminRouter.delete("/class-groups/:id", deleteClassGroup);

adminRouter.get("/subjects", listSubjects);
adminRouter.post("/subjects", validate(createSubjectSchema), createSubject);
adminRouter.put("/subjects/:id", validate(updateSubjectSchema), updateSubject);
adminRouter.delete("/subjects/:id", deleteSubject);

adminRouter.get("/sections", listSections);
adminRouter.post("/sections", validate(createSectionSchema), createSection);
adminRouter.put("/sections/:id", validate(updateSectionSchema), updateSection);
adminRouter.delete("/sections/:id", deleteSection);

adminRouter.get("/schedules", listSchedules);
adminRouter.post("/schedules", validate(createScheduleSchema), createSchedule);
adminRouter.put("/schedules/:id", validate(updateScheduleSchema), updateSchedule);
adminRouter.delete("/schedules/:id", deleteSchedule);

adminRouter.get("/exams", listExams);
adminRouter.post("/exams", validate(createExamSchema), createExam);
adminRouter.put("/exams/:id", validate(updateExamSchema), updateExam);
adminRouter.delete("/exams/:id", deleteExam);

adminRouter.get("/students", listStudents);
adminRouter.get("/students/:id", getStudentDetail);
adminRouter.post("/students", validate(createStudentSchema), createStudent);
adminRouter.put("/students/:id", validate(updateStudentSchema), updateStudent);

adminRouter.get("/lecturers", listLecturers);
adminRouter.get("/lecturers/:id", getLecturerDetail);
adminRouter.post("/lecturers", validate(createLecturerSchema), createLecturer);
adminRouter.put("/lecturers/:id", validate(updateLecturerSchema), updateLecturer);

adminRouter.post("/assignments", validate(assignLecturerSchema), assignLecturer);
adminRouter.get("/assignments", listAssignments);

adminRouter.post("/announcements", validate(createAnnouncementSchema), createAnnouncement);

adminRouter.post("/enrollments", validate(createEnrollmentSchema), createEnrollment);

adminRouter.get("/curriculum", getCurriculum);
adminRouter.post("/curriculum", validate(upsertCurriculumSchema), upsertCurriculum);
adminRouter.post("/curriculum/subjects", validate(addCurriculumSubjectSchema), addCurriculumSubject);
adminRouter.delete("/curriculum/subjects/:id", removeCurriculumSubject);
adminRouter.post("/enrollments/semester", validate(enrollBySemesterSchema), enrollStudentBySemester);

adminRouter.get("/tuition-fees", listTuitionFees);
adminRouter.post("/tuition-fees/generate", generateTuitionFees);
adminRouter.put("/tuition-fees/items/:id", updateTuitionFeeItem);
adminRouter.delete("/tuition-fees/:id", deleteTuitionFee);

adminRouter.get("/tuition-configs", listTuitionConfigs);
adminRouter.post("/tuition-configs", upsertTuitionConfig);
adminRouter.delete("/tuition-configs/:id", deleteTuitionConfig);

adminRouter.get("/semesters", listSemesters);
adminRouter.post("/semesters", validate(createSemesterSchema), createSemester);
adminRouter.put("/semesters/:id", validate(updateSemesterSchema), updateSemester);

adminRouter.get("/rooms", listRooms);
adminRouter.post("/rooms", validate(createRoomSchema), createRoom);
adminRouter.put("/rooms/:id", validate(updateRoomSchema), updateRoom);
