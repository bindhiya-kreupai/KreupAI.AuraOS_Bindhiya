/**
 * EPIC-30 document classification + retention expiry API.
 *
 * POST {
 *   filename, mimeType?, source?,
 *   createdAt?, separationDate?
 * } → { verdict: { ...ClassificationResult, expiry } }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  classifyDocument,
  retentionExpiryDate,
} from '@/lib/services/document-retention-compliance/classification.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'document:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.filename) return badRequest('filename required');
    const result = classifyDocument({
      filename: String(body.filename),
      mimeType: body.mimeType,
      source: body.source,
    });
    const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();
    const separationDate = body.separationDate ? new Date(body.separationDate) : undefined;
    const expiry = retentionExpiryDate(result, { createdAt, separationDate });
    return ok({ verdict: { ...result, expiry } });
  } catch (err) {
    return serverError('Failed to classify document', err);
  }
});
