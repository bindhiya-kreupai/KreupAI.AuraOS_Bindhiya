/**
 * Agentic AI route access — session-resolved tenant, never trust client tenantId.
 */

import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';

export type AgentAuthContext = {
  tenantId: string;
  userId: string;
  employeeId: string | null;
  permissions: string[];
  roles: string[];
  canWrite: boolean;
};

const READ_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'HR_ADMIN',
  'HR_MANAGER',
  'HRBP',
  'RECRUITER',
  'MANAGER',
  'EMPLOYEE',
];
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'HRBP', 'RECRUITER'];

export function canReadAgents(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('agents:read')) return true;
  if (permissions.includes('ai-automation:read')) return true;
  if (roles.some((r) => READ_ROLES.includes(r))) return true;
  return permissions.length > 0;
}

export function canWriteAgents(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('agents:write')) return true;
  if (permissions.includes('ai-automation:write')) return true;
  if (roles.some((r) => WRITE_ROLES.includes(r))) return true;
  // Linked employees may use HR Agent self-service (apply leave, request docs)
  if (roles.some((r) => ['EMPLOYEE', 'MANAGER'].includes(r))) return true;
  return false;
}

async function resolveEmployeeId(tenantId: string, userId: string): Promise<string | null> {
  const employee = await prisma.employee
    .findFirst({
      where: { userId, isDeleted: false, company: { tenantId } },
      select: { id: true },
    })
    .catch(() => null);
  return employee?.id ?? null;
}

export async function resolveAgentAuth(request: NextRequest): Promise<AgentAuthContext | null> {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;

  const tenantId = context.user.tenantId as string;
  const userId = context.user.userId as string;
  const permissions = (context.permissions as string[]) || [];
  const roles = (context.roles as string[]) || [];

  if (!canReadAgents(permissions, roles)) return null;

  const employeeId = await resolveEmployeeId(tenantId, userId);

  return {
    tenantId,
    userId,
    employeeId,
    permissions,
    roles,
    canWrite: canWriteAgents(permissions, roles),
  };
}
