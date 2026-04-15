import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  const { id } = params;

  const mockPlanDetail = {
    id,
    name: 'Premium Health Plus',
    category: 'health',
    type: 'PPO',
    provider: 'Blue Cross Blue Shield',
    status: 'active',
    effectiveDate: '2024-01-01',
    renewalDate: '2025-01-01',
    description: 'Comprehensive PPO health plan with extensive provider network coverage.',
    premiums: {
      employeeOnly: { total: 250.0, employerPays: 200.0, employeePays: 50.0 },
      employeeSpouse: { total: 500.0, employerPays: 400.0, employeePays: 100.0 },
      employeeChildren: { total: 450.0, employerPays: 360.0, employeePays: 90.0 },
      family: { total: 700.0, employerPays: 560.0, employeePays: 140.0 },
      payFrequency: 'monthly',
    },
    employerContributionPercentage: 80,
    deductible: {
      inNetwork: { individual: 1500, family: 3000 },
      outOfNetwork: { individual: 3000, family: 6000 },
    },
    outOfPocketMax: {
      inNetwork: { individual: 5000, family: 10000 },
      outOfNetwork: { individual: 10000, family: 20000 },
    },
    copays: {
      primaryCare: 25,
      specialist: 50,
      urgentCare: 75,
      emergency: 250,
      prescriptionGeneric: 10,
      prescriptionBrand: 35,
      prescriptionSpecialty: 75,
    },
    coverage: {
      preventiveCare: '100% covered',
      hospitalInpatient: '80% after deductible',
      hospitalOutpatient: '80% after deductible',
      mentalHealth: '80% after deductible',
      rehabilitation: '60 visits per year',
      maternityAndNewborn: '80% after deductible',
      labAndDiagnostic: '80% after deductible',
    },
    network: {
      name: 'BCBS National PPO',
      searchUrl: 'https://provider.bcbs.com/find-a-doctor',
      size: 'large',
      statesAvailable: 50,
    },
    documents: [
      { name: 'Summary of Benefits', url: '/documents/plan-summary.pdf' },
      { name: 'Plan Document (SPD)', url: '/documents/plan-spd.pdf' },
      { name: 'Provider Directory', url: '/documents/provider-directory.pdf' },
    ],
    enrollmentCount: 245,
    eligibility: {
      waitingPeriod: '30 days from hire date',
      eligibleClasses: ['full-time', 'part-time-30plus'],
      minimumHoursPerWeek: 30,
    },
  };

  return NextResponse.json({ data: mockPlanDetail });
});
