import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const POST = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const definition = await prisma.workflowDefinition.findFirst({
      where: {
        id: params.id as string,
        tenantId: auth!.tenantId,
        isDeleted: false,
        processType: 'INTEGRATION',
      },
    });
    if (!definition) return { success: false, error: 'Integration not found', status: 404 };

    if (!definition.isActive) {
      return { success: false, error: 'Cannot sync a disabled integration', status: 400 };
    }

    let config: Record<string, any> = {};
    try {
      config = definition.triggerEvent ? JSON.parse(definition.triggerEvent as string) : {};
    } catch {}

    const url = config.baseUrl || config.url;
    if (!url) return { success: false, error: 'No endpoint URL configured', status: 400 };

    const body = await request.json().catch(() => ({}));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const start = Date.now();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.authHeader) headers['Authorization'] = config.authHeader;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'SYNC', payload: body, integrationId: definition.id }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latency = Date.now() - start;
      const resBody = await res.json().catch(() => ({}));

      return {
        success: true,
        data: {
          status: res.ok ? 'success' : 'error',
          statusCode: res.status,
          latencyMs: latency,
          recordsProcessed: resBody?.recordsProcessed ?? 0,
          message: res.ok ? `Sync completed successfully` : `Sync failed: ${res.status}`,
        },
      };
    } catch (err: any) {
      return {
        success: true,
        data: {
          status: 'error',
          statusCode: 0,
          latencyMs: 0,
          recordsProcessed: 0,
          message:
            err?.name === 'AbortError' ? 'Sync timed out (30s)' : `Sync failed: ${err.message}`,
        },
      };
    }
  },
  { requiredPermissions: ['workflow:write'], rateLimit: 'API_USER' }
);
