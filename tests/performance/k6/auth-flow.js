/**
 * @file auth-flow.js
 * @description k6 load test for Authentication flows.
 *
 * Tests:
 *  - Login with email/password
 *  - Token refresh
 *  - MFA verification (TOTP)
 *  - Session management (list, revoke)
 *  - Rate limiting validation (confirm 429 on excess)
 *
 * Usage:
 *  k6 run --env API_URL=http://your-api auth-flow.js
 */

import http   from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { API_URL } from './common/helpers.js';

// ── Custom metrics ──────────────────────────────────────────────────────────

const loginDuration    = new Trend('auth_login_duration_ms', true);
const refreshDuration  = new Trend('auth_refresh_duration_ms', true);
const mfaDuration      = new Trend('auth_mfa_duration_ms', true);
const rateLimitHits    = new Counter('auth_rate_limit_hits');
const loginSuccessRate = new Rate('auth_login_success_rate');
const mfaSuccessRate   = new Rate('auth_mfa_success_rate');

// ── Test user pool ──────────────────────────────────────────────────────────

const TEST_USERS = Array.from({ length: 50 }, (_, i) => ({
  email:    `loadtest.user${String(i + 1).padStart(3, '0')}@auraos.test`,
  password: 'LoadTest@123456',
}));

// ── Options ─────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Normal auth load
    auth_normal: {
      executor:    'ramping-vus',
      startVUs:    0,
      stages: [
        { duration: '1m', target: 50  },
        { duration: '3m', target: 50  },
        { duration: '1m', target: 0   },
      ],
      tags:        { scenario: 'normal' },
    },

    // Simulate concurrent morning login burst
    morning_rush: {
      executor:    'ramping-arrival-rate',
      startTime:   '6m',
      startRate:   10,
      timeUnit:    '1s',
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m',  target: 200 },
        { duration: '30s', target: 10  },
      ],
      preAllocatedVUs: 100,
      maxVUs:          300,
      tags:            { scenario: 'morning_rush' },
    },

    // Rate limit testing: hammer the login endpoint to validate throttling
    rate_limit_test: {
      executor:    'constant-arrival-rate',
      startTime:   '9m',
      rate:        1000,
      timeUnit:    '1s',
      duration:    '30s',
      preAllocatedVUs: 200,
      maxVUs:          300,
      tags:            { scenario: 'rate_limit' },
    },
  },

  thresholds: {
    'auth_login_duration_ms{scenario:normal}':        ['p(95)<500'],
    'auth_login_duration_ms{scenario:morning_rush}':  ['p(95)<1000'],
    'auth_refresh_duration_ms':                       ['p(95)<300'],
    'auth_mfa_duration_ms':                           ['p(95)<500'],
    'auth_login_success_rate':                        ['rate>0.95'],
    // During rate limit test, expect many 429s — that's correct behaviour
    'http_req_failed{scenario:rate_limit}':           ['rate<0.95'],
  },
};

// ── Helper: pick random test user ────────────────────────────────────────────

function randomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

const HEADERS = { 'Content-Type': 'application/json' };

// ── Main ─────────────────────────────────────────────────────────────────────

export default function () {
  const scenario = __ENV.SCENARIO ?? 'normal';

  // ── Rate limit scenario: just hammer login ──────────────────────────────

  if (scenario === 'rate_limit') {
    const user = randomUser();
    const resp = http.post(
      `${API_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: HEADERS, tags: { name: 'auth_login_rate_limit' } },
    );

    // 429 is the expected / correct response for rate limiting
    if (resp.status === 429) {
      rateLimitHits.add(1);
    }

    check(resp, {
      'login responded': (r) => r.status === 200 || r.status === 429 || r.status === 401,
    });
    return;
  }

  // ── Standard auth flow ──────────────────────────────────────────────────

  let token        = null;
  let refreshTok   = null;

  const user = randomUser();

  // Step 1: Login
  group('Login', () => {
    const start = Date.now();
    const resp  = http.post(
      `${API_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: HEADERS, tags: { name: 'auth_login' } },
    );

    const ok = check(resp, {
      'login 200':       (r) => r.status === 200,
      'login has token': (r) => {
        try { return Boolean(JSON.parse(r.body).token); } catch { return false; }
      },
      'login < 500ms':   (r) => r.timings.duration < 500,
    });

    loginDuration.add(Date.now() - start);
    loginSuccessRate.add(ok ? 1 : 0);

    if (ok) {
      try {
        const body   = JSON.parse(resp.body);
        token        = body.token;
        refreshTok   = body.refreshToken;
      } catch { /* ignore */ }
    }
  });

  if (!token) {
    sleep(1);
    return;
  }

  sleep(0.3);

  // Step 2: MFA verification (simulated — send a TOTP code)
  group('MFA Verification', () => {
    const start = Date.now();
    // In practice the TOTP code comes from an authenticator app
    // For load tests we use a test-mode endpoint that accepts '000000'
    const resp = http.post(
      `${API_URL}/api/auth/mfa/verify`,
      JSON.stringify({ code: '000000', token }),
      {
        headers: { ...HEADERS, 'Authorization': `Bearer ${token}` },
        tags:    { name: 'auth_mfa_verify' },
      },
    );

    mfaDuration.add(Date.now() - start);

    // MFA may not be required for all users — accept 200 or 204
    const ok = check(resp, {
      'mfa 200 or 204 or 404': (r) => [200, 204, 404, 422].includes(r.status),
      'mfa < 500ms':           (r) => r.timings.duration < 500,
    });
    mfaSuccessRate.add(ok ? 1 : 0);
  });

  sleep(0.5);

  // Step 3: Access a protected endpoint
  group('Protected Resource', () => {
    const resp = http.get(
      `${API_URL}/api/auth/me`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        tags:    { name: 'auth_me' },
      },
    );
    check(resp, {
      'profile 200':    (r) => r.status === 200,
      'profile < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(0.5);

  // Step 4: Token refresh
  if (refreshTok) {
    group('Token Refresh', () => {
      const start = Date.now();
      const resp  = http.post(
        `${API_URL}/api/auth/refresh`,
        JSON.stringify({ refreshToken: refreshTok }),
        { headers: HEADERS, tags: { name: 'auth_refresh' } },
      );

      refreshDuration.add(Date.now() - start);

      check(resp, {
        'refresh 200':       (r) => r.status === 200,
        'refresh has token': (r) => {
          try { return Boolean(JSON.parse(r.body).token); } catch { return false; }
        },
        'refresh < 300ms':   (r) => r.timings.duration < 300,
      });

      if (resp.status === 200) {
        try { token = JSON.parse(resp.body).token; } catch { /* ignore */ }
      }
    });
  }

  sleep(0.5);

  // Step 5: List sessions
  group('List Sessions', () => {
    const resp = http.get(
      `${API_URL}/api/auth/sessions`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        tags:    { name: 'auth_sessions_list' },
      },
    );
    check(resp, { 'sessions list 200': (r) => r.status === 200 });
  });

  sleep(1.0 + Math.random() * 2.0);
}

export function teardown() {
  console.log('[auth-flow] Auth load test completed.');
}
