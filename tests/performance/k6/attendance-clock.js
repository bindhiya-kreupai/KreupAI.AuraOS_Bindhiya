/**
 * @file attendance-clock.js
 * @description k6 load test for Attendance Clock-In/Out.
 *
 * Simulates 1000 concurrent employees clocking in at shift start.
 * Tests the system's ability to handle a thundering herd of punch events.
 *
 * Usage:
 *  k6 run --env API_URL=http://your-api attendance-clock.js
 */

import http   from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import {
  login,
  authHeaders,
  checkResponse,
  API_URL,
} from './common/helpers.js';

// ── Custom metrics ──────────────────────────────────────────────────────────

const clockInDuration   = new Trend('attendance_clock_in_ms', true);
const clockOutDuration  = new Trend('attendance_clock_out_ms', true);
const duplicatePunches  = new Counter('duplicate_punch_attempts');
const clockInErrors     = new Counter('clock_in_errors');
const shiftStartRate    = new Rate('shift_start_success_rate');

// ── Shift simulation ────────────────────────────────────────────────────────

/**
 * Simulates GPS coordinates near an office (Dubai office)
 */
function generateLocation() {
  return {
    latitude:  25.2048 + (Math.random() - 0.5) * 0.001,
    longitude: 55.2708 + (Math.random() - 0.5) * 0.001,
    accuracy:  Math.floor(5 + Math.random() * 15),
  };
}

/**
 * Generates a biometric punch payload
 */
function generatePunchPayload(employeeId, type = 'IN') {
  return {
    employeeId,
    type,
    timestamp:    new Date().toISOString(),
    location:     generateLocation(),
    deviceId:     `terminal_${Math.floor(Math.random() * 20) + 1}`,
    method:       ['BIOMETRIC', 'RFID', 'PIN', 'MOBILE'][Math.floor(Math.random() * 4)],
    shiftId:      `shift_morning_${new Date().toISOString().slice(0, 10)}`,
  };
}

// ── Options ─────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Baseline: normal trickle of clock-ins throughout the day
    normal_clocking: {
      executor:  'constant-arrival-rate',
      rate:      100,              // 100 punches per second
      timeUnit:  '1s',
      duration:  '3m',
      preAllocatedVUs: 50,
      maxVUs:    100,
      tags:      { scenario: 'normal' },
    },

    // Shift start: 1000 employees arrive simultaneously (thundering herd)
    shift_start_spike: {
      executor:    'ramping-arrival-rate',
      startTime:   '4m',           // run after normal test warms up
      startRate:   10,
      timeUnit:    '1s',
      stages: [
        { duration: '10s', target: 1000 },  // spike to 1000 clock-ins/sec
        { duration: '30s', target: 1000 },  // hold
        { duration: '20s', target: 50   },  // die down
        { duration: '1m',  target: 50   },  // normal again
      ],
      preAllocatedVUs: 500,
      maxVUs:          1200,
      tags:            { scenario: 'shift_start_spike' },
    },
  },

  thresholds: {
    // Clock-in must respond within 300ms at p95 during normal load
    'attendance_clock_in_ms{scenario:normal}':             ['p(95)<300'],
    // Under spike, allow up to 1 second
    'attendance_clock_in_ms{scenario:shift_start_spike}':  ['p(95)<1000'],
    'http_req_failed':                                      ['rate<0.02'],  // 2% error budget
    'shift_start_success_rate':                             ['rate>0.98'],
  },
};

// ── Setup ────────────────────────────────────────────────────────────────────

export function setup() {
  const token = login(
    __ENV.HR_EMAIL ?? 'hr-admin@auraos.test',
    __ENV.HR_PASS  ?? 'Hr@Admin123456',
  );

  // Pre-create a pool of employee IDs (simulate existing employees)
  const employeeIds = Array.from({ length: 1000 }, (_, i) => `emp_load_${String(i + 1).padStart(5, '0')}`);

  return { token, employeeIds };
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function (data) {
  const { token, employeeIds } = data;
  if (!token || !employeeIds?.length) return;

  const headers   = authHeaders(token);
  const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];

  // ── Clock In ────────────────────────────────────────────────────────────

  const clockInStart = Date.now();
  let punchId = null;

  group('Clock In', () => {
    const payload = generatePunchPayload(employeeId, 'IN');
    const resp    = http.post(
      `${API_URL}/api/attendance/punch`,
      JSON.stringify(payload),
      { headers, tags: { name: 'clock_in' } },
    );

    const ok = check(resp, {
      'clock in 201 or 200':    (r) => r.status === 201 || r.status === 200,
      'clock in has punchId':   (r) => JSON.parse(r.body || '{}').id !== undefined,
      'clock in < 500ms':       (r) => r.timings.duration < 500,
    });

    clockInDuration.add(Date.now() - clockInStart);

    if (ok) {
      shiftStartRate.add(1);
      try { punchId = JSON.parse(resp.body).id; } catch { /* ignore */ }
    } else {
      shiftStartRate.add(0);
      clockInErrors.add(1);
      // Check for duplicate punch (409)
      if (resp.status === 409) duplicatePunches.add(1);
    }
  });

  // Simulate work period (compressed for test)
  sleep(Math.random() * 2 + 0.5);

  // ── Get attendance record ───────────────────────────────────────────────

  group('Get Today Attendance', () => {
    const today = new Date().toISOString().slice(0, 10);
    const resp  = http.get(
      `${API_URL}/api/attendance?employeeId=${employeeId}&date=${today}`,
      { headers, tags: { name: 'attendance_get' } },
    );
    checkResponse(resp, 'Get attendance');
  });

  sleep(0.5);

  // ── Clock Out (50% of the time) ─────────────────────────────────────────

  if (punchId && Math.random() > 0.5) {
    group('Clock Out', () => {
      const clockOutStart = Date.now();
      const payload       = generatePunchPayload(employeeId, 'OUT');

      const resp = http.post(
        `${API_URL}/api/attendance/punch`,
        JSON.stringify(payload),
        { headers, tags: { name: 'clock_out' } },
      );

      check(resp, {
        'clock out 200 or 201': (r) => r.status === 200 || r.status === 201,
        'clock out < 500ms':    (r) => r.timings.duration < 500,
      });

      clockOutDuration.add(Date.now() - clockOutStart);
    });
  }

  sleep(Math.random() * 1.5);
}

export function teardown() {
  console.log('[attendance-clock] Attendance load test completed.');
}
