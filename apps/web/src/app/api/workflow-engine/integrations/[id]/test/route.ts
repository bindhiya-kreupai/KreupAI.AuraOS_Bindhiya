import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const POST = createProtectedRoute(
  async (_request: NextRequest, { params, auth }) => {
    const definition = await prisma.workflowDefinition.findFirst({
      where: {
        id: params.id as string,
        tenantId: auth!.tenantId,
        isDeleted: false,
        processType: 'INTEGRATION',
      },
    });
    if (!definition) return { success: false, error: 'Integration not found', status: 404 };

    let config: Record<string, any> = {};
    try {
      config = definition.triggerEvent ? JSON.parse(definition.triggerEvent as string) : {};
    } catch {}

    const url = config.baseUrl || config.url;
    if (!url) return { success: false, error: 'No endpoint URL configured', status: 400 };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const start = Date.now();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.authHeader) headers['Authorization'] = config.authHeader;

      const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
      clearTimeout(timeout);
      const latency = Date.now() - start;

      return {
        success: true,
        data: {
          status: res.ok ? 'success' : 'error',
          statusCode: res.status,
          latencyMs: latency,
          message: res.ok
            ? `Connected successfully (${res.status})`
            : `Endpoint returned ${res.status}`,
        },
      };
    } catch (err: any) {
      return {
        success: true,
        data: {
          status: 'error',
          statusCode: 0,
          latencyMs: 0,
          message:
            err?.name === 'AbortError'
              ? 'Connection timed out (10s)'
              : `Connection failed: ${err.message}`,
        },
      };
    }
  },
  { requiredPermissions: ['workflow:read'], rateLimit: 'API_USER' }
);
