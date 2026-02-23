import { Router } from "express";
import { requireRole } from "../middleware/require-role.js";
import {
  listAssignedSections,
  listSectionStudents,
  submitGrade,
  upsertGrade,
} from "../controllers/lecturer.controller.js";
import {
  sectionParamsSchema,
  submitGradeSchema,
  upsertGradeSchema,
} from "../validators/lecturer.validator.js";
import { validate } from "../middleware/validate.js";

export const lecturerRouter = Router();

lecturerRouter.use(requireRole("LECTURER"));

lecturerRouter.get("/sections", listAssignedSections);
lecturerRouter.get(
  "/sections/:sectionId/students",
  validate(sectionParamsSchema),
  listSectionStudents,
);
lecturerRouter.put("/grades", validate(upsertGradeSchema), upsertGrade);
lecturerRouter.post("/grades/submit", validate(submitGradeSchema), submitGrade);
