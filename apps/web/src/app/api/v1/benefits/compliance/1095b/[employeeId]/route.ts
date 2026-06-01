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

export const GET = withEnhancedAuth(
  async (request: NextRequest, { _user, params, permissions }: any) => {
    if (!permissions.includes('benefits/compliance:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/compliance:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
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

      const form1095B = {
        formType: '1095-B',
        taxYear: year,
        tenantId: 'tenant-1',
        employeeId,
        employee: {
          id: employeeId,
          firstName: 'John',
          lastName: 'Smith',
          ssn: '***-**-1234',
          dateOfBirth: '1980-05-15',
          address: {
            street: '456 Oak Avenue',
            city: 'Springfield',
            state: 'IL',
            zip: '62701',
          },
        },
        issuerInfo: {
          name: 'Acme Corporation Benefits',
          ein: '12-3456789',
          address: '100 Corporate Blvd, Chicago, IL 60601',
          contactPhone: '800-555-0100',
        },
        originOfHealthCoverage: 'D', // D = Insurance company / insurer
        planName: 'BlueCross PPO 2000',
        planType: 'MINIMUM_ESSENTIAL_COVERAGE',
        coveredIndividuals: [
          {
            name: 'John Smith',
            ssn: '***-**-1234',
            dob: '1980-05-15',
            relationship: 'SELF',
            coveredMonths: {
              jan: true,
              feb: true,
              mar: true,
              apr: true,
              may: true,
              jun: true,
              jul: true,
              aug: true,
              sep: true,
              oct: true,
              nov: true,
              dec: true,
            },
            allTwelveMonths: true,
          },
          {
            name: 'Jane Smith',
            ssn: '***-**-5678',
            dob: '1985-03-20',
            relationship: 'SPOUSE',
            coveredMonths: {
              jan: true,
              feb: true,
              mar: true,
              apr: true,
              may: true,
              jun: true,
              jul: true,
              aug: true,
              sep: true,
              oct: true,
              nov: true,
              dec: true,
            },
            allTwelveMonths: true,
          },
        ],
        generatedDate: new Date().toISOString(),
        status: 'GENERATED',
        downloadUrl: `/api/v1/benefits/compliance/1095b/${employeeId}/download?year=${year}`,
      };

      const response: ApiResponse = {
        success: true,
        data: form1095B,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to generate 1095-B form',
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
  }
);
