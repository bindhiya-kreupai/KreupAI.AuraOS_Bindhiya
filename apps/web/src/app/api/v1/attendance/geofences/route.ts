import { NextRequest, NextResponse } from "next/server";

interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockGeofences: Geofence[] = [
  {
    id: "gf-001",
    name: "Main Office",
    lat: 37.7749,
    lng: -122.4194,
    radius: 500,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "gf-002",
    name: "Downtown Branch",
    lat: 37.7849,
    lng: -122.4094,
    radius: 300,
    isActive: true,
    createdAt: "2025-02-15T00:00:00Z",
    updatedAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "gf-003",
    name: "Warehouse",
    lat: 37.7649,
    lng: -122.4294,
    radius: 1000,
    isActive: false,
    createdAt: "2025-03-10T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  },
];

export async function GET() {
  return NextResponse.json({
    geofences: mockGeofences,
    total: mockGeofences.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (\!body.name || body.lat === undefined || body.lng === undefined || \!body.radius) {
      return NextResponse.json(
        { error: "name, lat, lng, and radius are required" },
        { status: 400 }
      );
    }

    const newGeofence: Geofence = {
      id: `gf-${String(mockGeofences.length + 1).padStart(3, "0")}`,
      name: body.name,
      lat: body.lat,
      lng: body.lng,
      radius: body.radius,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newGeofence, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
