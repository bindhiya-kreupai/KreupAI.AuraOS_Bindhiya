import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { HRMS_WORKSPACES, findWorkspaceByDomain } from '@/lib/services/hrms-config';
import { ok, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S03–S20 + S24 — workspace descriptor catalogue. Read-only.

export const GET = withEnhancedAuth(async (req: NextRequest, _ctx: RouteContext) => {
  const url = new URL(req.url);
  const domainCode = url.searchParams.get('domainCode');
  if (domainCode) {
    const ws = findWorkspaceByDomain(domainCode);
    return ok(ws);
  }
  return ok(HRMS_WORKSPACES);
});
