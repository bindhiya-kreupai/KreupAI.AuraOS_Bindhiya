/**
 * GPS/Geofencing Attendance Service
 * Phase 2: Core Enhancement - Attendance Enhancement
 *
 * Handles location-based attendance validation including:
 * - GPS clock-in/out validation against geofences
 * - Geofence perimeter management (circular and polygon)
 * - Location fraud detection (impossible travel, mock locations)
 * - Bulk punch validation for biometric device integration
 */

import { prisma } from '@aura/database';

// ============================================================================
// TYPES
// ============================================================================

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}

export type GeofenceType = 'CIRCLE' | 'POLYGON';

export interface GeofenceZone {
  id: string;
  tenantId: string;
  name: string;
  nameAr: string;
  type: GeofenceType;
  center?: GeoCoordinate;
  radius?: number; // meters (for CIRCLE type)
  polygon?: GeoCoordinate[]; // vertices (for POLYGON type)
  locationId?: string;
  isActive: boolean;
  allowedDuringRamadan: boolean;
}

export interface GPSPunchValidation {
  isValid: boolean;
  isWithinGeofence: boolean;
  distance: number; // meters to nearest zone boundary
  nearestZone: GeofenceZone | null;
  issues: string[];
  spoofingRisk: LocationFraudCheck;
}

export interface LocationFraudCheck {
  isSuspicious: boolean;
  riskScore: number; // 0-100
  reasons: string[];
  recommendation: 'ALLOW' | 'FLAG' | 'BLOCK';
}

export type PunchType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';

export interface BulkPunchEntry {
  employeeId: string;
  coordinate: GeoCoordinate;
  punchType: PunchType;
  timestamp: Date;
  deviceId?: string;
}

export interface BulkPunchResult {
  employeeId: string;
  punchType: PunchType;
  timestamp: Date;
  validation: GPSPunchValidation;
}

interface PreviousPunch {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

interface NearbyOffice {
  id: string;
  tenantId: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // km
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EARTH_RADIUS_METERS = 6_371_000; // Earth's mean radius in meters
const IMPOSSIBLE_SPEED_KMH = 900; // Speed threshold for impossible travel (km/h)
const MAX_ACCEPTABLE_ACCURACY_METERS = 100; // GPS readings above this are unreliable
const PERFECT_COORDINATE_DECIMALS = 6; // Suspicious if coords are round numbers
const MIN_PUNCH_INTERVAL_SECONDS = 30; // Minimum time between punches
const SPOOFING_RISK_HIGH_THRESHOLD = 70;
const SPOOFING_RISK_MEDIUM_THRESHOLD = 40;

// ============================================================================
// GPS GEOFENCE SERVICE
// ============================================================================

export class GPSGeofenceService {
  // ==========================================================================
  // CORE VALIDATION
  // ==========================================================================

  /**
   * Validate a GPS punch against configured geofences for the tenant.
   * Returns detailed validation result including spoofing risk assessment.
   */
  static async validateGPSPunch(
    tenantId: string,
    employeeId: string,
    coordinate: GeoCoordinate,
    punchType: PunchType
  ): Promise<GPSPunchValidation> {
    const issues: string[] = [];

    // Fetch active geofences for this tenant
    const geofences = await this.getActiveGeofences(tenantId);

    if (geofences.length === 0) {
      return {
        isValid: true,
        isWithinGeofence: true,
        distance: 0,
        nearestZone: null,
        issues: ['No geofences configured - punch allowed by default'],
        spoofingRisk: {
          isSuspicious: false,
          riskScore: 0,
          reasons: [],
          recommendation: 'ALLOW',
        },
      };
    }

    // Check coordinate validity
    if (!this.isValidCoordinate(coordinate)) {
      issues.push('Invalid GPS coordinates provided');
      return {
        isValid: false,
        isWithinGeofence: false,
        distance: -1,
        nearestZone: null,
        issues,
        spoofingRisk: {
          isSuspicious: true,
          riskScore: 90,
          reasons: ['Invalid coordinates'],
          recommendation: 'BLOCK',
        },
      };
    }

    // Check accuracy threshold
    if (
      coordinate.accuracy !== undefined &&
      coordinate.accuracy > MAX_ACCEPTABLE_ACCURACY_METERS
    ) {
      issues.push(
        `GPS accuracy too low: ${coordinate.accuracy}m (max ${MAX_ACCEPTABLE_ACCURACY_METERS}m)`
      );
    }

    // Find nearest geofence and check containment
    let nearestZone: GeofenceZone | null = null;
    let minDistance = Infinity;
    let isWithinAnyGeofence = false;

    for (const zone of geofences) {
      let distance: number;
      let isInside: boolean;

      if (zone.type === 'CIRCLE' && zone.center && zone.radius !== undefined) {
        distance = this.calculateDistance(coordinate, zone.center);
        isInside = this.isWithinCircularGeofence(coordinate, zone.center, zone.radius);
        // Distance from boundary (negative if inside)
        const distanceFromBoundary = distance - zone.radius;

        if (distanceFromBoundary < minDistance) {
          minDistance = distanceFromBoundary;
          nearestZone = zone;
        }
      } else if (zone.type === 'POLYGON' && zone.polygon && zone.polygon.length >= 3) {
        isInside = this.isWithinPolygonGeofence(coordinate, zone.polygon);
        distance = isInside ? 0 : this.distanceToPolygon(coordinate, zone.polygon);

        if (distance < minDistance) {
          minDistance = isInside ? -1 : distance;
          nearestZone = zone;
        }
      } else {
        continue;
      }

      if (isInside) {
        isWithinAnyGeofence = true;
      }
    }

    if (!isWithinAnyGeofence) {
      issues.push(
        `Location is ${Math.round(Math.max(0, minDistance))}m outside nearest geofence zone`
      );
    }

    // Fetch previous punches for fraud detection
    const previousPunches = await this.getRecentPunches(employeeId, 5);

    // Perform spoofing detection
    const spoofingRisk = this.detectLocationSpoofing(
      employeeId,
      coordinate,
      previousPunches
    );

    if (spoofingRisk.isSuspicious) {
      issues.push(...spoofingRisk.reasons);
    }

    const isValid =
      isWithinAnyGeofence &&
      issues.length === 0 &&
      spoofingRisk.recommendation !== 'BLOCK';

    return {
      isValid,
      isWithinGeofence: isWithinAnyGeofence,
      distance: Math.max(0, minDistance),
      nearestZone,
      issues,
      spoofingRisk,
    };
  }

  // ==========================================================================
  // GEOMETRIC CALCULATIONS
  // ==========================================================================

  /**
   * Check if a coordinate is within a circular geofence using the Haversine formula.
   * Returns true if the distance from coordinate to center is less than or equal to radius.
   */
  static isWithinCircularGeofence(
    coordinate: GeoCoordinate,
    center: GeoCoordinate,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(coordinate, center);
    return distance <= radiusMeters;
  }

  /**
   * Check if a coordinate is within a polygon geofence using the Ray Casting algorithm.
   * A ray is cast from the point to infinity. If it crosses an odd number of polygon edges,
   * the point is inside the polygon.
   */
  static isWithinPolygonGeofence(
    coordinate: GeoCoordinate,
    polygon: GeoCoordinate[]
  ): boolean {
    if (polygon.length < 3) {
      return false;
    }

    const { latitude: y, longitude: x } = coordinate;
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = polygon[i].latitude;
      const xi = polygon[i].longitude;
      const yj = polygon[j].latitude;
      const xj = polygon[j].longitude;

      // Check if the ray from (x, y) to the right intersects edge (i, j)
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Calculate the distance between two geographic coordinates using the Haversine formula.
   * Returns distance in meters.
   *
   * The Haversine formula accounts for the Earth's curvature by computing:
   *   a = sin^2(dlat/2) + cos(lat1) * cos(lat2) * sin^2(dlon/2)
   *   c = 2 * atan2(sqrt(a), sqrt(1-a))
   *   d = R * c
   */
  static calculateDistance(point1: GeoCoordinate, point2: GeoCoordinate): number {
    const lat1Rad = this.degreesToRadians(point1.latitude);
    const lat2Rad = this.degreesToRadians(point2.latitude);
    const deltaLatRad = this.degreesToRadians(point2.latitude - point1.latitude);
    const deltaLonRad = this.degreesToRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) *
        Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
  }

  // ==========================================================================
  // FRAUD DETECTION
  // ==========================================================================

  /**
   * Detect potential location spoofing by analyzing:
   * 1. Impossible travel speed between consecutive punches
   * 2. Mock location indicators (perfect coordinates, zero accuracy)
   * 3. Repeated exact coordinates
   * 4. Rapid consecutive punches from different locations
   */
  static detectLocationSpoofing(
    _employeeId: string,
    coordinate: GeoCoordinate,
    previousPunches: PreviousPunch[]
  ): LocationFraudCheck {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check 1: Mock location indicators - zero accuracy
    if (coordinate.accuracy === 0) {
      reasons.push('GPS accuracy is exactly zero - possible mock location');
      riskScore += 35;
    }

    // Check 2: Suspiciously perfect coordinates (exact round numbers)
    if (this.isPerfectCoordinate(coordinate.latitude, coordinate.longitude)) {
      reasons.push(
        'Coordinates appear artificially precise - possible spoofed location'
      );
      riskScore += 25;
    }

    // Check 3: Impossible travel detection
    if (previousPunches.length > 0) {
      const lastPunch = previousPunches[0];
      const timeDiffMs =
        new Date().getTime() - new Date(lastPunch.timestamp).getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

      if (timeDiffHours > 0) {
        const distanceKm =
          this.calculateDistance(
            coordinate,
            { latitude: lastPunch.latitude, longitude: lastPunch.longitude }
          ) / 1000;

        const speedKmh = distanceKm / timeDiffHours;

        if (speedKmh > IMPOSSIBLE_SPEED_KMH) {
          reasons.push(
            `Impossible travel detected: ${Math.round(speedKmh)} km/h ` +
              `(${Math.round(distanceKm)} km in ${Math.round(timeDiffHours * 60)} min)`
          );
          riskScore += 50;
        }
      }

      // Check 4: Rapid punches from different locations
      const timeDiffSeconds = timeDiffMs / 1000;
      if (timeDiffSeconds < MIN_PUNCH_INTERVAL_SECONDS) {
        const distanceMeters = this.calculateDistance(coordinate, {
          latitude: lastPunch.latitude,
          longitude: lastPunch.longitude,
        });
        if (distanceMeters > 50) {
          reasons.push(
            `Punch too soon after previous (${Math.round(timeDiffSeconds)}s) ` +
              `from different location (${Math.round(distanceMeters)}m away)`
          );
          riskScore += 30;
        }
      }
    }

    // Check 5: Repeated exact same coordinates across multiple punches
    if (previousPunches.length >= 3) {
      const exactMatches = previousPunches.filter(
        (p) =>
          p.latitude === coordinate.latitude &&
          p.longitude === coordinate.longitude
      );
      if (exactMatches.length >= 3) {
        reasons.push(
          'Exact same coordinates repeated across multiple punches - possible static mock'
        );
        riskScore += 20;
      }
    }

    // Check 6: Accuracy is undefined (some spoofing apps omit accuracy)
    if (coordinate.accuracy === undefined) {
      reasons.push('No GPS accuracy reported - may indicate mock location');
      riskScore += 10;
    }

    // Cap risk score at 100
    riskScore = Math.min(100, riskScore);

    // Determine recommendation
    let recommendation: LocationFraudCheck['recommendation'];
    if (riskScore >= SPOOFING_RISK_HIGH_THRESHOLD) {
      recommendation = 'BLOCK';
    } else if (riskScore >= SPOOFING_RISK_MEDIUM_THRESHOLD) {
      recommendation = 'FLAG';
    } else {
      recommendation = 'ALLOW';
    }

    return {
      isSuspicious: riskScore >= SPOOFING_RISK_MEDIUM_THRESHOLD,
      riskScore,
      reasons,
      recommendation,
    };
  }

  // ==========================================================================
  // GEOFENCE CRUD OPERATIONS
  // ==========================================================================

  /**
   * Fetch all active geofence zones for a tenant, optionally filtered by locationId.
   */
  static async getActiveGeofences(
    tenantId: string,
    locationId?: string
  ): Promise<GeofenceZone[]> {
    const where: Record<string, unknown> = {
      tenantId,
      isActive: true,
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const records = await prisma.geofenceLocation.findMany({
      where: where as { tenantId: string; isActive: boolean; locationId?: string },
    });

    return records.map((record) => this.mapDbToGeofenceZone(record));
  }

  /**
   * Create a new geofence zone for a tenant.
   */
  static async createGeofence(
    tenantId: string,
    zone: Omit<GeofenceZone, 'id' | 'tenantId'>
  ): Promise<GeofenceZone> {
    const data = {
      tenantId,
      name: zone.name,
      latitude: zone.center?.latitude ?? 0,
      longitude: zone.center?.longitude ?? 0,
      radius: zone.radius ?? 0,
      address: JSON.stringify({
        nameAr: zone.nameAr,
        type: zone.type,
        center: zone.center,
        polygon: zone.polygon,
        locationId: zone.locationId,
        allowedDuringRamadan: zone.allowedDuringRamadan,
      }),
      isActive: zone.isActive,
    };

    const record = await prisma.geofenceLocation.create({ data });

    return this.mapDbToGeofenceZone(record);
  }

  /**
   * Update an existing geofence zone.
   */
  static async updateGeofence(
    id: string,
    tenantId: string,
    updates: Partial<Omit<GeofenceZone, 'id' | 'tenantId'>>
  ): Promise<GeofenceZone> {
    // Verify the geofence belongs to this tenant
    const existing = await prisma.geofenceLocation.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error(`Geofence zone not found: ${id}`);
    }

    // Parse existing metadata
    let existingMeta: Record<string, unknown> = {};
    if (existing.address) {
      try {
        existingMeta = JSON.parse(existing.address);
      } catch {
        existingMeta = {};
      }
    }

    const data: Record<string, unknown> = {};

    if (updates.name !== undefined) {
      data.name = updates.name;
    }
    if (updates.center !== undefined) {
      data.latitude = updates.center.latitude;
      data.longitude = updates.center.longitude;
    }
    if (updates.radius !== undefined) {
      data.radius = updates.radius;
    }
    if (updates.isActive !== undefined) {
      data.isActive = updates.isActive;
    }

    // Update metadata in address JSON field
    const updatedMeta = {
      ...existingMeta,
      ...(updates.nameAr !== undefined && { nameAr: updates.nameAr }),
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.center !== undefined && { center: updates.center }),
      ...(updates.polygon !== undefined && { polygon: updates.polygon }),
      ...(updates.locationId !== undefined && { locationId: updates.locationId }),
      ...(updates.allowedDuringRamadan !== undefined && {
        allowedDuringRamadan: updates.allowedDuringRamadan,
      }),
    };
    data.address = JSON.stringify(updatedMeta);

    const record = await prisma.geofenceLocation.update({
      where: { id },
      data,
    });

    return this.mapDbToGeofenceZone(record);
  }

  /**
   * Soft delete a geofence zone by setting isActive to false.
   */
  static async deleteGeofence(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.geofenceLocation.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error(`Geofence zone not found: ${id}`);
    }

    await prisma.geofenceLocation.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ==========================================================================
  // LOCATION HISTORY AND QUERIES
  // ==========================================================================

  /**
   * Retrieve an employee's punch location history within a date range.
   */
  static async getEmployeeLocationHistory(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<
    {
      id: string;
      punchType: string;
      timestamp: Date;
      latitude: number | null;
      longitude: number | null;
      location: string | null;
      device: string | null;
    }[]
  > {
    const punches = await prisma.attendancePunch.findMany({
      where: {
        employeeId,
        punchTime: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
      orderBy: { punchTime: 'desc' },
      select: {
        id: true,
        punchType: true,
        punchTime: true,
        location: true,
        device: true,
      },
    });

    return punches.map((punch) => {
      const coords = this.parseLocationString(punch.location);
      return {
        id: punch.id,
        punchType: punch.punchType,
        timestamp: punch.punchTime,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        location: punch.location,
        device: punch.device,
      };
    });
  }

  /**
   * Validate a batch of punches for biometric device integration.
   * Processes multiple punches in parallel with geofence validation.
   */
  static async validateBulkPunches(
    tenantId: string,
    punches: BulkPunchEntry[]
  ): Promise<BulkPunchResult[]> {
    // Pre-fetch geofences once for the tenant
    const geofences = await this.getActiveGeofences(tenantId);

    const results: BulkPunchResult[] = [];

    for (const punch of punches) {
      // Get recent punches for this employee for fraud detection
      const previousPunches = await this.getRecentPunches(punch.employeeId, 3);

      const spoofingRisk = this.detectLocationSpoofing(
        punch.employeeId,
        punch.coordinate,
        previousPunches
      );

      // Check against geofences
      let nearestZone: GeofenceZone | null = null;
      let minDistance = Infinity;
      let isWithinAnyGeofence = false;
      const issues: string[] = [];

      for (const zone of geofences) {
        if (zone.type === 'CIRCLE' && zone.center && zone.radius !== undefined) {
          const distance = this.calculateDistance(punch.coordinate, zone.center);
          const distFromBoundary = distance - zone.radius;

          if (distFromBoundary < minDistance) {
            minDistance = distFromBoundary;
            nearestZone = zone;
          }

          if (distance <= zone.radius) {
            isWithinAnyGeofence = true;
          }
        } else if (
          zone.type === 'POLYGON' &&
          zone.polygon &&
          zone.polygon.length >= 3
        ) {
          const isInside = this.isWithinPolygonGeofence(
            punch.coordinate,
            zone.polygon
          );
          if (isInside) {
            isWithinAnyGeofence = true;
            minDistance = 0;
            nearestZone = zone;
          }
        }
      }

      if (!isWithinAnyGeofence && geofences.length > 0) {
        issues.push(
          `Location outside all configured geofences (${Math.round(Math.max(0, minDistance))}m from nearest)`
        );
      }

      if (spoofingRisk.isSuspicious) {
        issues.push(...spoofingRisk.reasons);
      }

      const isValid =
        (isWithinAnyGeofence || geofences.length === 0) &&
        spoofingRisk.recommendation !== 'BLOCK';

      results.push({
        employeeId: punch.employeeId,
        punchType: punch.punchType,
        timestamp: punch.timestamp,
        validation: {
          isValid,
          isWithinGeofence: isWithinAnyGeofence,
          distance: Math.max(0, minDistance),
          nearestZone,
          issues,
          spoofingRisk,
        },
      });
    }

    return results;
  }

  /**
   * Find office locations near a given coordinate within a specified radius.
   */
  static async getNearbyOffices(
    coordinate: GeoCoordinate,
    radiusKm: number
  ): Promise<NearbyOffice[]> {
    // Fetch all active geofence locations
    const allLocations = await prisma.geofenceLocation.findMany({
      where: { isActive: true },
    });

    const radiusMeters = radiusKm * 1000;
    const nearbyOffices: NearbyOffice[] = [];

    for (const loc of allLocations) {
      const distance = this.calculateDistance(coordinate, {
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      if (distance <= radiusMeters) {
        nearbyOffices.push({
          id: loc.id,
          tenantId: loc.tenantId,
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance: distance / 1000, // Convert to km
        });
      }
    }

    // Sort by distance ascending
    nearbyOffices.sort((a, b) => a.distance - b.distance);

    return nearbyOffices;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Convert degrees to radians
   */
  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate that a coordinate has reasonable lat/lon values
   */
  private static isValidCoordinate(coord: GeoCoordinate): boolean {
    return (
      coord.latitude >= -90 &&
      coord.latitude <= 90 &&
      coord.longitude >= -180 &&
      coord.longitude <= 180 &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude)
    );
  }

  /**
   * Check if coordinates appear to be artificially precise (round numbers).
   * Mock locations often produce perfectly round coordinates.
   */
  private static isPerfectCoordinate(lat: number, lon: number): boolean {
    const latStr = lat.toString();
    const lonStr = lon.toString();

    // Check if the decimal part is all zeros or very short (e.g., 25.0, 55.0)
    const latDecimals = latStr.includes('.') ? latStr.split('.')[1] : '';
    const lonDecimals = lonStr.includes('.') ? lonStr.split('.')[1] : '';

    // Perfectly round coordinates (e.g., 25.000000, 55.000000)
    if (latDecimals.length <= 1 && lonDecimals.length <= 1) {
      return true;
    }

    // Check for suspicious repeating patterns (e.g., 25.123123)
    if (latDecimals.length >= PERFECT_COORDINATE_DECIMALS) {
      const half = Math.floor(latDecimals.length / 2);
      const firstHalf = latDecimals.substring(0, half);
      const secondHalf = latDecimals.substring(half, half * 2);
      if (firstHalf === secondHalf && firstHalf.length >= 3) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate the minimum distance from a point to any edge of a polygon.
   */
  private static distanceToPolygon(
    point: GeoCoordinate,
    polygon: GeoCoordinate[]
  ): number {
    let minDistance = Infinity;
    const n = polygon.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const distance = this.distanceToLineSegment(point, polygon[i], polygon[j]);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance;
  }

  /**
   * Calculate minimum distance from a point to a line segment defined by two endpoints.
   * Uses projection to find the closest point on the segment.
   */
  private static distanceToLineSegment(
    point: GeoCoordinate,
    segStart: GeoCoordinate,
    segEnd: GeoCoordinate
  ): number {
    const d1 = this.calculateDistance(point, segStart);
    const d2 = this.calculateDistance(point, segEnd);
    const segLength = this.calculateDistance(segStart, segEnd);

    // If segment is degenerate (endpoints are the same)
    if (segLength === 0) {
      return d1;
    }

    // Project point onto the line and clamp to segment
    // Using an approximation suitable for short segments
    const dx = segEnd.longitude - segStart.longitude;
    const dy = segEnd.latitude - segStart.latitude;
    const px = point.longitude - segStart.longitude;
    const py = point.latitude - segStart.latitude;

    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));

    const projectedPoint: GeoCoordinate = {
      latitude: segStart.latitude + t * dy,
      longitude: segStart.longitude + t * dx,
    };

    const distToProjection = this.calculateDistance(point, projectedPoint);

    // Return the minimum of projection distance and endpoint distances
    return Math.min(distToProjection, d1, d2);
  }

  /**
   * Fetch recent punches for an employee (for fraud detection context).
   */
  private static async getRecentPunches(
    employeeId: string,
    limit: number
  ): Promise<PreviousPunch[]> {
    const punches = await prisma.attendancePunch.findMany({
      where: {
        employeeId,
        isDeleted: false,
        location: { not: null },
      },
      orderBy: { punchTime: 'desc' },
      take: limit,
      select: {
        punchTime: true,
        location: true,
      },
    });

    const results: PreviousPunch[] = [];
    for (const punch of punches) {
      const coords = this.parseLocationString(punch.location);
      if (coords) {
        results.push({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: punch.punchTime,
          accuracy: coords.accuracy,
        });
      }
    }
    return results;
  }

  /**
   * Parse a location string (e.g., "25.2048,55.2708" or JSON) into coordinates.
   */
  private static parseLocationString(
    location: string | null
  ): GeoCoordinate | null {
    if (!location) return null;

    // Try parsing as "lat,lon" format
    const parts = location.split(',');
    if (parts.length >= 2) {
      const latitude = parseFloat(parts[0].trim());
      const longitude = parseFloat(parts[1].trim());
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return { latitude, longitude };
      }
    }

    // Try parsing as JSON
    try {
      const parsed = JSON.parse(location);
      if (
        typeof parsed.latitude === 'number' &&
        typeof parsed.longitude === 'number'
      ) {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          accuracy: parsed.accuracy,
        };
      }
    } catch {
      // Not JSON
    }

    return null;
  }

  /**
   * Map a database GeofenceLocation record to the GeofenceZone domain type.
   * Extended metadata is stored in the address JSON field.
   */
  private static mapDbToGeofenceZone(record: {
    id: string;
    tenantId: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    address: string | null;
    isActive: boolean;
  }): GeofenceZone {
    let meta: Record<string, unknown> = {};
    if (record.address) {
      try {
        meta = JSON.parse(record.address);
      } catch {
        // address is a plain string, not JSON metadata
        meta = {};
      }
    }

    const type = (meta.type as GeofenceType) || 'CIRCLE';
    const center: GeoCoordinate =
      (meta.center as GeoCoordinate) || {
        latitude: record.latitude,
        longitude: record.longitude,
      };

    return {
      id: record.id,
      tenantId: record.tenantId,
      name: record.name,
      nameAr: (meta.nameAr as string) || record.name,
      type,
      center,
      radius: record.radius,
      polygon: (meta.polygon as GeoCoordinate[]) || undefined,
      locationId: (meta.locationId as string) || undefined,
      isActive: record.isActive,
      allowedDuringRamadan: (meta.allowedDuringRamadan as boolean) ?? true,
    };
  }
}
