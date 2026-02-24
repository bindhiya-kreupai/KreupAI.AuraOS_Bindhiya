import { NextRequest, NextResponse } from 'next/server';

interface EndpointAnalytics {
  endpoint: string;
  method: string;
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successCount: number;
  errorCount: number;
  lastCalled: string;
}

interface OverallStats {
  totalRequests: number;
  avgResponseTime: number;
  overallErrorRate: number;
  uniqueEndpoints: number;
  peakRequestsPerMinute: number;
  periodStart: string;
  periodEnd: string;
}

interface ApiAnalyticsResponse {
  overall: OverallStats;
  endpoints: EndpointAnalytics[];
  topErrors: Array<{
    endpoint: string;
    method: string;
    statusCode: number;
    count: number;
    lastOccurred: string;
    message: string;
  }>;
}

const mockEndpointAnalytics: EndpointAnalytics[] = [
  {
    endpoint: '/api/v1/webhooks',
    method: 'GET',
    requestCount: 15420,
    avgResponseTime: 45,
    errorRate: 0.2,
    p95ResponseTime: 120,
    p99ResponseTime: 250,
    successCount: 15389,
    errorCount: 31,
    lastCalled: '2026-01-23T09:59:00Z',
  },
  {
    endpoint: '/api/v1/webhooks',
    method: 'POST',
    requestCount: 3200,
    avgResponseTime: 78,
    errorRate: 1.5,
    p95ResponseTime: 200,
    p99ResponseTime: 450,
    successCount: 3152,
    errorCount: 48,
    lastCalled: '2026-01-23T09:55:00Z',
  },
  {
    endpoint: '/api/v1/webhooks/:id',
    method: 'GET',
    requestCount: 28900,
    avgResponseTime: 32,
    errorRate: 0.8,
    p95ResponseTime: 85,
    p99ResponseTime: 180,
    successCount: 28669,
    errorCount: 231,
    lastCalled: '2026-01-23T09:58:00Z',
  },
  {
    endpoint: '/api/v1/webhooks/:id',
    method: 'PUT',
    requestCount: 1850,
    avgResponseTime: 92,
    errorRate: 2.1,
    p95ResponseTime: 250,
    p99ResponseTime: 500,
    successCount: 1811,
    errorCount: 39,
    lastCalled: '2026-01-23T09:45:00Z',
  },
  {
    endpoint: '/api/v1/webhooks/:id',
    method: 'DELETE',
    requestCount: 420,
    avgResponseTime: 55,
    errorRate: 0.5,
    p95ResponseTime: 130,
    p99ResponseTime: 280,
    successCount: 418,
    errorCount: 2,
    lastCalled: '2026-01-23T08:30:00Z',
  },
  {
    endpoint: '/api/v1/webhooks/:id/logs',
    method: 'GET',
    requestCount: 9800,
    avgResponseTime: 65,
    errorRate: 0.3,
    p95ResponseTime: 150,
    p99ResponseTime: 320,
    successCount: 9771,
    errorCount: 29,
    lastCalled: '2026-01-23T09:57:00Z',
  },
  {
    endpoint: '/api/v1/webhooks/:id/test',
    method: 'POST',
    requestCount: 2100,
    avgResponseTime: 1250,
    errorRate: 8.5,
    p95ResponseTime: 5000,
    p99ResponseTime: 15000,
    successCount: 1922,
    errorCount: 178,
    lastCalled: '2026-01-23T09:50:00Z',
  },
  {
    endpoint: '/api/v1/user/dashboard-preferences',
    method: 'GET',
    requestCount: 45000,
    avgResponseTime: 28,
    errorRate: 0.1,
    p95ResponseTime: 60,
    p99ResponseTime: 120,
    successCount: 44955,
    errorCount: 45,
    lastCalled: '2026-01-23T09:59:30Z',
  },
  {
    endpoint: '/api/v1/user/dashboard-preferences',
    method: 'POST',
    requestCount: 8500,
    avgResponseTime: 52,
    errorRate: 0.4,
    p95ResponseTime: 140,
    p99ResponseTime: 300,
    successCount: 8466,
    errorCount: 34,
    lastCalled: '2026-01-23T09:58:00Z',
  },
];

const mockTopErrors = [
  {
    endpoint: '/api/v1/webhooks/:id/test',
    method: 'POST',
    statusCode: 502,
    count: 120,
    lastOccurred: '2026-01-23T09:50:00Z',
    message: 'Bad Gateway - upstream webhook endpoint unreachable',
  },
  {
    endpoint: '/api/v1/webhooks/:id/test',
    method: 'POST',
    statusCode: 504,
    count: 58,
    lastOccurred: '2026-01-23T09:48:00Z',
    message: 'Gateway Timeout - webhook endpoint did not respond within 30s',
  },
  {
    endpoint: '/api/v1/webhooks',
    method: 'POST',
    statusCode: 400,
    count: 42,
    lastOccurred: '2026-01-23T09:55:00Z',
    message: 'Invalid request body - missing required fields',
  },
  {
    endpoint: '/api/v1/webhooks/:id',
    method: 'GET',
    statusCode: 404,
    count: 231,
    lastOccurred: '2026-01-23T09:58:00Z',
    message: 'Webhook not found',
  },
  {
    endpoint: '/api/v1/webhooks/:id',
    method: 'PUT',
    statusCode: 400,
    count: 35,
    lastOccurred: '2026-01-23T09:45:00Z',
    message: 'Invalid URL format in update payload',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '24h';
  const endpoint = searchParams.get('endpoint');
  const method = searchParams.get('method');

  let filteredEndpoints = [...mockEndpointAnalytics];

  if (endpoint) {
    filteredEndpoints = filteredEndpoints.filter((e) =>
      e.endpoint.includes(endpoint)
    );
  }

  if (method) {
    filteredEndpoints = filteredEndpoints.filter(
      (e) => e.method.toUpperCase() === method.toUpperCase()
    );
  }

  const totalRequests = filteredEndpoints.reduce((sum, e) => sum + e.requestCount, 0);
  const totalErrors = filteredEndpoints.reduce((sum, e) => sum + e.errorCount, 0);
  const weightedAvgResponseTime =
    totalRequests > 0
      ? filteredEndpoints.reduce((sum, e) => sum + e.avgResponseTime * e.requestCount, 0) / totalRequests
      : 0;

  const now = new Date();
  const periodHours = period === '7d' ? 168 : period === '30d' ? 720 : 24;
  const periodStart = new Date(now.getTime() - periodHours * 60 * 60 * 1000);

  const overall: OverallStats = {
    totalRequests,
    avgResponseTime: Math.round(weightedAvgResponseTime * 100) / 100,
    overallErrorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
    uniqueEndpoints: new Set(filteredEndpoints.map((e) => e.endpoint)).size,
    peakRequestsPerMinute: 342,
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
  };

  const response: ApiAnalyticsResponse = {
    overall,
    endpoints: filteredEndpoints,
    topErrors: mockTopErrors,
  };

  return NextResponse.json({ data: response });
}
