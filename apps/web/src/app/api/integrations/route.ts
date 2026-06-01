/**
 * Integrations API Routes
 * Phase 4: Enterprise Expansion - Integration Marketplace
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import {
  IntegrationRegistryService,
  IntegrationConnectionService,
} from '@/lib/services/integrations';

/**
 * POST /api/integrations
 * Manage integrations (auth: integrations:write)
 *
 * Tenant scoping: tenantId is ALWAYS taken from the authenticated session.
 * Any tenantId in the request body is overridden.
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    body.tenantId = auth!.tenantId;

    const action = body.action || 'connect';

    switch (action) {
      case 'connect':
        // Connect new integration
        if (!body.integrationId) {
          return NextResponse.json(
            { error: 'integrationId is required', errorAr: 'معرف التكامل مطلوب' },
            { status: 400 }
          );
        }

        const connection = await IntegrationConnectionService.connectIntegration(
          body.tenantId,
          body.integrationId,
          body.configuration || {},
          body.credentials || {},
          body.connectedBy || 'system'
        );

        return NextResponse.json({
          success: true,
          data: connection,
        });

      case 'disconnect':
        // Disconnect integration
        if (!body.connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const disconnected = await IntegrationConnectionService.disconnectIntegration(
          body.connectionId,
          body.disconnectedBy || 'system'
        );

        return NextResponse.json({
          success: true,
          data: disconnected,
        });

      case 'update-config':
        // Update configuration
        if (!body.connectionId || !body.configuration) {
          return NextResponse.json(
            {
              error: 'connectionId and configuration are required',
              errorAr: 'معرف الاتصال والإعدادات مطلوبان',
            },
            { status: 400 }
          );
        }

        const updated = await IntegrationConnectionService.updateConfiguration(
          body.connectionId,
          body.configuration
        );

        return NextResponse.json({
          success: true,
          data: updated,
        });

      case 'test':
        // Test connection
        if (!body.connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const connection_test = await IntegrationConnectionService.getConnectionById(
          body.connectionId
        );
        if (!connection_test) {
          return NextResponse.json(
            { error: 'Connection not found', errorAr: 'الاتصال غير موجود' },
            { status: 404 }
          );
        }

        const testResult = await IntegrationConnectionService.testConnection(connection_test);

        return NextResponse.json({
          success: true,
          data: testResult,
        });

      case 'sync':
        // Start sync job
        if (!body.connectionId || !body.entity) {
          return NextResponse.json(
            {
              error: 'connectionId and entity are required',
              errorAr: 'معرف الاتصال والكيان مطلوبان',
            },
            { status: 400 }
          );
        }

        const syncJob = await IntegrationConnectionService.startSyncJob(
          body.connectionId,
          body.entity,
          body.syncType || 'INCREMENTAL',
          'MANUAL',
          body.triggeredBy
        );

        return NextResponse.json({
          success: true,
          data: syncJob,
        });

      case 'create-webhook':
        // Create webhook
        if (!body.connectionId || !body.webhook) {
          return NextResponse.json(
            {
              error: 'connectionId and webhook config are required',
              errorAr: 'معرف الاتصال وإعدادات الـ Webhook مطلوبان',
            },
            { status: 400 }
          );
        }

        const webhook = await IntegrationConnectionService.createWebhook(
          body.connectionId,
          body.webhook
        );

        return NextResponse.json({
          success: true,
          data: webhook,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['integrations:write'],
    rateLimit: 'API_USER',
  }
);

/**
 * GET /api/integrations
 * Get integrations catalog or connections (auth: integrations:read)
 *
 * Tenant scoping: tenantId is ALWAYS taken from the authenticated session.
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const tenantId = auth!.tenantId;
    const type = searchParams.get('type') || 'catalog'; // 'catalog' | 'connections' | 'categories' | 'popular'
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const integrationId = searchParams.get('integrationId');
    const connectionId = searchParams.get('connectionId');

    switch (type) {
      case 'catalog':
        const integrations = await IntegrationRegistryService.getIntegrations(
          category as any,
          search || undefined
        );
        return NextResponse.json({
          success: true,
          data: {
            integrations,
            total: integrations.length,
          },
        });

      case 'marketplace':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId is required for marketplace', errorAr: 'معرف المستأجر مطلوب للسوق' },
            { status: 400 }
          );
        }

        const listings = await IntegrationRegistryService.getMarketplaceListings(
          tenantId,
          category as any,
          search || undefined
        );
        return NextResponse.json({
          success: true,
          data: {
            listings,
            total: listings.length,
          },
        });

      case 'categories':
        const categories = await IntegrationRegistryService.getCategories();
        return NextResponse.json({
          success: true,
          data: categories,
        });

      case 'popular':
        const popular = await IntegrationRegistryService.getPopularIntegrations(6);
        return NextResponse.json({
          success: true,
          data: popular,
        });

      case 'new':
        const newIntegrations = await IntegrationRegistryService.getNewIntegrations(3);
        return NextResponse.json({
          success: true,
          data: newIntegrations,
        });

      case 'detail':
        if (!integrationId) {
          return NextResponse.json(
            { error: 'integrationId is required', errorAr: 'معرف التكامل مطلوب' },
            { status: 400 }
          );
        }

        const integration = await IntegrationRegistryService.getIntegrationById(integrationId);
        if (!integration) {
          return NextResponse.json(
            { error: 'Integration not found', errorAr: 'التكامل غير موجود' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: integration,
        });

      case 'connections':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
            { status: 400 }
          );
        }

        const connections = await IntegrationConnectionService.getTenantConnections(tenantId);
        return NextResponse.json({
          success: true,
          data: connections,
        });

      case 'connection':
        if (!connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const connection = await IntegrationConnectionService.getConnectionById(connectionId);
        if (!connection) {
          return NextResponse.json(
            { error: 'Connection not found', errorAr: 'الاتصال غير موجود' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: connection,
        });

      case 'health':
        if (!connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const health = await IntegrationConnectionService.getHealthMetrics(connectionId);
        return NextResponse.json({
          success: true,
          data: health,
        });

      case 'sync-history':
        if (!connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const syncHistory = await IntegrationConnectionService.getSyncHistory(connectionId);
        return NextResponse.json({
          success: true,
          data: syncHistory,
        });

      case 'logs':
        if (!connectionId) {
          return NextResponse.json(
            { error: 'connectionId is required', errorAr: 'معرف الاتصال مطلوب' },
            { status: 400 }
          );
        }

        const logs = await IntegrationConnectionService.getLogs(connectionId);
        return NextResponse.json({
          success: true,
          data: logs,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['integrations:read'],
    rateLimit: 'API_USER',
  }
);
