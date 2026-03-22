import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockProviders = [
  {
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
    hospital: 'Northwestern Memorial Hospital',
    planNetworks: ['BlueCross PPO 2000', 'Aetna HMO Select'],
  },
  {
    npi: '9876543210',
    firstName: 'Michael',
    lastName: 'Torres',
    credentials: 'DDS',
    specialty: 'Dentistry',
    subSpecialty: 'General Dentistry',
    gender: 'MALE',
    languages: ['English', 'Portuguese'],
    acceptingNewPatients: true,
    telehealth: false,
    networkStatus: 'IN_NETWORK',
    rating: 4.6,
    reviewCount: 89,
    address: {
      street: '850 N Michigan Ave, Suite 200',
      city: 'Chicago',
      state: 'IL',
      zip: '60611',
      lat: 41.8972,
      lng: -87.6241,
    },
    phone: '312-555-0850',
    hospital: null,
    planNetworks: ['Delta Dental Plus'],
  },
  {
    npi: '5551234567',
    firstName: 'Aisha',
    lastName: 'Patel',
    credentials: 'MD, FAAD',
    specialty: 'Dermatology',
    subSpecialty: 'Medical Dermatology',
    gender: 'FEMALE',
    languages: ['English', 'Hindi', 'Gujarati'],
    acceptingNewPatients: false,
    telehealth: true,
    networkStatus: 'IN_NETWORK',
    rating: 4.9,
    reviewCount: 201,
    address: {
      street: '675 N Saint Clair St, Suite 1900',
      city: 'Chicago',
      state: 'IL',
      zip: '60611',
      lat: 41.8939,
      lng: -87.6228,
    },
    phone: '312-555-0675',
    hospital: 'University of Chicago Medicine',
    planNetworks: ['BlueCross PPO 2000', 'UnitedHealth Choice Plus'],
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const specialty = searchParams.get('specialty') || undefined;
    const city = searchParams.get('city') || undefined;
    const language = searchParams.get('language') || undefined;
    const gender = searchParams.get('gender') || undefined;
    const telehealth = searchParams.get('telehealth');
    const network = searchParams.get('network') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let providers = [...mockProviders];

    if (q) {
      const lq = q.toLowerCase();
      providers = providers.filter(
        (p) =>
          p.firstName.toLowerCase().includes(lq) ||
          p.lastName.toLowerCase().includes(lq) ||
          p.specialty.toLowerCase().includes(lq)
      );
    }
    if (specialty)
      providers = providers.filter((p) =>
        p.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    if (city)
      providers = providers.filter((p) =>
        p.address.city.toLowerCase().includes(city.toLowerCase())
      );
    if (language)
      providers = providers.filter((p) =>
        p.languages.some((l) => l.toLowerCase().includes(language.toLowerCase()))
      );
    if (gender) providers = providers.filter((p) => p.gender === gender.toUpperCase());
    if (telehealth === 'true') providers = providers.filter((p) => p.telehealth === true);
    if (network)
      providers = providers.filter((p) =>
        p.planNetworks.some((n) => n.toLowerCase().includes(network.toLowerCase()))
      );

    const total = providers.length;
    const paginated = providers.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
        message: 'Failed to search providers',
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
