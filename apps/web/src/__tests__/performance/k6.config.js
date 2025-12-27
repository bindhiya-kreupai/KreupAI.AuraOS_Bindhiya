/**
 * k6 Performance Testing Configuration
 * Week 9-10: Performance Testing Setup
 *
 * This configuration defines:
 * - Test thresholds and SLAs
 * - Load test profiles
 * - Monitoring and reporting settings
 */

export const config = {
  // Application base URL
  baseURL: __ENV.BASE_URL || 'http://localhost:3006',

  // API base URL
  apiURL: __ENV.API_URL || 'http://localhost:3006/api/v1',

  // Test credentials
  testUsers: {
    admin: {
      email: 'admin@e2etest.com',
      password: 'Test@1234',
    },
    manager: {
      email: 'manager@e2etest.com',
      password: 'Test@1234',
    },
    user: {
      email: 'user@e2etest.com',
      password: 'Test@1234',
    },
  },

  // Performance thresholds (SLAs)
  thresholds: {
    // HTTP request duration (95th percentile should be under 500ms)
    http_req_duration: ['p(95)<500'],

    // API endpoints specific thresholds
    'http_req_duration{endpoint:login}': ['p(95)<300'],
    'http_req_duration{endpoint:employees}': ['p(95)<400'],
    'http_req_duration{endpoint:payroll}': ['p(95)<600'],
    'http_req_duration{endpoint:reports}': ['p(95)<1000'],

    // Success rate (99% of requests should succeed)
    http_req_failed: ['rate<0.01'],

    // Specific endpoint success rates
    'http_req_failed{endpoint:login}': ['rate<0.001'], // 99.9% success
    'http_req_failed{endpoint:employees}': ['rate<0.01'],

    // Iteration duration
    iteration_duration: ['p(95)<2000'],
  },

  // Load test profiles
  profiles: {
    // Smoke test - minimal load to verify functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },

    // Load test - normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },  // Ramp up to 10 users
        { duration: '5m', target: 10 },  // Stay at 10 users
        { duration: '2m', target: 50 },  // Ramp up to 50 users
        { duration: '5m', target: 50 },  // Stay at 50 users
        { duration: '2m', target: 0 },   // Ramp down to 0
      ],
      gracefulRampDown: '30s',
    },

    // Stress test - beyond normal load to find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 200 },  // Ramp up to 200 users
        { duration: '5m', target: 200 },  // Stay at 200 users
        { duration: '5m', target: 0 },    // Ramp down to 0
      ],
      gracefulRampDown: '1m',
    },

    // Spike test - sudden increase in load
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // Warm up
        { duration: '10s', target: 100 },  // Spike to 100 users
        { duration: '3m', target: 100 },   // Stay at spike
        { duration: '10s', target: 10 },   // Drop back down
        { duration: '1m', target: 0 },     // Recovery
      ],
    },

    // Soak test - sustained load over long period
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '1h',
    },

    // Breakpoint test - increase load until system breaks
    breakpoint: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 1000,
      stages: [
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '5m', target: 300 },
        { duration: '5m', target: 400 },
      ],
    },
  },

  // Response time SLAs (in milliseconds)
  sla: {
    login: {
      p50: 100,
      p95: 300,
      p99: 500,
    },
    employees: {
      list: { p50: 150, p95: 400, p99: 600 },
      get: { p50: 100, p95: 300, p99: 500 },
      create: { p50: 200, p95: 500, p99: 800 },
      update: { p50: 200, p95: 500, p99: 800 },
      delete: { p50: 150, p95: 400, p99: 600 },
    },
    payroll: {
      process: { p50: 2000, p95: 5000, p99: 10000 },
      payslips: { p50: 200, p95: 600, p99: 1000 },
    },
    reports: {
      generate: { p50: 500, p95: 1000, p99: 2000 },
      download: { p50: 300, p95: 800, p99: 1500 },
    },
  },

  // Reporting and monitoring
  reporting: {
    // InfluxDB configuration (if using)
    influxdb: {
      enabled: __ENV.INFLUXDB_ENABLED === 'true',
      url: __ENV.INFLUXDB_URL || 'http://localhost:8086',
      database: __ENV.INFLUXDB_DB || 'k6',
      username: __ENV.INFLUXDB_USER,
      password: __ENV.INFLUXDB_PASSWORD,
    },

    // Grafana dashboard URL (if configured)
    grafana: {
      enabled: __ENV.GRAFANA_ENABLED === 'true',
      url: __ENV.GRAFANA_URL || 'http://localhost:3000',
    },

    // JSON output
    json: {
      enabled: true,
      path: './performance-results/',
    },

    // HTML report
    html: {
      enabled: true,
      path: './performance-report/',
    },
  },

  // Think time configuration (simulated user delays)
  thinkTime: {
    min: 1,  // Minimum think time in seconds
    max: 3,  // Maximum think time in seconds
  },

  // Request timeout
  timeout: '30s',

  // Connection pooling
  batch: 10,
  batchPerHost: 6,

  // TLS/SSL configuration
  insecureSkipTLSVerify: true, // Only for testing environments

  // Tags for filtering results
  tags: {
    env: __ENV.TEST_ENV || 'local',
    project: 'auraos-hcm',
  },
};

// Helper function to get profile by name
export function getProfile(profileName) {
  const profile = config.profiles[profileName];
  if (!profile) {
    throw new Error(`Unknown profile: ${profileName}. Available: ${Object.keys(config.profiles).join(', ')}`);
  }
  return profile;
}

// Helper function to get test user
export function getTestUser(role = 'user') {
  const user = config.testUsers[role];
  if (!user) {
    throw new Error(`Unknown user role: ${role}`);
  }
  return user;
}

// Export individual configurations for use in test files
export const { baseURL, apiURL, thresholds, sla, thinkTime } = config;
