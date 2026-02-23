import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  assignLecturer,
  createAnnouncement,
  createClassGroup,
  createEnrollment,
  createExam,
  createLecturer,
  createSchedule,
  createSection,
  createStudent,
  createSubject,
  dashboard,
  listClassGroups,
  listDepartments,
  listLecturers,
  listSections,
  listStudents,
  listSubjects,
  updateLecturer,
  updateStudent,
} from "../controllers/admin.controller.js";
import {
  assignLecturerSchema,
  createAnnouncementSchema,
  createClassGroupSchema,
  createEnrollmentSchema,
  createExamSchema,
  createLecturerSchema,
  createScheduleSchema,
  createSectionSchema,
  createStudentSchema,
  createSubjectSchema,
  updateLecturerSchema,
  updateStudentSchema,
} from "../validators/admin.validator.js";
import { validate } from "../middleware/validate.js";

export const adminRouter = Router();

adminRouter.use(requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboard);

adminRouter.get("/departments", listDepartments);
adminRouter.get("/class-groups", listClassGroups);
adminRouter.post("/class-groups", validate(createClassGroupSchema), createClassGroup);
adminRouter.get("/subjects", listSubjects);
adminRouter.post("/subjects", validate(createSubjectSchema), createSubject);
adminRouter.get("/sections", listSections);
adminRouter.post("/sections", validate(createSectionSchema), createSection);
adminRouter.post("/schedules", validate(createScheduleSchema), createSchedule);
adminRouter.post("/exams", validate(createExamSchema), createExam);

adminRouter.get("/students", listStudents);
adminRouter.post("/students", validate(createStudentSchema), createStudent);
adminRouter.put("/students/:id", validate(updateStudentSchema), updateStudent);

adminRouter.get("/lecturers", listLecturers);
adminRouter.post("/lecturers", validate(createLecturerSchema), createLecturer);
adminRouter.put("/lecturers/:id", validate(updateLecturerSchema), updateLecturer);

adminRouter.post("/assignments", validate(assignLecturerSchema), assignLecturer);

adminRouter.post("/announcements", validate(createAnnouncementSchema), createAnnouncement);

adminRouter.post("/enrollments", validate(createEnrollmentSchema), createEnrollment);
