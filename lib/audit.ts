import { prisma } from "@/lib/prisma";

type AuditParams = {
  action: string;
  entity: string;
  entityId: number;
  message?: string;
  userId?: number;
};

export async function createAuditLog(data: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        message: data.message,
        userId: data.userId || null,
      },
    });
  } catch (error) {
    console.error("AUDIT_LOG_ERROR", error);
  }
}