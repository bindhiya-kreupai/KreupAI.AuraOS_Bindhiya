/**
 * AOS-SEC-011 — Automatic Tenant Isolation Enforcement
 *
 * Provides automatic tenant isolation at both the middleware/wrapper level
 * and the database/repository service level.
 */

import type { NextRequest } from 'next/server';

export class CrossTenantAccessError extends Error {
  public readonly status = 403;
  public readonly code = 'E4031';

  constructor(message = 'Forbidden: Cross-tenant data access denied') {
    super(message);
    this.name = 'CrossTenantAccessError';
  }
}

/**
 * Explicit assertion helper for tenant access validation.
 * Throws CrossTenantAccessError if target tenant ID does not match user tenant ID.
 */
export function validateTenantAccess(
  userTenantId: string,
  targetTenantId?: string | null,
  isSuperAdmin = false
): void {
  if (isSuperAdmin || userTenantId === '*' || userTenantId === 'system') return;
  if (targetTenantId && targetTenantId !== userTenantId) {
    throw new CrossTenantAccessError(
      `Forbidden: Cross-tenant data access denied (${userTenantId} -> ${targetTenantId})`
    );
  }
}

/**
 * Automatically inspects incoming request parameters and headers to detect
 * any attempt to request data for another tenant without super-admin permissions.
 * Throws CrossTenantAccessError if a cross-tenant access attempt is detected.
 */
export function enforceAutomaticTenantIsolation(
  request: NextRequest,
  userTenantId: string,
  isSuperAdmin = false
): void {
  if (isSuperAdmin || userTenantId === '*' || userTenantId === 'system') return;

  const url = request.nextUrl;
  const targetTenantParam =
    url.searchParams.get('tenantId') ||
    url.searchParams.get('tenant_id') ||
    url.searchParams.get('targetTenantId');

  const targetTenantHeader =
    request.headers.get('x-tenant-id') || request.headers.get('x-target-tenant');

  const targetTenant = targetTenantParam || targetTenantHeader;

  if (targetTenant && targetTenant !== userTenantId) {
    throw new CrossTenantAccessError(
      `Forbidden: Automatic tenant isolation blocked cross-tenant request (${userTenantId} -> ${targetTenant})`
    );
  }
}

/**
 * Automatic tenant scope injector for repository & service read queries.
 * Injects tenantId filter to ensure queries never cross tenant boundaries.
 */
export function withTenantScope<T extends Record<string, any>>(
  where: T = {} as T,
  tenantId: string
): T & { tenantId: string } {
  if (!tenantId || tenantId === '*' || tenantId === 'system') {
    return where as T & { tenantId: string };
  }

  // If query already includes a conflicting tenantId, validate it
  if (where.tenantId && where.tenantId !== tenantId) {
    throw new CrossTenantAccessError(
      `Forbidden: Query filter tenantId mismatch (${tenantId} !== ${where.tenantId})`
    );
  }

  return {
    ...where,
    tenantId,
  };
}
