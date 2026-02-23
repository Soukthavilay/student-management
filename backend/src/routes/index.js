import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { studentRouter } from "./student.routes.js";
import { adminRouter } from "./admin.routes.js";
import { lecturerRouter } from "./lecturer.routes.js";
import { notificationRouter } from "./notification.routes.js";
import { authRequired } from "../middleware/auth.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/student", authRequired, studentRouter);
router.use("/admin", authRequired, adminRouter);
router.use("/lecturer", authRequired, lecturerRouter);
router.use("/notifications", authRequired, notificationRouter);
