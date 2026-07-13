import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceRegisterEvidenceService } from '@/lib/services/compliance-audit-register';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const targetType = url.searchParams.get('targetType');
    const targetId = url.searchParams.get('targetId');

    if (!targetType || !targetId) {
      return badRequest('targetType and targetId are required');
    }

    const data = await complianceRegisterEvidenceService.list(
      ctx.user.tenantId,
      targetType,
      targetId
    );
    return ok(data);
  } catch (err) {
    return serverError('Failed to list evidence documents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const contentType = req.headers.get('content-type') || '';
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const targetType = formData.get('targetType') as string;
      const targetId = formData.get('targetId') as string;

      if (!file || !targetType || !targetId) {
        return badRequest('file, targetType, and targetId are required');
      }

      // Convert file to buffer and write to public upload folder
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'compliance-evidence');
      await mkdir(uploadDir, { recursive: true });

      const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/compliance-evidence/${uniqueName}`;

      const data = await complianceRegisterEvidenceService.create(
        {
          targetType,
          targetId,
          fileName: file.name,
          fileUrl,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
        },
        auth
      );

      return ok(data, 'Evidence uploaded and registered successfully');
    }

    const body = await req.json();

    if (body.action === 'verify') {
      if (!body.id || !body.acceptedStatus) {
        return badRequest('id and acceptedStatus are required');
      }
      const data = await complianceRegisterEvidenceService.verify(
        body.id,
        ctx.user.id,
        body.acceptedStatus,
        auth
      );
      return ok(data, 'Evidence verification logged successfully');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id is required');
      await complianceRegisterEvidenceService.delete(body.id);
      return ok(null, 'Evidence document deleted successfully');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to manage evidence document', err);
  }
});
