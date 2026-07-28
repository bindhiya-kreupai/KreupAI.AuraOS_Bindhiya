/**
 * AI Automation route access — aligns with /api/ai/coaching (dashboard users are not
 * always seeded with ai-automation:* permissions in aura_permission).
 */

import type { NextRequest } from 'next/server';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';

export function canReadAiAutomation(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('ai-automation:read')) return true;
  if (permissions.includes('admin/workflows:read')) return true;
  if (roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'HRBP'].includes(r))) {
    return true;
  }
  // Any authenticated user with tenant permissions may view AI automation tools
  return permissions.length > 0;
}

export function canWriteAiAutomation(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('ai-automation:write')) return true;
  if (permissions.includes('admin/workflows:create')) return true;
  if (permissions.includes('admin/workflows:update')) return true;
  if (roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'HRBP'].includes(r))) {
    return true;
  }
  // Generate/design workflows (no execution) — allow authenticated users like coaching chat
  return permissions.length > 0;
}

export function canActivateWorkflow(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('ai-automation:write')) return true;
  if (permissions.includes('admin/workflows:create')) return true;
  if (roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER'].includes(r))) {
    return true;
  }
  return false;
}

export type AiAutomationAuthContext = {
  tenantId: string;
  userId: string;
  permissions: string[];
  roles: string[];
};

/** Session-resolved tenant — never trust client-supplied tenantId. */
export async function resolveAiAutomationAuth(
  request: NextRequest
): Promise<AiAutomationAuthContext | null> {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;
  return {
    tenantId: context.user.tenantId as string,
    userId: context.user.userId as string,
    permissions: (context.permissions as string[]) || [],
    roles: (context.roles as string[]) || [],
  };
}
