import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const mockProviders = [
  {
    npi: '1234567890',
    name: 'Dr. Sarah Johnson, MD, FACP',
    specialty: 'Internal Medicine',
    networkStatus: 'IN_NETWORK',
    rating: 4.8,
    telehealth: true,
    acceptingNewPatients: true,
    address: { street: '200 Medical Drive, Suite 400', city: 'Chicago', state: 'IL', zip: '60611' },
    lat: 41.8948,
    lng: -87.6235,
    phone: '312-555-0200',
  },
  {
    npi: '5551234567',
    name: 'Dr. Aisha Patel, MD, FAAD',
    specialty: 'Dermatology',
    networkStatus: 'IN_NETWORK',
    rating: 4.9,
    telehealth: true,
    acceptingNewPatients: false,
    address: {
      street: '675 N Saint Clair St, Suite 1900',
      city: 'Chicago',
      state: 'IL',
      zip: '60611',
    },
    lat: 41.8939,
    lng: -87.6228,
    phone: '312-555-0675',
  },
  {
    npi: '7778889990',
    name: 'Dr. James Wilson, MD',
    specialty: 'Family Medicine',
    networkStatus: 'IN_NETWORK',
    rating: 4.5,
    telehealth: false,
    acceptingNewPatients: true,
    address: { street: '1000 N Lake Shore Dr', city: 'Chicago', state: 'IL', zip: '60611' },
    lat: 41.905,
    lng: -87.6239,
    phone: '312-555-1000',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('benefits/providers:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/providers:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '10'); // miles
    const specialty = searchParams.get('specialty') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (isNaN(lat) || isNaN(lng)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: lat and lng are required and must be valid numbers',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    let providers = mockProviders
      .map((p) => ({
        ...p,
        distanceMiles: Math.round(haversineDistance(lat, lng, p.lat, p.lng) * 10) / 10,
      }))
      .filter((p) => p.distanceMiles <= radius)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);

    if (specialty) {
      providers = providers.filter((p) =>
        p.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    const total = providers.length;
    const paginated = providers.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        searchCenter: { lat, lng },
        radiusMiles: radius,
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
        message: 'Failed to find nearby providers',
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
