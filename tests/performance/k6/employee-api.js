/**
 * @file employee-api.js
 * @description k6 load test for Employee CRUD API.
 *
 * Scenarios:
 *  - smoke:  1 VU, 1 min  (baseline sanity check)
 *  - load:   50 VUs, 10 min ramp-up → 5 min steady → ramp-down
 *  - stress: 200 VUs, progressive ramp
 *  - spike:  500 VUs instant spike, then back down
 *
 * Thresholds:
 *  - http_req_duration p95 < 500ms
 *  - error rate < 1%
 *
 * Usage:
 *  k6 run --env BASE_URL=http://your-api employee-api.js
 *  k6 run --env SCENARIO=smoke employee-api.js
 */

import http   from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  login,
  authHeaders,
  generateEmployee,
  checkResponse,
  checkCreated,
  thinkTime,
  API_URL,
} from './common/helpers.js';

// ── k6 Options ──────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    smoke: {
      executor:    'constant-vus',
      vus:         1,
      duration:    '1m',
      tags:        { scenario: 'smoke' },
      env:         { SCENARIO: 'smoke' },
    },
    load: {
      executor:    'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '2m',  target: 50  },   // ramp to 50 VUs
        { duration: '5m',  target: 50  },   // steady state
        { duration: '2m',  target: 0   },   // ramp down
      ],
      tags:        { scenario: 'load' },
      env:         { SCENARIO: 'load' },
    },
    stress: {
      executor:    'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '2m',  target: 100 },
        { duration: '3m',  target: 200 },
        { duration: '2m',  target: 200 },
        { duration: '2m',  target: 0   },
      ],
      tags:        { scenario: 'stress' },
      env:         { SCENARIO: 'stress' },
    },
    spike: {
      executor:    'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '30s', target: 500 },   // instant spike
        { duration: '1m',  target: 500 },   // hold at peak
        { duration: '30s', target: 0   },   // drop back
      ],
      tags:        { scenario: 'spike' },
      env:         { SCENARIO: 'spike' },
    },
  },

  thresholds: {
    // P95 response time under 500ms for all scenarios
    'http_req_duration{scenario:smoke}':  ['p(95)<500'],
    'http_req_duration{scenario:load}':   ['p(95)<500'],
    'http_req_duration{scenario:stress}': ['p(95)<1000'], // relaxed for stress
    'http_req_duration{scenario:spike}':  ['p(95)<2000'], // relaxed for spike

    // Global error rate < 1%
    'http_req_failed': ['rate<0.01'],

    // Custom CRUD-specific thresholds
    'http_req_duration{name:employee_list}':   ['p(95)<400'],
    'http_req_duration{name:employee_get}':    ['p(95)<200'],
    'http_req_duration{name:employee_create}': ['p(95)<600'],
    'http_req_duration{name:employee_update}': ['p(95)<500'],
  },
};

// ── Setup: authenticate once per scenario ───────────────────────────────────

export function setup() {
  const token = login(
    __ENV.ADMIN_EMAIL ?? 'admin@auraos.test',
    __ENV.ADMIN_PASS  ?? 'Admin@123456',
  );
  return { token };
}

// ── Main VU function ────────────────────────────────────────────────────────

export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = authHeaders(token);

  // ── LIST employees ──────────────────────────────────────────────────────

  group('List Employees', () => {
    const page = Math.floor(Math.random() * 5) + 1;
    const resp = http.get(
      `${API_URL}/api/employees?page=${page}&limit=20`,
      { headers, tags: { name: 'employee_list' } },
    );
    checkResponse(resp, 'List employees');
  });

  thinkTime(0.2, 0.8);

  // ── GET single employee ─────────────────────────────────────────────────

  let createdId = null;

  group('Create Employee', () => {
    const payload = generateEmployee();
    const resp    = http.post(
      `${API_URL}/api/employees`,
      JSON.stringify(payload),
      { headers, tags: { name: 'employee_create' } },
    );
    const ok = checkCreated(resp, 'Create employee');
    if (ok) {
      try { createdId = JSON.parse(resp.body).id; } catch { /* ignore */ }
    }
  });

  thinkTime(0.3, 1.0);

  if (createdId) {
    group('Get Employee', () => {
      const resp = http.get(
        `${API_URL}/api/employees/${createdId}`,
        { headers, tags: { name: 'employee_get' } },
      );
      checkResponse(resp, 'Get employee');
    });

    thinkTime(0.2, 0.5);

    group('Update Employee', () => {
      const resp = http.patch(
        `${API_URL}/api/employees/${createdId}`,
        JSON.stringify({ jobTitle: 'Updated Engineer', salary: 85_000 }),
        { headers, tags: { name: 'employee_update' } },
      );
      checkResponse(resp, 'Update employee');
    });

    thinkTime(0.2, 0.5);

    group('Search Employees', () => {
      const resp = http.get(
        `${API_URL}/api/employees/search?q=TestFirst&limit=10`,
        { headers, tags: { name: 'employee_search' } },
      );
      checkResponse(resp, 'Search employees');
    });
  }

  thinkTime(1.0, 3.0);
}

// ── Teardown ────────────────────────────────────────────────────────────────

export function teardown(data) {
  console.log(`[employee-api] Test completed. Token: ${data.token ? 'OK' : 'MISSING'}`);
}
