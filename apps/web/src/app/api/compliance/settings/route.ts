/**
 * Compliance Settings API — get + update. Tenant-scoped, one row per tenant.
 * Backed by ComplianceSettingEntry (aura_compliance_setting).
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse, model } from '../_shared/route-helpers';

const DEFAULT_SETTINGS = {
  enableComplianceTracking: true,
  enablePOSHManagement: true,
  enableGrievanceManagement: true,
  enableDisciplinaryTracking: true,
  enableAudits: true,
  enableUnionManagement: true,
  enableWhistleblower: true,
  anonymousReportingEnabled: true,
  grievanceEscalationLevels: 3,
  grievanceResolutionSLA: 30,
  disciplinaryRetentionPeriod: 5,
  complianceReminderDaysBefore: 7,
  enableComplianceAlerts: true,
  regulatoryReportingFrequency: 'quarterly',
  dataRetentionPeriod: 7,
};

const UpdateSchema = z.object({ settings: z.record(z.any()) });

export const GET = withEnhancedAuth(async (_request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
  if (permErr) return permErr;
  try {
    const row = await model('complianceSettingEntry').findUnique({
      where: { tenantId: user.tenantId },
    });
    const settings = { ...DEFAULT_SETTINGS, ...(row?.settings ?? {}) };
    return NextResponse.json({
      success: true,
      data: { ...settings, lastModified: row?.updatedAt ?? null },
    });
  } catch {
    return errorResponse(ERR.server);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.UPDATE, permissions);
  if (permErr) return permErr;
  try {
    const raw = await request.json();
    // Accept either { settings: {...} } or a flat settings object
    const parsed = raw?.settings ? UpdateSchema.parse(raw).settings : raw;
    const existing = await model('complianceSettingEntry').findUnique({
      where: { tenantId: user.tenantId },
    });
    const merged = { ...DEFAULT_SETTINGS, ...(existing?.settings ?? {}), ...parsed };
    const row = await model('complianceSettingEntry').upsert({
      where: { tenantId: user.tenantId },
      create: { tenantId: user.tenantId, settings: merged, updatedBy: user.userId },
      update: { settings: merged, updatedBy: user.userId },
    });
    return NextResponse.json({
      success: true,
      data: { ...row.settings, lastModified: row.updatedAt },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
    return errorResponse(ERR.server);
  }
});
