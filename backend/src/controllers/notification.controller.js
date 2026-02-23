import { upsertDeviceToken } from "../services/notification.service.js";

export async function registerDeviceToken(req, res, next) {
  try {
    const { token, platform } = req.body;

    await upsertDeviceToken({
      userId: req.user.id,
      token,
      platform,
    });

    return res.status(201).json({ message: "Device token registered" });
  } catch (error) {
    return next(error);
  }
}
