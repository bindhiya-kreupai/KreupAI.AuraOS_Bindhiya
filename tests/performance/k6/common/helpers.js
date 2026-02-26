/**
 * @file helpers.js
 * @description Shared helpers for AuraOS k6 load tests.
 *              Provides: authentication, token management, data generation,
 *              and common assertion utilities.
 */

import http    from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend, Counter, Rate } from 'k6/metrics';

// ── Base config ─────────────────────────────────────────────────────────────

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const API_URL  = __ENV.API_URL  || 'http://localhost:4000'; // gateway

// ── Shared data arrays ──────────────────────────────────────────────────────

export const DEPARTMENTS = [
  'Engineering', 'Finance', 'HR', 'Marketing', 'Operations',
  'Sales', 'Legal', 'IT', 'Product', 'Customer Success',
];

export const JOB_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Product Manager',
  'HR Business Partner', 'Financial Analyst', 'Operations Manager',
  'Sales Executive', 'Marketing Specialist', 'DevOps Engineer', 'UX Designer',
];

// ── Auth helpers ────────────────────────────────────────────────────────────

/**
 * Login with email/password and return the JWT token.
 * Returns null on failure.
 */
export function login(email, password) {
  const resp = http.post(
    `${API_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags:    { name: 'auth_login' },
    },
  );

  const ok = check(resp, {
    'login status 200':   (r) => r.status === 200,
    'login has token':    (r) => JSON.parse(r.body || '{}').token !== undefined,
  });

  if (!ok) {
    console.error(`Login failed: ${resp.status} — ${resp.body}`);
    return null;
  }

  return JSON.parse(resp.body).token;
}

/**
 * Refresh an existing JWT token.
 */
export function refreshToken(refreshTok) {
  const resp = http.post(
    `${API_URL}/api/auth/refresh`,
    JSON.stringify({ refreshToken: refreshTok }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'auth_refresh' } },
  );

  check(resp, { 'token refresh 200': (r) => r.status === 200 });
  return JSON.parse(resp.body || '{}').token ?? null;
}

/**
 * Build Authorization headers from a token.
 */
export function authHeaders(token, extra = {}) {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
    ...extra,
  };
}

// ── Data generators ─────────────────────────────────────────────────────────

let _counter = 0;
function uid() {
  return `${Date.now()}-${++_counter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a realistic employee payload.
 */
export function generateEmployee(overrides = {}) {
  const id = uid();
  return {
    firstName:    `TestFirst${id}`,
    lastName:     `TestLast${id}`,
    email:        `employee.${id}@auraos-test.example`,
    phone:        `+971${Math.floor(500_000_000 + Math.random() * 499_999_999)}`,
    department:   DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    jobTitle:     JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)],
    employeeType: 'FULL_TIME',
    salary:       Math.floor(50_000 + Math.random() * 150_000),
    currency:     'AED',
    hireDate:     randomDateBetween('2020-01-01', '2024-12-01'),
    ...overrides,
  };
}

/**
 * Generate a leave request payload.
 */
export function generateLeaveRequest(employeeId, overrides = {}) {
  const startDate = randomDateBetween('2025-06-01', '2025-12-01');
  return {
    employeeId,
    leaveType:  'ANNUAL',
    startDate,
    endDate:    offsetDate(startDate, Math.floor(1 + Math.random() * 14)),
    reason:     'Annual leave request (load test)',
    ...overrides,
  };
}

/**
 * Generate a payroll run configuration.
 */
export function generatePayrollRun(overrides = {}) {
  return {
    period:      '2025-01',
    entityId:    'entity_001',
    type:        'MONTHLY',
    employeeIds: [],          // empty = all employees
    ...overrides,
  };
}

// ── Date utilities ──────────────────────────────────────────────────────────

function randomDateBetween(start, end) {
  const startMs = new Date(start).getTime();
  const endMs   = new Date(end).getTime();
  return new Date(startMs + Math.random() * (endMs - startMs)).toISOString().slice(0, 10);
}

function offsetDate(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Common check helpers ─────────────────────────────────────────────────────

export function checkResponse(resp, name, expectedStatus = 200) {
  return check(resp, {
    [`${name} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} response time < 2s`]:       (r) => r.timings.duration < 2_000,
    [`${name} has body`]:                 (r) => (r.body?.length ?? 0) > 0,
  });
}

export function checkCreated(resp, name) {
  return check(resp, {
    [`${name} status 201`]:    (r) => r.status === 201,
    [`${name} has id`]:        (r) => JSON.parse(r.body || '{}').id !== undefined,
    [`${name} response < 1s`]: (r) => r.timings.duration < 1_000,
  });
}

// ── Think time helpers ──────────────────────────────────────────────────────

export function thinkTime(minSecs = 0.5, maxSecs = 2.0) {
  sleep(minSecs + Math.random() * (maxSecs - minSecs));
}

// ── Custom metrics (shared across test files) ───────────────────────────────

export const customMetrics = {
  errorRate:     new Rate('aura_errors'),
  apiLatency:    new Trend('aura_api_latency', true),
  dbOperations:  new Counter('aura_db_operations'),
};
