import { prisma } from "../lib/prisma.js";

export async function createAuditLog({ userId, action, entity, entityId, metadata }) {
  return prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      metadata: metadata || undefined,
    },
  });
}
