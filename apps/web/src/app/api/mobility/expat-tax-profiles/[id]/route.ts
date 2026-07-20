import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  expatTaxService,
  FILING_STATUSES,
  type FilingStatus,
} from '@/lib/services/expat-tax.service';

export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    {
      error: 'Expat tax profile not found',
      message: 'Expat tax profile not found',
      messageAr: 'ملف ضرائب المغترب غير موجود',
    },
    { status: 404 }
  );

function getId(request: NextRequest): string {
  const segments = new URL(request.url).pathname.split('/');
  return segments[segments.length - 1];
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const profile = await expatTaxService.getById(getId(request), user.tenantId);
    if (!profile) return notFound();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load expat tax profile',
        message: 'Failed to load expat tax profile',
        messageAr: 'فشل في تحميل ملف ضرائب المغترب',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const PATCH = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const id = getId(request);
    const body = await request.json();

    // Recalculate liability from stored inputs.
    if (body.action === 'calculate-liability') {
      const result = await expatTaxService.calculateLiability(id, user.tenantId, user.userId);
      if (!result) return notFound();
      return NextResponse.json({
        success: true,
        data: result.profile,
        estimate: result.estimate,
        message: 'Tax liability recalculated',
      });
    }

    const filingStatus: FilingStatus | undefined =
      body.filingStatus && FILING_STATUSES.includes(body.filingStatus)
        ? body.filingStatus
        : undefined;

    const updated = await expatTaxService.update(id, user.tenantId, user.userId, {
      homeCountry: body.homeCountry,
      hostCountry: body.hostCountry,
      taxYear: body.taxYear != null ? Number(body.taxYear) : undefined,
      baseSalary: body.baseSalary != null ? Number(body.baseSalary) : undefined,
      currency: body.currency,
      equalizationType: body.equalizationType,
      filingStatus,
      filingType: body.filingType,
      filingDueDate: body.filingDueDate ? new Date(body.filingDueDate) : undefined,
      notes: body.notes,
    });
    if (!updated) return notFound();
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Expat tax profile updated',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update expat tax profile',
        message: 'Failed to update expat tax profile',
        messageAr: 'فشل في تحديث ملف ضرائب المغترب',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const deleted = await expatTaxService.softDelete(getId(request), user.tenantId, user.userId);
    if (!deleted) return notFound();
    return NextResponse.json({ success: true, message: 'Expat tax profile deleted' });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete expat tax profile',
        message: 'Failed to delete expat tax profile',
        messageAr: 'فشل في حذف ملف ضرائب المغترب',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
