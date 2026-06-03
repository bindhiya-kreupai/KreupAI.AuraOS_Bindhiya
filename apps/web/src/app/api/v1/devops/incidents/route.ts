import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  incidentService,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/services/incident.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('devops:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing devops:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const result = await incidentService.list({
      tenantId: url.searchParams.get('platformWide') === 'true' ? null : context.user.tenantId,
      status: (url.searchParams.get('status') as IncidentStatus) ?? undefined,
      severity: (url.searchParams.get('severity') as IncidentSeverity) ?? undefined,
      openOnly: url.searchParams.get('openOnly') === 'true',
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });
    return NextResponse.json({ success: true, ...result });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('devops:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing devops:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.incidentNumber || !body?.title || !body?.severity) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'incidentNumber, title, severity required' },
            },
            { status: 400 }
          );
        }
        const created = await incidentService.open({
          tenantId: body.platformWide ? null : context.user.tenantId,
          incidentNumber: body.incidentNumber,
          title: body.title,
          severity: body.severity,
          detectedAt: body.detectedAt ? new Date(body.detectedAt) : undefined,
          commanderUserId: body.commanderUserId,
          affectedServices: body.affectedServices,
          customerImpact: body.customerImpact,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Incident opened' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to open incident',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'incident', captureRequestBody: true }
);
