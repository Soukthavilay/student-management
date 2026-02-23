import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  getProfile,
  listExams,
  listGrades,
  listNotifications,
  listTimetable,
  markNotificationRead,
  updateProfile,
} from "../controllers/student.controller.js";
import { updateStudentProfileSchema } from "../validators/student.validator.js";
import { validate } from "../middleware/validate.js";

export const studentRouter = Router();

studentRouter.use(requireRole("STUDENT"));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", validate(updateStudentProfileSchema), updateProfile);
studentRouter.get("/timetable", listTimetable);
studentRouter.get("/exams", listExams);
studentRouter.get("/grades", listGrades);
studentRouter.get("/notifications", listNotifications);
studentRouter.patch("/notifications/:id/read", markNotificationRead);
