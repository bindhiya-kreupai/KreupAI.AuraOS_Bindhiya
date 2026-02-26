/**
 * Unit Tests — Attendance Service
 *
 * Covers clock-in/out calculations, break deductions, overtime detection,
 * late arrival, early departure, and anomaly detection.
 *
 * @module tests/unit/services
 */

import { describe, test, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Inline attendance service helpers
// ---------------------------------------------------------------------------

interface AttendanceEntry {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: Date;
  clockOut: Date | null;
  breaks: BreakEntry[];
  locationId?: string;
  geoCoordinates?: { lat: number; lng: number };
  ipAddress?: string;
}

interface BreakEntry {
  breakStart: Date;
  breakEnd: Date;
}

interface ShiftDefinition {
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  lateThresholdMinutes: number;
  earlyDepartureThresholdMinutes: number;
  standardWorkMinutes: number; // e.g. 480 for 8 hours
  overtimeThresholdMinutes: number;
}

// Calculate total break duration in minutes
function calculateBreakMinutes(breaks: BreakEntry[]): number {
  return breaks.reduce((total, b) => {
    const ms = b.breakEnd.getTime() - b.breakStart.getTime();
    return total + ms / 60_000;
  }, 0);
}

// Calculate net work minutes (clock-in to clock-out minus breaks)
function calculateNetWorkMinutes(entry: AttendanceEntry): number | null {
  if (!entry.clockOut) return null;
  const totalMs = entry.clockOut.getTime() - entry.clockIn.getTime();
  const totalMinutes = totalMs / 60_000;
  const breakMinutes = calculateBreakMinutes(entry.breaks);
  return Math.max(0, totalMinutes - breakMinutes);
}

// Detect overtime
function detectOvertime(
  netWorkMinutes: number,
  shift: ShiftDefinition
): number {
  const excess = netWorkMinutes - shift.overtimeThresholdMinutes;
  return Math.max(0, excess);
}

// Parse HH:mm to minutes since midnight
function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Detect late arrival (returns minutes late, or 0)
function detectLateArrival(clockIn: Date, shift: ShiftDefinition): number {
  const shiftStartMinutes = parseTimeToMinutes(shift.startTime);
  const clockInMinutes = clockIn.getHours() * 60 + clockIn.getMinutes();
  const lateMinutes = clockInMinutes - shiftStartMinutes;
  if (lateMinutes > shift.lateThresholdMinutes) return lateMinutes;
  return 0;
}

// Detect early departure (returns minutes early, or 0)
function detectEarlyDeparture(clockOut: Date, shift: ShiftDefinition): number {
  const shiftEndMinutes = parseTimeToMinutes(shift.endTime);
  const clockOutMinutes = clockOut.getHours() * 60 + clockOut.getMinutes();
  const earlyMinutes = shiftEndMinutes - clockOutMinutes;
  if (earlyMinutes > shift.earlyDepartureThresholdMinutes) return earlyMinutes;
  return 0;
}

// ---------------------------------------------------------------------------
// Anomaly Detection
// ---------------------------------------------------------------------------

type AnomalyType = 'impossible_travel' | 'rapid_reclocking' | 'location_mismatch' | 'time_gap';

interface AnomalyResult {
  detected: boolean;
  type?: AnomalyType;
  severity?: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
}

function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6_371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const a1 =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
}

function detectImpossibleTravel(
  prevEntry: AttendanceEntry,
  newClockIn: Date,
  newCoords: { lat: number; lng: number },
  maxSpeedKmh = 200
): AnomalyResult {
  if (!prevEntry.clockOut || !prevEntry.geoCoordinates || !newCoords) {
    return { detected: false };
  }

  const timeDiffHours =
    (newClockIn.getTime() - prevEntry.clockOut.getTime()) / 3_600_000;

  if (timeDiffHours <= 0) {
    return {
      detected: true,
      type: 'impossible_travel',
      severity: 'high',
      details: { reason: 'clock_in_before_clock_out' },
    };
  }

  const distanceKm = haversineDistanceKm(prevEntry.geoCoordinates, newCoords);
  const requiredSpeedKmh = distanceKm / timeDiffHours;

  if (requiredSpeedKmh > maxSpeedKmh) {
    return {
      detected: true,
      type: 'impossible_travel',
      severity: 'high',
      details: { distanceKm, timeDiffHours, requiredSpeedKmh },
    };
  }

  return { detected: false };
}

function detectRapidReclocking(
  lastClockIn: Date,
  newClockIn: Date,
  minGapMinutes = 60
): AnomalyResult {
  const gapMinutes =
    (newClockIn.getTime() - lastClockIn.getTime()) / 60_000;

  if (gapMinutes < minGapMinutes) {
    return {
      detected: true,
      type: 'rapid_reclocking',
      severity: gapMinutes < 5 ? 'high' : 'medium',
      details: { gapMinutes },
    };
  }
  return { detected: false };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const STANDARD_SHIFT: ShiftDefinition = {
  startTime: '09:00',
  endTime: '18:00',
  lateThresholdMinutes: 15,
  earlyDepartureThresholdMinutes: 15,
  standardWorkMinutes: 480,
  overtimeThresholdMinutes: 480,
};

function makeDate(timeStr: string): Date {
  // Use 2025-03-10 as the base date
  return new Date(`2025-03-10T${timeStr}:00.000Z`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Attendance Service — Work Hour Calculation', () => {
  test('calculates total work minutes from clock-in to clock-out', () => {
    const entry: AttendanceEntry = {
      id: 'att-001', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('09:00'),
      clockOut: makeDate('18:00'),
      breaks: [],
    };
    expect(calculateNetWorkMinutes(entry)).toBe(540);
  });

  test('returns null when employee has not clocked out', () => {
    const entry: AttendanceEntry = {
      id: 'att-002', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('09:00'),
      clockOut: null,
      breaks: [],
    };
    expect(calculateNetWorkMinutes(entry)).toBeNull();
  });

  test('handles exactly 8 hours of work', () => {
    const entry: AttendanceEntry = {
      id: 'att-003', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('08:00'),
      clockOut: makeDate('16:00'),
      breaks: [],
    };
    expect(calculateNetWorkMinutes(entry)).toBe(480);
  });
});

describe('Attendance Service — Break Deduction', () => {
  test('deducts break duration from total work minutes', () => {
    const entry: AttendanceEntry = {
      id: 'att-004', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('09:00'),
      clockOut: makeDate('18:00'),
      breaks: [
        { breakStart: makeDate('13:00'), breakEnd: makeDate('14:00') }, // 60 min
      ],
    };
    expect(calculateNetWorkMinutes(entry)).toBe(480); // 540 - 60
  });

  test('handles multiple breaks', () => {
    const entry: AttendanceEntry = {
      id: 'att-005', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('08:00'),
      clockOut: makeDate('18:00'),
      breaks: [
        { breakStart: makeDate('10:30'), breakEnd: makeDate('10:45') }, // 15 min
        { breakStart: makeDate('13:00'), breakEnd: makeDate('14:00') }, // 60 min
      ],
    };
    expect(calculateNetWorkMinutes(entry)).toBe(525); // 600 - 75
  });

  test('zero breaks gives full duration', () => {
    expect(calculateBreakMinutes([])).toBe(0);
  });
});

describe('Attendance Service — Overtime Detection', () => {
  test('detects overtime when work exceeds standard hours', () => {
    const overtime = detectOvertime(540, STANDARD_SHIFT); // 540 > 480
    expect(overtime).toBe(60);
  });

  test('no overtime when work equals standard hours', () => {
    expect(detectOvertime(480, STANDARD_SHIFT)).toBe(0);
  });

  test('no overtime when work is less than standard hours', () => {
    expect(detectOvertime(400, STANDARD_SHIFT)).toBe(0);
  });
});

describe('Attendance Service — Late Arrival Detection', () => {
  test('detects late arrival beyond threshold', () => {
    const lateClockIn = new Date('2025-03-10T09:30:00');
    const lateMinutes = detectLateArrival(lateClockIn, STANDARD_SHIFT);
    expect(lateMinutes).toBe(30); // 30 min late
  });

  test('within grace period is not flagged as late', () => {
    const onTimeClockIn = new Date('2025-03-10T09:10:00');
    expect(detectLateArrival(onTimeClockIn, STANDARD_SHIFT)).toBe(0);
  });

  test('exact shift start time is not late', () => {
    const exactStart = new Date('2025-03-10T09:00:00');
    expect(detectLateArrival(exactStart, STANDARD_SHIFT)).toBe(0);
  });
});

describe('Attendance Service — Early Departure Detection', () => {
  test('detects early departure beyond threshold', () => {
    const earlyClockOut = new Date('2025-03-10T17:20:00');
    const earlyMinutes = detectEarlyDeparture(earlyClockOut, STANDARD_SHIFT);
    expect(earlyMinutes).toBe(40); // 40 min early
  });

  test('within grace period is not flagged as early departure', () => {
    const nearEnd = new Date('2025-03-10T17:50:00');
    expect(detectEarlyDeparture(nearEnd, STANDARD_SHIFT)).toBe(0);
  });

  test('clock-out after shift end is not early departure', () => {
    const lateClockOut = new Date('2025-03-10T19:00:00');
    expect(detectEarlyDeparture(lateClockOut, STANDARD_SHIFT)).toBe(0);
  });
});

describe('Attendance Service — Anomaly Detection', () => {
  test('detects impossible travel: two locations too far apart in short time', () => {
    const prev: AttendanceEntry = {
      id: 'att-010', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('09:00'),
      clockOut: makeDate('18:00'),
      geoCoordinates: { lat: 25.2048, lng: 55.2708 }, // Dubai
      breaks: [],
    };

    // Tokyo, Japan — ~7,900 km away, only 30 min later
    const anomaly = detectImpossibleTravel(
      prev,
      makeDate('18:30'),
      { lat: 35.6762, lng: 139.6503 }
    );

    expect(anomaly.detected).toBe(true);
    expect(anomaly.type).toBe('impossible_travel');
    expect(anomaly.severity).toBe('high');
  });

  test('no anomaly for travel within plausible speed', () => {
    const prev: AttendanceEntry = {
      id: 'att-011', employeeId: 'emp-001', date: '2025-03-10',
      clockIn: makeDate('09:00'),
      clockOut: makeDate('18:00'),
      geoCoordinates: { lat: 25.2048, lng: 55.2708 }, // Dubai
      breaks: [],
    };

    // Abu Dhabi — ~130 km, 2 hours later → ~65 km/h, well under 200 km/h
    const nextDay = new Date('2025-03-11T08:00:00.000Z');
    const anomaly = detectImpossibleTravel(
      prev,
      nextDay,
      { lat: 24.4539, lng: 54.3773 }
    );

    expect(anomaly.detected).toBe(false);
  });

  test('detects rapid re-clocking within minimum gap', () => {
    const lastClockIn = new Date('2025-03-10T09:00:00');
    const newClockIn = new Date('2025-03-10T09:02:00'); // 2 min later
    const anomaly = detectRapidReclocking(lastClockIn, newClockIn);

    expect(anomaly.detected).toBe(true);
    expect(anomaly.type).toBe('rapid_reclocking');
    expect(anomaly.severity).toBe('high');
  });

  test('no anomaly when gap exceeds minimum', () => {
    const lastClockIn = new Date('2025-03-10T08:00:00');
    const newClockIn = new Date('2025-03-10T09:30:00'); // 90 min later
    const anomaly = detectRapidReclocking(lastClockIn, newClockIn);
    expect(anomaly.detected).toBe(false);
  });
});
