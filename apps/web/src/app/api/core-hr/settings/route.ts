import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  employeeNumberPrefix: 'EMP',
  employeeNumberLength: 6,
  enableAutoNumbering: true,
  probationPeriodDays: 90,
  noticePeriodDays: 30,
  defaultWorkingHoursPerDay: 8,
  defaultWorkingDaysPerWeek: 5,
  financialYearStartMonth: 4,
  enableDocumentExpiry: true,
  documentExpiryAlertDays: 30,
  enableSelfService: true,
  enableManagerApproval: true,
  retentionPolicyDays: 365,
  maxFileUploadSizeMB: 10,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  dateFormat: 'YYYY-MM-DD',
  timezone: 'UTC',
};

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const settings = {
      ...DEFAULT_SETTINGS,
      tenantId: user.tenantId,
      updatedBy: user.userId,
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const settings = {
      ...DEFAULT_SETTINGS,
      ...body,
      tenantId: user.tenantId,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
