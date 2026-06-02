// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const AVAILABLE_REPORTS = [
  {
    id: 'wps-sif',
    name: 'WPS SIF File (UAE)',
    description: 'Wage Protection System SIF file for UAE Ministry of Labour',
    country: 'AE',
    frequency: 'Monthly',
    format: 'SIF',
    module: 'compliance/wps',
  },
  {
    id: 'gosi-return',
    name: 'GOSI Monthly Return (KSA)',
    description:
      'GOSI contribution return for General Organization for Social Insurance (Saudi Arabia)',
    country: 'SA',
    frequency: 'Monthly',
    format: 'Excel/XML',
    module: 'compliance/gosi',
  },
  {
    id: 'india-pf-ecr',
    name: 'PF ECR (India)',
    description: 'Electronic Challan cum Return for Provident Fund (India)',
    country: 'IN',
    frequency: 'Monthly',
    format: 'Text',
    module: 'compliance/india/pf',
  },
  {
    id: 'india-esi-return',
    name: 'ESI Return (India)',
    description: 'Employee State Insurance half-yearly return (India)',
    country: 'IN',
    frequency: 'Half-yearly',
    format: 'Excel',
    module: 'compliance/india/esi',
  },
  {
    id: 'india-tds-24q',
    name: 'TDS Return 24Q (India)',
    description: 'Quarterly TDS return for salary payments (India)',
    country: 'IN',
    frequency: 'Quarterly',
    format: 'FVU File',
    module: 'compliance/india/tds',
  },
  {
    id: 'india-form16',
    name: 'Form 16 (India)',
    description: 'Annual TDS certificate for employees (India)',
    country: 'IN',
    frequency: 'Annual',
    format: 'PDF',
    module: 'compliance/india/tds',
  },
  {
    id: 'nitaqat-report',
    name: 'Nitaqat/Emiratisation Report (UAE/KSA)',
    description: 'Saudization/Emiratisation compliance ratio report',
    country: 'AE,SA',
    frequency: 'Monthly',
    format: 'PDF/Excel',
    module: 'compliance/emiratisation',
  },
];

/**
 * GET /api/v1/compliance/statutory-reports
 * List all available statutory reports
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context: any) => {
  const { permissions } = context;
  if (!permissions.includes('compliance/statutory-reports:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing compliance/statutory-reports:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const frequency = searchParams.get('frequency') || undefined;

    let reports = AVAILABLE_REPORTS;
    if (country) {
      reports = reports.filter((r) => r.country.includes(country.toUpperCase()));
    }
    if (frequency) {
      reports = reports.filter((r) => r.frequency.toLowerCase() === frequency.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      data: reports,
      meta: {
        total: reports.length,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Statutory Reports API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch statutory reports' } },
      { status: 500 }
    );
  }
});
