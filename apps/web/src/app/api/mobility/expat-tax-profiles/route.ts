import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { expatTaxService, type FilingStatus } from '@/lib/services/expat-tax.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobility/expat-tax-profiles
 * Lists expat tax profiles (filing-status compliance list) for the tenant.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const url = new URL(request.url);
    const filingStatus = url.searchParams.get('filingStatus') as FilingStatus | null;
    const taxYear = url.searchParams.get('taxYear');

    const result = await expatTaxService.list({
      tenantId: user.tenantId,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      taxYear: taxYear ? Number(taxYear) : undefined,
      filingStatus: filingStatus ?? undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to list expat tax profiles',
        message: 'Failed to list expat tax profiles',
        messageAr: 'فشل في جلب ملفات ضرائب المغتربين',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/mobility/expat-tax-profiles
 * Two modes:
 *  - action=estimate: stateless tax-equalization calculation (no persistence).
 *  - default: create and persist an expat tax profile.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (body.action === 'estimate') {
      if (!body.homeCountry || !body.hostCountry) {
        return NextResponse.json(
          {
            error: 'homeCountry and hostCountry are required',
            message: 'homeCountry and hostCountry are required',
            messageAr: 'بلد الأصل والبلد المضيف مطلوبان',
          },
          { status: 400 }
        );
      }
      const estimate = expatTaxService.estimate({
        homeCountry: body.homeCountry,
        hostCountry: body.hostCountry,
        baseSalary: Number(body.baseSalary) || 0,
        currency: body.currency,
      });
      return NextResponse.json({ success: true, data: estimate });
    }

    const required = ['employeeId', 'employeeName', 'homeCountry', 'hostCountry', 'taxYear'];
    for (const field of required) {
      if (body[field] == null || body[field] === '') {
        return NextResponse.json(
          {
            error: `${field} is required`,
            message: `${field} is required`,
            messageAr: 'حقول إلزامية مفقودة',
          },
          { status: 400 }
        );
      }
    }

    const created = await expatTaxService.create({
      tenantId: user.tenantId,
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      homeCountry: body.homeCountry,
      hostCountry: body.hostCountry,
      taxYear: Number(body.taxYear),
      baseSalary: body.baseSalary != null ? Number(body.baseSalary) : undefined,
      currency: body.currency,
      equalizationType: body.equalizationType,
      filingType: body.filingType,
      filingDueDate: body.filingDueDate ? new Date(body.filingDueDate) : undefined,
      notes: body.notes,
      actorId: user.userId,
    });

    return NextResponse.json(
      { success: true, data: created, message: 'Expat tax profile created' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create expat tax profile',
        message: 'Failed to create expat tax profile',
        messageAr: 'فشل في إنشاء ملف ضرائب المغترب',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
