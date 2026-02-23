import { Router } from "express";
import { registerDeviceToken } from "../controllers/notification.controller.js";
import { registerDeviceTokenSchema } from "../validators/notification.validator.js";
import { validate } from "../middleware/validate.js";

export const notificationRouter = Router();

notificationRouter.post("/register-device", validate(registerDeviceTokenSchema), registerDeviceToken);
