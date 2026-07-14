/**
 * Integration Connectors API Routes
 * Connector listing, status, installation, sync, and connection testing
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { ConnectorFrameworkService } from '@/lib/services/integrations/connector-framework.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const CONNECTOR_TYPES = [
  'ERP',
  'ACCOUNTING',
  'BIOMETRIC',
  'BANKING',
  'JOB_BOARD',
  'GOVERNMENT',
  'COMMUNICATION',
  'STORAGE',
] as const;
const CONNECTOR_PROVIDERS = [
  'SAP',
  'ORACLE',
  'DYNAMICS',
  'QUICKBOOKS',
  'XERO',
  'TALLY',
  'ZOHO',
  'ZKTECO',
  'SUPREMA',
  'WPS_MOHRE',
  'GOSI_PORTAL',
  'MUDAD',
  'QIWA',
  'LINKEDIN',
  'INDEED',
  'BAYT',
  'NAUKRI',
  'SLACK',
  'TEAMS',
  'AWS_S3',
  'AZURE_BLOB',
  'CUSTOM',
] as const;

const InstallConnectorSchema = z.object({
  action: z.literal('install'),
  name: z.string().min(1),
  connectorType: z.enum(CONNECTOR_TYPES),
  provider: z.enum(CONNECTOR_PROVIDERS),
  credentials: z.record(z.string(), z.any()).optional(),
  endpoints: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const SyncDataSchema = z.object({
  action: z.literal('sync'),
  connectorId: z.string().min(1),
  direction: z.enum(['inbound', 'outbound', 'bidirectional']),
});

const TestConnectionSchema = z.object({
  action: z.literal('test'),
  connectorId: z.string().min(1),
});

// GET - List connectors or get status
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.INTEGRATIONS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'list': {
        const category = searchParams.get('category') || undefined;
        const result = await ConnectorFrameworkService.getConnectors(user.tenantId, category);
        return NextResponse.json({ success: true, data: result });
      }

      case 'status': {
        const connectorId = searchParams.get('connectorId');
        if (!connectorId) {
          return NextResponse.json(
            {
              error: 'connectorId parameter is required',
              errorAr: 'معامل معرف الموصل مطلوب',
            },
            { status: 400 }
          );
        }
        const result = await ConnectorFrameworkService.getConnectorHealth(
          user.tenantId,
          connectorId
        );
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error({ error }, 'Error in integrations connectors GET');
    return NextResponse.json(
      {
        error: 'Failed to retrieve connector data',
        errorAr: 'فشل في استرجاع بيانات الموصل',
      },
      { status: 500 }
    );
  }
});

// POST - Install, sync, or test connectors
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.INTEGRATIONS, Action.MANAGE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'install': {
        const validated = InstallConnectorSchema.parse(body);
        const result = await ConnectorFrameworkService.registerConnector(user.tenantId, {
          name: validated.name,
          nameAr: validated.name,
          connectorType: validated.connectorType,
          provider: validated.provider,
          credentials: validated.credentials || {},
          endpoints: validated.endpoints || [],
          status: 'PENDING',
          isActive: validated.isActive ?? true,
          syncSchedule: null,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case 'sync': {
        const validated = SyncDataSchema.parse(body);
        const result = await ConnectorFrameworkService.sync(
          user.tenantId,
          validated.connectorId,
          validated.direction
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'test': {
        const validated = TestConnectionSchema.parse(body);
        const result = await ConnectorFrameworkService.testConnection(
          user.tenantId,
          validated.connectorId
        );
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errorAr: 'خطأ في التحقق',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    logger.error({ error }, 'Error in integrations connectors POST');
    return NextResponse.json(
      {
        error: 'Failed to process connector request',
        errorAr: 'فشل في معالجة طلب الموصل',
      },
      { status: 500 }
    );
  }
});
