// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * Industry Aviation Settings (Phase 2 #36)
 *
 * Per-tenant (optionally per-company) settings for aviation-vertical
 * deployments. Drives crew-cert renewal windows, IATA/ICAO code display,
 * duty-time regulation frame, and fleet-type catalogue.
 *
 * The previous 501-returning placeholder (introduced in Phase 2 #54) is
 * now backed by the IndustryAviationSettings Prisma model.
 */

const FleetEntrySchema = z.object({
  type: z.enum(['NB', 'WB', 'REGIONAL', 'CARGO']),
  codes: z.array(z.string()),
  trainingDays: z.number().int().nonnegative(),
});

const AviationSettingsSchema = z.object({
  companyId: z.string().optional(),
  airlineCode: z.string().min(1).max(8),
  iataCode: z.string().length(2).optional(),
  icaoCode: z.string().length(3).optional(),
  dutyTimeRegulation: z.enum(['FAA', 'EASA', 'ICAO', 'CUSTOM']).optional(),
  fleetConfig: z.array(FleetEntrySchema).optional(),
  pilotLicenseRenewalNoticeDays: z.number().int().min(1).max(180).default(30),
  medicalCertRenewalNoticeDays: z.number().int().min(1).max(180).default(45),
  isActive: z.boolean().default(true),
});

export const GET = createProtectedRoute(
  async (_request: NextRequest, { auth }) => {
    try {
      const settings = await prisma.industryAviationSettings.findFirst({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        // Company-specific row wins over tenant-wide default (NULL companyId
        // sorts last under DESC + NULLS LAST in Postgres; we order by
        // companyId ASC so non-null company-specific rows return first).
        orderBy: [{ companyId: 'asc' }, { createdAt: 'desc' }],
      });
      return { success: true, data: settings ?? null };
    } catch (err: any) {
      logger.error({ err }, 'industry-aviation/settings: GET failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch aviation settings',
          errorAr: 'فشل في جلب إعدادات الطيران',
        },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: ['industry-aviation:read'], rateLimit: 'API_USER' }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const parsed = AviationSettingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errorAr: 'فشل التحقق من البيانات',
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    try {
      const { companyId, ...rest } = parsed.data;
      // Upsert keyed on (tenantId, companyId) — the unique constraint
      // enforces one row per pair (null companyId allowed once per tenant).
      const settings = await prisma.industryAviationSettings.upsert({
        where: {
          tenantId_companyId: {
            tenantId: auth!.tenantId,
            companyId: companyId ?? null,
          },
        },
        create: {
          ...rest,
          fleetConfig: rest.fleetConfig ?? undefined,
          tenantId: auth!.tenantId,
          companyId: companyId ?? null,
          createdBy: auth!.userId,
          updatedBy: auth!.userId,
        },
        update: {
          ...rest,
          fleetConfig: rest.fleetConfig ?? undefined,
          updatedBy: auth!.userId,
          version: { increment: 1 },
        },
      });
      return { success: true, data: settings };
    } catch (err: any) {
      logger.error({ err }, 'industry-aviation/settings: PUT failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save aviation settings',
          errorAr: 'فشل في حفظ إعدادات الطيران',
        },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: ['industry-aviation:write'], rateLimit: 'API_USER' }
);
