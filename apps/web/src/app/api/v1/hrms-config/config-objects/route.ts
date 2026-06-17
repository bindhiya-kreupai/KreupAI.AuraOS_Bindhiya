import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrmsConfigRegistryService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S01 + S03–S20 + S24 — generic config object CRUD + maker-checker.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const domainCode = url.searchParams.get('domainCode') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    const scope = url.searchParams.get('scope') ?? undefined;
    const country = url.searchParams.get('country') ?? undefined;
    const objectKey = url.searchParams.get('objectKey') ?? undefined;
    const action = url.searchParams.get('action');

    if (action === 'resolve-active') {
      if (!domainCode || !objectKey) return badRequest('domainCode and objectKey required');
      return ok(
        await hrmsConfigRegistryService.resolveActive(
          {
            domainCode,
            objectKey,
            country,
            legalEntityId: url.searchParams.get('legalEntityId') ?? undefined,
            at: url.searchParams.get('at') ? new Date(url.searchParams.get('at')!) : undefined,
          },
          ctx.user.tenantId
        )
      );
    }

    return ok(
      await hrmsConfigRegistryService.list(
        ctx.user.tenantId,
        {
          domainCode,
          status: status as any,
          scope: scope as any,
          country,
          objectKey,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list config objects', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'create-draft') {
      if (!body.domainCode || !body.objectKey || !body.label || !body.payload) {
        return badRequest('domainCode, objectKey, label, payload required');
      }
      const data = await hrmsConfigRegistryService.createDraft(
        {
          domainCode: body.domainCode,
          objectType: body.objectType ?? 'POLICY',
          objectKey: body.objectKey,
          label: body.label,
          scope: body.scope,
          scopeRef: body.scopeRef,
          country: body.country,
          legalEntityId: body.legalEntityId,
          effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
          payload: body.payload,
          targetModel: body.targetModel,
          targetRecordId: body.targetRecordId,
          rationale: body.rationale,
          sourceReference: body.sourceReference,
        },
        auth
      );
      return ok(data, 'Draft created');
    }

    if (body.action === 'submit') {
      if (!body.id) return badRequest('id required');
      return ok(await hrmsConfigRegistryService.submit(body.id, auth), 'Submitted for approval');
    }

    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await hrmsConfigRegistryService.approve(body.id, auth), 'Approved');
    }

    if (body.action === 'reject') {
      if (!body.id || !body.reason) return badRequest('id/reason required');
      return ok(await hrmsConfigRegistryService.reject(body.id, body.reason, auth), 'Rejected');
    }

    if (body.action === 'retire') {
      if (!body.id) return badRequest('id required');
      return ok(await hrmsConfigRegistryService.retire(body.id, auth), 'Retired');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update config object', err);
  }
});
