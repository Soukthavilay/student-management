import { Expo } from "expo-server-sdk";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const expo = new Expo({ accessToken: env.expoAccessToken || undefined });

export async function upsertDeviceToken({ userId, token, platform }) {
  return prisma.deviceToken.upsert({
    where: { token },
    update: {
      userId,
      platform,
      lastSeenAt: new Date(),
    },
    create: {
      userId,
      token,
      platform,
    },
  });
}

export async function createInAppNotifications({ userIds, title, body, announcementId = null }) {
  if (!userIds.length) {
    return;
  }

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      body,
      announcementId,
    })),
  });
}

export async function sendPushToUsers({ userIds, title, body }) {
  if (!userIds.length) {
    return { sent: 0, skipped: 0 };
  }

  const tokens = await prisma.deviceToken.findMany({
    where: {
      userId: { in: userIds },
    },
    select: {
      token: true,
    },
  });

  const messages = tokens
    .map((entry) => entry.token)
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { title, body },
    }));

  if (!messages.length) {
    return { sent: 0, skipped: tokens.length };
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Push send failed", error);
    }
  }

  return { sent: messages.length, skipped: tokens.length - messages.length };
}
