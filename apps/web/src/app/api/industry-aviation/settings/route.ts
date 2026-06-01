import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

/**
 * Industry Aviation Settings API
 *
 * FIXME(#36): No backing Prisma model exists for industry-specific aviation
 * settings (airline code, IATA/ICAO codes, fleet config, crew duty time
 * regulations, etc.). The previous implementation returned a hardcoded
 * { settingsId: 'SET-001', airlineCode: 'KAI' } from both GET and PUT,
 * meaning settings were never persisted. Returning 501 is more honest than
 * pretending the mutation succeeded.
 *
 * Wiring this up requires:
 *   1. Define an IndustryAviationSettings Prisma model (or reuse a generic
 *      industry-settings model keyed by industry type)
 *   2. Add tenantId and companyId scoping
 *   3. Migrate
 *   4. Implement Prisma findUnique / upsert here
 */
export const GET = createProtectedRoute(
  async (_request: NextRequest, _ctx) => {
    return NextResponse.json(
      {
        success: false,
        error: 'Aviation settings persistence is not yet implemented.',
        errorAr: 'لم يتم تنفيذ إعدادات الطيران بعد.',
        issue: 'https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/36',
      },
      { status: 501 }
    );
  },
  {
    requiredPermissions: ['industry-aviation:read'],
    rateLimit: 'API_USER',
  }
);

export const PUT = createProtectedRoute(
  async (_request: NextRequest, _ctx) => {
    return NextResponse.json(
      {
        success: false,
        error: 'Aviation settings persistence is not yet implemented.',
        errorAr: 'لم يتم تنفيذ إعدادات الطيران بعد.',
        issue: 'https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/36',
      },
      { status: 501 }
    );
  },
  {
    requiredPermissions: ['industry-aviation:write'],
    rateLimit: 'API_USER',
  }
);
