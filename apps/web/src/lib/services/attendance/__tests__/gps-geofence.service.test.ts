/**
 * GPSGeofenceService — pure geo-math + fraud-detection tests.
 * No prisma involvement for the math helpers.
 */

import { describe, it, expect } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    geofenceLocation: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
    },
    employeePunch: {
      findMany: vi.fn(),
    },
  },
}));

import { vi } from 'vitest';
import { GPSGeofenceService } from '../gps-geofence.service';

describe('GPSGeofenceService.calculateDistance — Haversine', () => {
  it('returns ~0m for identical coordinates', () => {
    const d = GPSGeofenceService.calculateDistance(
      { latitude: 25.2048, longitude: 55.2708 },
      { latitude: 25.2048, longitude: 55.2708 }
    );
    expect(d).toBe(0);
  });

  it('computes ~121km between Dubai (25.2048, 55.2708) and Abu Dhabi (24.4539, 54.3773)', () => {
    const d = GPSGeofenceService.calculateDistance(
      { latitude: 25.2048, longitude: 55.2708 },
      { latitude: 24.4539, longitude: 54.3773 }
    );
    expect(d).toBeGreaterThan(115_000);
    expect(d).toBeLessThan(125_000);
  });

  it('computes ~111km between 1° latitude apart (worst-case meridian distance)', () => {
    const d = GPSGeofenceService.calculateDistance(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 }
    );
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });
});

describe('GPSGeofenceService.isWithinCircularGeofence', () => {
  const center = { latitude: 25.2048, longitude: 55.2708 };

  it('returns true for exact center', () => {
    expect(GPSGeofenceService.isWithinCircularGeofence(center, center, 100)).toBe(true);
  });

  it('returns true for point inside radius', () => {
    expect(
      GPSGeofenceService.isWithinCircularGeofence(
        { latitude: 25.2049, longitude: 55.2709 }, // ~10-15m away
        center,
        100
      )
    ).toBe(true);
  });

  it('returns false for point outside radius', () => {
    expect(
      GPSGeofenceService.isWithinCircularGeofence(
        { latitude: 25.21, longitude: 55.28 }, // ~1km away
        center,
        100
      )
    ).toBe(false);
  });
});

describe('GPSGeofenceService.isWithinPolygonGeofence', () => {
  // A small square polygon in Dubai (rough approximation)
  const square = [
    { latitude: 25.20, longitude: 55.27 },
    { latitude: 25.21, longitude: 55.27 },
    { latitude: 25.21, longitude: 55.28 },
    { latitude: 25.20, longitude: 55.28 },
  ];

  it('returns true for point inside the polygon', () => {
    expect(
      GPSGeofenceService.isWithinPolygonGeofence(
        { latitude: 25.205, longitude: 55.275 },
        square
      )
    ).toBe(true);
  });

  it('returns false for point outside the polygon', () => {
    expect(
      GPSGeofenceService.isWithinPolygonGeofence(
        { latitude: 25.30, longitude: 55.30 },
        square
      )
    ).toBe(false);
  });

  it('returns false for empty / degenerate polygon (< 3 vertices)', () => {
    expect(
      GPSGeofenceService.isWithinPolygonGeofence({ latitude: 25.2, longitude: 55.2 }, [])
    ).toBe(false);
    expect(
      GPSGeofenceService.isWithinPolygonGeofence({ latitude: 25.2, longitude: 55.2 }, [
        { latitude: 25.2, longitude: 55.2 },
        { latitude: 25.2, longitude: 55.3 },
      ])
    ).toBe(false);
  });
});

describe('GPSGeofenceService.detectLocationSpoofing', () => {
  const baseCoord: any = { latitude: 25.2048, longitude: 55.2708, accuracy: 10 };

  it('returns low risk for normal punch with no history', () => {
    const result = GPSGeofenceService.detectLocationSpoofing('emp-1', baseCoord, []);
    expect(result.riskScore).toBeLessThan(50);
    expect(result.isSuspicious).toBeFalsy();
  });

  it('flags zero-accuracy as suspicious (likely mock location)', () => {
    const result = GPSGeofenceService.detectLocationSpoofing(
      'emp-1',
      { ...baseCoord, accuracy: 0 },
      []
    );
    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.reasons.some((r: string) => /mock/i.test(r))).toBe(true);
  });

  it('flags perfectly round coordinates as suspicious', () => {
    const result = GPSGeofenceService.detectLocationSpoofing(
      'emp-1',
      { latitude: 25.0, longitude: 55.0, accuracy: 10 },
      []
    );
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('detects impossible travel between consecutive punches', () => {
    const previous = [
      {
        latitude: 24.4539,
        longitude: 54.3773, // Abu Dhabi
        timestamp: new Date(Date.now() - 60 * 1000), // 1 minute ago
        punchType: 'CLOCK_IN' as const,
      },
    ];
    const result = GPSGeofenceService.detectLocationSpoofing(
      'emp-1',
      baseCoord, // Dubai, 1 min later
      previous
    );
    // Dubai to AD in 1 min = >7000 km/h — impossible
    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.reasons.some((r: string) => /speed/i.test(r) || /travel/i.test(r))).toBe(true);
  });

  it('returns a risk score capped at 100', () => {
    const previous = [
      {
        latitude: 24.4539,
        longitude: 54.3773,
        timestamp: new Date(Date.now() - 30 * 1000),
        punchType: 'CLOCK_IN' as const,
      },
    ];
    const result = GPSGeofenceService.detectLocationSpoofing(
      'emp-1',
      { latitude: 25.0, longitude: 55.0, accuracy: 0 }, // every flag
      previous
    );
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});
