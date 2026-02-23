import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { unauthorized } from "../utils/http-error.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { upsertDeviceToken } from "../services/notification.service.js";

function getRefreshTokenExpiryDate(token) {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !decoded.exp) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(decoded.exp * 1000);
}

function buildUserPayload(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    studentId: user.student?.id || null,
    lecturerId: user.lecturer?.id || null,
  };
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        lecturer: true,
      },
    });

    if (!user || !user.isActive) {
      throw unauthorized("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw unauthorized("Invalid credentials");
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiryDate(refreshToken),
      },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw unauthorized("Refresh token is invalid or expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: true,
        lecturer: true,
      },
    });

    if (!user || !user.isActive) {
      throw unauthorized("User not found or inactive");
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefreshToken,
          expiresAt: getRefreshTokenExpiryDate(newRefreshToken),
        },
      }),
    ]);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return next(unauthorized("Refresh token is invalid or expired"));
  }
}

export async function logout(req, res, next) {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.json({ message: "Logged out" });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: true,
        lecturer: true,
      },
    });

    if (!user) {
      throw unauthorized();
    }

    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    return next(error);
  }
}

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

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw unauthorized("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordCorrect) {
      throw unauthorized("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
}
