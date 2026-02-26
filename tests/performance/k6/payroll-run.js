/**
 * @file payroll-run.js
 * @description k6 load test for Payroll processing endpoints.
 *
 * Simulates concurrent payroll runs with realistic employee counts.
 * Thresholds: p95 < 2000ms for calculation
 *
 * Usage:
 *  k6 run --env BASE_URL=http://your-api payroll-run.js
 */

import http          from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import {
  login,
  authHeaders,
  generatePayrollRun,
  checkResponse,
  thinkTime,
  API_URL,
} from './common/helpers.js';

// ── Custom metrics ──────────────────────────────────────────────────────────

const payrollRunDuration = new Trend('payroll_run_duration_ms', true);
const payrollRunsTotal   = new Counter('payroll_runs_total');
const payrollErrors      = new Counter('payroll_errors');

// ── Options ─────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Baseline: a few concurrent payroll runs
    normal_load: {
      executor:    'constant-vus',
      vus:         5,
      duration:    '5m',
      tags:        { scenario: 'normal_load' },
    },
    // Peak: simulate month-end concurrent runs
    peak_load: {
      executor:    'ramping-vus',
      startTime:   '6m',            // start after normal_load warms up
      startVUs:    0,
      stages: [
        { duration: '1m',  target: 20 },
        { duration: '3m',  target: 20 },
        { duration: '1m',  target: 0  },
      ],
      tags:        { scenario: 'peak_load' },
    },
  },

  thresholds: {
    // Payroll calculation must complete within 2 seconds at p95
    'http_req_duration{name:payroll_calculate}': ['p(95)<2000'],
    'http_req_duration{name:payroll_initiate}':  ['p(95)<1000'],
    'http_req_duration{name:payroll_status}':    ['p(95)<500'],
    'http_req_duration{name:payroll_finalize}':  ['p(95)<3000'],
    'payroll_run_duration_ms':                   ['p(95)<10000'],  // end-to-end < 10s
    'http_req_failed':                           ['rate<0.01'],
  },
};

// ── Setup ────────────────────────────────────────────────────────────────────

export function setup() {
  const token = login(
    __ENV.PAYROLL_EMAIL ?? 'payroll-admin@auraos.test',
    __ENV.PAYROLL_PASS  ?? 'Payroll@123456',
  );
  return { token };
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = authHeaders(token);
  const startMs = Date.now();
  let runId     = null;

  // Step 1: Initiate payroll run
  group('Initiate Payroll Run', () => {
    const payload = generatePayrollRun({
      period:   '2025-01',
      entityId: `entity_${Math.floor(Math.random() * 3) + 1}`,
    });

    const resp = http.post(
      `${API_URL}/api/payroll/runs`,
      JSON.stringify(payload),
      { headers, tags: { name: 'payroll_initiate' } },
    );

    const ok = check(resp, {
      'payroll initiate 201':  (r) => r.status === 201,
      'payroll has runId':     (r) => JSON.parse(r.body || '{}').id !== undefined,
      'initiate < 1000ms':     (r) => r.timings.duration < 1_000,
    });

    if (ok) {
      try { runId = JSON.parse(resp.body).id; } catch { /* ignore */ }
    } else {
      payrollErrors.add(1);
    }
  });

  if (!runId) return;

  thinkTime(0.5, 1.0);

  // Step 2: Trigger calculation
  group('Calculate Payroll', () => {
    const resp = http.post(
      `${API_URL}/api/payroll/runs/${runId}/calculate`,
      JSON.stringify({}),
      { headers, tags: { name: 'payroll_calculate' } },
    );

    check(resp, {
      'calculate 200':      (r) => r.status === 200,
      'calculate < 2000ms': (r) => r.timings.duration < 2_000,
    });
  });

  thinkTime(1.0, 3.0);

  // Step 3: Poll status
  group('Poll Payroll Status', () => {
    let attempts = 0;
    let completed = false;

    while (attempts < 10 && !completed) {
      const resp = http.get(
        `${API_URL}/api/payroll/runs/${runId}`,
        { headers, tags: { name: 'payroll_status' } },
      );

      checkResponse(resp, 'Payroll status');

      try {
        const body = JSON.parse(resp.body);
        if (body.status === 'CALCULATED' || body.status === 'COMPLETED' || body.status === 'FAILED') {
          completed = true;
          if (body.status === 'FAILED') payrollErrors.add(1);
        }
      } catch { /* ignore parse errors */ }

      if (!completed) sleep(1);
      attempts++;
    }
  });

  // Step 4: Finalize
  group('Finalize Payroll Run', () => {
    const resp = http.post(
      `${API_URL}/api/payroll/runs/${runId}/finalize`,
      JSON.stringify({ approvedBy: 'load-test-user' }),
      { headers, tags: { name: 'payroll_finalize' } },
    );

    check(resp, {
      'finalize 200':      (r) => r.status === 200 || r.status === 202,
      'finalize < 3000ms': (r) => r.timings.duration < 3_000,
    });
  });

  // Record end-to-end duration
  payrollRunDuration.add(Date.now() - startMs);
  payrollRunsTotal.add(1);

  thinkTime(2.0, 5.0);
}

export function teardown() {
  console.log('[payroll-run] Payroll load test completed.');
}
