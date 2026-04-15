import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  try {
    const { employeeId } = params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear() - 1));

    // Simulated employee lookup with tenant isolation
    const knownEmployees = ['emp-001', 'emp-002', 'emp-003', 'emp-010'];
    if (!knownEmployees.includes(employeeId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Employee with id '${employeeId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Line 14: Offer of Coverage codes; Line 15: Employee share of lowest cost monthly premium; Line 16: Section 4980H Safe Harbor codes
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      line14OfferCode: '1E', // MEC to employee, spouse, and dependents
      line15EmployeeShare: 125.0,
      line16SafeHarbor: '2C', // Employee enrolled in coverage
    }));

    const form1095C = {
      formType: '1095-C',
      taxYear: year,
      tenantId: 'tenant-1',
      employeeId,
      employee: {
        id: employeeId,
        firstName: 'John',
        lastName: 'Smith',
        ssn: '***-**-1234',
        dateOfBirth: '1980-05-15',
        fullTimeStatus: 'FULL_TIME',
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
        },
      },
      employer: {
        name: 'Acme Corporation',
        ein: '12-3456789',
        address: '100 Corporate Blvd, Chicago, IL 60601',
        contactPhone: '800-555-0100',
        isAggregatedAleGroup: false,
      },
      partII: {
        annualSummary: {
          line14AllTwelveMonths: '1E',
          line15AllTwelveMonths: 125.0,
          line16AllTwelveMonths: '2C',
          zip9Digit: '60601-1234',
          planStartMonth: '01',
        },
        monthlyDetail: monthlyData,
      },
      partIII: {
        selfInsuredCoverage: false,
        coveredIndividuals: [],
      },
      generatedDate: new Date().toISOString(),
      status: 'GENERATED',
      downloadUrl: `/api/v1/benefits/compliance/1095c/${employeeId}/download?year=${year}`,
    };

    const response: ApiResponse = {
      success: true,
      data: form1095C,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to generate 1095-C form',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
});
