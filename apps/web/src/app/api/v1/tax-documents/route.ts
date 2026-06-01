import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('tax-documents:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing tax-documents:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2024';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const mockTaxDocuments = [
    {
      id: 'tax-001',
      type: 'W-2',
      year: parseInt(year),
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      status: 'available',
      generatedAt: `${year}-01-31T00:00:00Z`,
      grossWages: 95000.0,
      federalTaxWithheld: 18500.0,
      stateTaxWithheld: 6200.0,
      socialSecurityWages: 95000.0,
      medicareWages: 95000.0,
    },
    {
      id: 'tax-002',
      type: '1099-NEC',
      year: parseInt(year),
      employeeId: 'con-001',
      employeeName: 'Jane Contractor',
      status: 'available',
      generatedAt: `${year}-01-31T00:00:00Z`,
      nonEmployeeCompensation: 72000.0,
    },
    {
      id: 'tax-003',
      type: 'W-2',
      year: parseInt(year),
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      status: 'available',
      generatedAt: `${year}-01-31T00:00:00Z`,
      grossWages: 110000.0,
      federalTaxWithheld: 22000.0,
      stateTaxWithheld: 7500.0,
      socialSecurityWages: 110000.0,
      medicareWages: 110000.0,
    },
    {
      id: 'tax-004',
      type: '1095-C',
      year: parseInt(year),
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      status: 'available',
      generatedAt: `${year}-03-01T00:00:00Z`,
      coverageMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  ];

  return NextResponse.json({
    data: mockTaxDocuments,
    pagination: {
      page,
      limit,
      total: mockTaxDocuments.length,
      totalPages: 1,
    },
    filters: {
      year: parseInt(year),
      availableYears: [2024, 2023, 2022, 2021],
    },
  });
});
