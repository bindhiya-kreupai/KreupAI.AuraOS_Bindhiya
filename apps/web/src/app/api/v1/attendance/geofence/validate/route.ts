import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

interface GeofenceValidateRequest {
  lat: number;
  lng: number;
}

interface GeofenceValidateResponse {
  valid: boolean;
  status: 'inside' | 'outside';
  geofenceName: string | null;
  distanceFromBoundary: number;
  timestamp: string;
}

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  try {
    const body: GeofenceValidateRequest = await request.json();

    if (body.lat === undefined || body.lng === undefined) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    // Mock geofence validation logic
    const officeLat = 37.7749;
    const officeLng = -122.4194;
    const radiusKm = 0.5;

    const distance =
      Math.sqrt(Math.pow(body.lat - officeLat, 2) + Math.pow(body.lng - officeLng, 2)) * 111; // rough km conversion

    const isInside = distance <= radiusKm;

    const response: GeofenceValidateResponse = {
      valid: true,
      status: isInside ? 'inside' : 'outside',
      geofenceName: isInside ? 'Main Office' : null,
      distanceFromBoundary: Math.round((distance - radiusKm) * 1000) / 1000,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
});
