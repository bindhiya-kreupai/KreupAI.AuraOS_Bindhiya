import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  securityEventService,
  type EventSeverity,
  type EventSource,
  type SecurityEventType,
} from '@/lib/services/security-event.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('secops:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing secops:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('platformWide') === 'true' ? null : context.user.tenantId;
    if (url.searchParams.get('hotspots') === 'true') {
      const withinHours = Number(url.searchParams.get('withinHours')) || 24;
      const limit = Number(url.searchParams.get('limit')) || 10;
      const hotspots = await securityEventService.recentHotspots(tenantId, withinHours, limit);
      return NextResponse.json({ success: true, hotspots });
    }
    const result = await securityEventService.list({
      tenantId,
      source: (url.searchParams.get('source') as EventSource) ?? undefined,
      severity: (url.searchParams.get('severity') as EventSeverity) ?? undefined,
      eventType: (url.searchParams.get('eventType') as SecurityEventType) ?? undefined,
      sourceIp: url.searchParams.get('sourceIp') ?? undefined,
      userId: url.searchParams.get('userId') ?? undefined,
      blocked:
        url.searchParams.get('blocked') === 'true'
          ? true
          : url.searchParams.get('blocked') === 'false'
            ? false
            : undefined,
      incidentId: url.searchParams.get('incidentId') ?? undefined,
      fromDate: url.searchParams.get('fromDate')
        ? new Date(url.searchParams.get('fromDate') as string)
        : undefined,
      toDate: url.searchParams.get('toDate')
        ? new Date(url.searchParams.get('toDate') as string)
        : undefined,
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
      context: { user: { tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('secops:ingest')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing secops:ingest' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (Array.isArray(body?.events)) {
          const events = body.events.map((e: Record<string, unknown>) => ({
            tenantId: body.platformWide ? null : context.user.tenantId,
            ...e,
            detectedAt: e.detectedAt ? new Date(e.detectedAt as string) : undefined,
          }));
          const result = await securityEventService.ingestBatch(events);
          return NextResponse.json(
            { success: true, ingested: result.count, message: 'Batch ingested' },
            { status: 201 }
          );
        }
        if (!body?.source || !body?.eventType || !body?.severity) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'source, eventType, severity required' },
            },
            { status: 400 }
          );
        }
        const ip =
          body.sourceIp ??
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request.headers.get('x-real-ip') ??
          undefined;
        const created = await securityEventService.ingest({
          tenantId: body.platformWide ? null : context.user.tenantId,
          source: body.source,
          eventType: body.eventType,
          severity: body.severity,
          detectedAt: body.detectedAt ? new Date(body.detectedAt) : undefined,
          sourceIp: ip,
          userId: body.userId,
          resourceId: body.resourceId,
          ruleId: body.ruleId,
          blocked: body.blocked,
          rawPayload: body.rawPayload,
          metadata: body.metadata,
        });
        return NextResponse.json(
          {
            success: true,
            data: created,
            shouldEscalate: securityEventService.shouldEscalate(body.severity, body.eventType),
            message: 'Event ingested',
          },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to ingest event',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'security_event',
    captureRequestBody: false,
  }
);
