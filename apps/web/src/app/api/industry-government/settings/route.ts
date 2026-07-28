import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settings: {
      settingsId: 'gov-settings-1',
      organizationId: 'org-1',
      clearanceSettings: {
        autoExpireAlerts: true,
        expirationWarningDays: 90,
        continuousEvaluationEnabled: true,
        requireDebriefOnSeparation: true,
      },
      civilServiceSettings: {
        autoStepIncrease: true,
        performanceReviewRequired: true,
        minimumProbationMonths: 12,
        maxGradeLevel: 'SES',
      },
      pensionSettings: {
        defaultVestingYears: 5,
        mandatoryRetirementAge: 65,
        tspMatchingLimit: 5,
        allowCatchUpContributions: true,
      },
      complianceSettings: {
        mandatoryTrainingAnnually: true,
        ethicsFilingRequired: true,
        auditFrequency: 'annual',
      },
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ settings: body });
}
