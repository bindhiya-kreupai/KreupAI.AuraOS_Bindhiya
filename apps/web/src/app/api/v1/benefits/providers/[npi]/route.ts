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

const mockProviderDetail: Record<string, any> = {
  1234567890: {
    npi: '1234567890',
    firstName: 'Sarah',
    lastName: 'Johnson',
    credentials: 'MD, FACP',
    specialty: 'Internal Medicine',
    subSpecialty: 'General Internal Medicine',
    gender: 'FEMALE',
    languages: ['English', 'Spanish'],
    acceptingNewPatients: true,
    telehealth: true,
    networkStatus: 'IN_NETWORK',
    rating: 4.8,
    reviewCount: 124,
    address: {
      street: '200 Medical Drive, Suite 400',
      city: 'Chicago',
      state: 'IL',
      zip: '60611',
      lat: 41.8948,
      lng: -87.6235,
    },
    phone: '312-555-0200',
    fax: '312-555-0201',
    email: null,
    website: 'https://www.nwmedicine.org',
    hospital: 'Northwestern Memorial Hospital',
    hospitalAffiliations: ['Northwestern Memorial Hospital', 'Rush University Medical Center'],
    education: [
      {
        institution: 'University of Chicago Pritzker School of Medicine',
        degree: 'MD',
        year: 2005,
      },
      { institution: 'Johns Hopkins Hospital', type: 'Residency', year: 2008 },
    ],
    boardCertifications: ['American Board of Internal Medicine'],
    planNetworks: ['BlueCross PPO 2000', 'Aetna HMO Select'],
    officeHours: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 12:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 4:00 PM',
    },
    estimatedWaitTime: '3-5 days',
    reviewsSummary: {
      overall: 4.8,
      bedsideManner: 4.9,
      waitTime: 4.5,
      staffFriendliness: 4.8,
      recentReviews: [
        { rating: 5, comment: 'Excellent doctor, very thorough and caring.', date: '2026-01-20' },
        { rating: 4, comment: 'Good experience overall.', date: '2026-01-10' },
      ],
    },
  },
};

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  try {
    const { npi } = params;

    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Invalid NPI format. NPI must be exactly 10 digits.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const provider = mockProviderDetail[npi];

    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Provider with NPI '${npi}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: provider,
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
        message: 'Failed to fetch provider detail',
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
