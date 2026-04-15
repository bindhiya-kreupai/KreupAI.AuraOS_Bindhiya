import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { id } = context.params;

  const mockTaxDocument = {
    id,
    type: 'W-2',
    year: 2024,
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    employerName: 'AuraOS Technologies Inc.',
    employerEIN: '12-3456789',
    status: 'available',
    generatedAt: '2024-01-31T00:00:00Z',
    lastDownloadedAt: '2024-02-05T14:30:00Z',
    details: {
      box1_wagesTips: 95000.0,
      box2_federalTaxWithheld: 18500.0,
      box3_socialSecurityWages: 95000.0,
      box4_socialSecurityTaxWithheld: 5890.0,
      box5_medicareWages: 95000.0,
      box6_medicareTaxWithheld: 1377.5,
      box12_codes: [
        { code: 'D', amount: 8500.0, description: '401(k) contributions' },
        { code: 'DD', amount: 12600.0, description: 'Health coverage cost' },
      ],
      box16_stateWages: 95000.0,
      box17_stateTaxWithheld: 6200.0,
      state: 'CA',
      stateId: '123-456-7890',
    },
    corrections: [],
    downloadUrl: `/api/v1/tax-documents/${id}/download`,
  };

  return NextResponse.json({ data: mockTaxDocument });
});
