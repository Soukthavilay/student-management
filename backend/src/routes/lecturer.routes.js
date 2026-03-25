import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  listAssignedSections,
  listSectionStudents,
  listTimetable,
  submitGrade,
  upsertGrade,
  createLecturerAnnouncement,
  listLecturerAnnouncements,
  listAttendance,
  markAttendance,
  overrideExamEligibility,
  listAttendanceSchedule,
  listExamRegistrations,
} from "../controllers/lecturer.controller.js";
import {
  sectionParamsSchema,
  submitGradeSchema,
  upsertGradeSchema,
  createLecturerAnnouncementSchema,
  markAttendanceSchema,
  overrideExamEligibilitySchema,
} from "../validators/lecturer.validator.js";
import { validate } from "../middleware/validate.js";

export const lecturerRouter = Router();

lecturerRouter.use(requireRole("LECTURER"));

lecturerRouter.get("/sections", listAssignedSections);
lecturerRouter.get("/timetable", listTimetable);
lecturerRouter.get(
  "/sections/:sectionId/students",
  validate(sectionParamsSchema),
  listSectionStudents,
);
lecturerRouter.put("/grades", validate(upsertGradeSchema), upsertGrade);
lecturerRouter.post("/grades/submit", validate(submitGradeSchema), submitGrade);

lecturerRouter.get("/announcements", listLecturerAnnouncements);
lecturerRouter.post("/announcements", validate(createLecturerAnnouncementSchema), createLecturerAnnouncement);

lecturerRouter.get("/attendance", listAttendance);
lecturerRouter.post("/attendance", validate(markAttendanceSchema), markAttendance);
lecturerRouter.get("/attendance/schedule", listAttendanceSchedule);

lecturerRouter.get("/exam-registrations", listExamRegistrations);
lecturerRouter.post("/exam-eligibility/override", validate(overrideExamEligibilitySchema), overrideExamEligibility);
