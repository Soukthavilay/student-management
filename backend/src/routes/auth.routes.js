import { Router } from "express";
import { loginSchema, refreshSchema, changePasswordSchema } from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";
import {
  login,
  logout,
  me,
  refreshToken,
  changePassword,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", validate(refreshSchema), refreshToken);
authRouter.post("/logout", authRequired, logout);
authRouter.get("/me", authRequired, me);
authRouter.post("/change-password", authRequired, validate(changePasswordSchema), changePassword);
