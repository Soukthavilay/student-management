import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  getProfile,
  listExams,
  listGrades,
  listNotifications,
  listTimetable,
  listTuitionFees,
  markNotificationRead,
  updateProfile,
  listAttendance,
  listAvailableSections,
  registerSection,
  dropSection,
  getExamEligibility,
  registerExam,
} from "../controllers/student.controller.js";
import {
  availableSectionsQuerySchema,
  dropSectionSchema,
  registerSectionSchema,
  updateStudentProfileSchema,
} from "../validators/student.validator.js";
import { validate } from "../middleware/validate.js";

export const studentRouter = Router();

studentRouter.use(requireRole("STUDENT"));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", validate(updateStudentProfileSchema), updateProfile);
studentRouter.get("/timetable", listTimetable);
studentRouter.get("/exams", listExams);
studentRouter.get("/grades", listGrades);
studentRouter.get("/tuition-fees", listTuitionFees);
studentRouter.get("/notifications", listNotifications);
studentRouter.patch("/notifications/:id/read", markNotificationRead);
studentRouter.get("/attendance", listAttendance);

studentRouter.get("/enrollments/available", validate(availableSectionsQuerySchema), listAvailableSections);
studentRouter.post("/enrollments", validate(registerSectionSchema), registerSection);
studentRouter.delete("/enrollments/:sectionId", validate(dropSectionSchema), dropSection);
studentRouter.get("/exam-eligibility", getExamEligibility);
studentRouter.post("/exams/register", registerExam);
