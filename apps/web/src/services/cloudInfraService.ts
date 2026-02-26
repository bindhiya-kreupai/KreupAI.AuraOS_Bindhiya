/**
 * @module cloudInfraService
 * @description Cloud Infrastructure & FinOps service for AuraOS.
 *              Provides mock data for 3 regions, 15 services, cost analytics,
 *              scaling metrics, and compliance status.
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type Region = 'us-east-1' | 'eu-west-1' | 'me-south-1';
export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'maintenance';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ResourceType = 'compute' | 'database' | 'cache' | 'storage' | 'network' | 'messaging';

export interface CloudService {
  id: string;
  name: string;
  type: ResourceType;
  region: Region;
  status: ServiceStatus;
  replicas: number;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  requestsPerSecond: number;
  errorRate: number;
  p99LatencyMs: number;
  monthlyCostUSD: number;
  uptime: number; // % last 30 days
  version: string;
}

export interface RegionOverview {
  region: Region;
  label: string;
  flag: string;
  serviceCount: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  totalMonthlyCostUSD: number;
  totalCpuPercent: number;
  totalMemoryPercent: number;
}

export interface CostBreakdown {
  period: string;
  totalUSD: number;
  byService: Array<{ serviceName: string; costUSD: number; percentage: number }>;
  byRegion: Array<{ region: Region; costUSD: number; percentage: number }>;
  byType: Array<{ type: ResourceType; costUSD: number; percentage: number }>;
}

export interface CostForecast {
  month: string;
  actualUSD: number | null;
  forecastUSD: number | null;
  budgetUSD: number;
}

export interface ScalingMetric {
  serviceId: string;
  serviceName: string;
  region: Region;
  currentReplicas: number;
  minReplicas: number;
  maxReplicas: number;
  cpuPercent: number;
  memoryPercent: number;
  requestsPerSecond: number;
  hpaTarget: number;
  lastScaleEvent?: string;
  lastScaleDirection?: 'up' | 'down';
}

export interface CloudIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  affectedServices: string[];
  region: Region;
  startedAt: string;
  resolvedAt?: string;
  status: 'active' | 'mitigated' | 'resolved';
  description: string;
  updates: Array<{ timestamp: string; message: string }>;
}

export interface ComplianceStatus {
  region: Region;
  dataResidency: boolean;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  backupEnabled: boolean;
  backupRetentionDays: number;
  lastBackupAt: string;
  gdprCompliant: boolean;
  soc2Compliant: boolean;
  iso27001Compliant: boolean;
  overallScore: number;
}

export interface InfrastructureOverview {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  totalMonthlyCostUSD: number;
  regions: RegionOverview[];
  services: CloudService[];
  activeIncidents: CloudIncident[];
  overallHealth: number; // 0-100
}

export interface FinOpsRecommendation {
  id: string;
  type:
    | 'right-sizing'
    | 'reserved-instance'
    | 'spot-instance'
    | 'unused-resource'
    | 'storage-optimization';
  title: string;
  description: string;
  potentialSavingsUSD: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  affectedService?: string;
  region?: Region;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SERVICES: CloudService[] = [
  // US-EAST-1
  {
    id: 'svc-web-use1',
    name: 'aura-web',
    type: 'compute',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 4,
    cpuPercent: 42,
    memoryPercent: 58,
    diskPercent: 20,
    requestsPerSecond: 1250,
    errorRate: 0.12,
    p99LatencyMs: 145,
    monthlyCostUSD: 840,
    uptime: 99.98,
    version: '1.2.4',
  },
  {
    id: 'svc-payroll-use1',
    name: 'payroll-service',
    type: 'compute',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 3,
    cpuPercent: 35,
    memoryPercent: 45,
    diskPercent: 15,
    requestsPerSecond: 340,
    errorRate: 0.05,
    p99LatencyMs: 210,
    monthlyCostUSD: 520,
    uptime: 99.95,
    version: '1.1.8',
  },
  {
    id: 'svc-notif-use1',
    name: 'notification-service',
    type: 'compute',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 2,
    cpuPercent: 28,
    memoryPercent: 38,
    diskPercent: 12,
    requestsPerSecond: 890,
    errorRate: 0.08,
    p99LatencyMs: 95,
    monthlyCostUSD: 320,
    uptime: 99.99,
    version: '1.0.5',
  },
  {
    id: 'svc-pg-use1',
    name: 'postgresql',
    type: 'database',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 1,
    cpuPercent: 55,
    memoryPercent: 72,
    diskPercent: 68,
    requestsPerSecond: 4200,
    errorRate: 0.01,
    p99LatencyMs: 8,
    monthlyCostUSD: 1200,
    uptime: 99.99,
    version: '16.2',
  },
  {
    id: 'svc-redis-use1',
    name: 'redis',
    type: 'cache',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 1,
    cpuPercent: 18,
    memoryPercent: 65,
    diskPercent: 42,
    requestsPerSecond: 8900,
    errorRate: 0.0,
    p99LatencyMs: 1,
    monthlyCostUSD: 180,
    uptime: 100,
    version: '7.2',
  },
  {
    id: 'svc-rmq-use1',
    name: 'rabbitmq',
    type: 'messaging',
    region: 'us-east-1',
    status: 'healthy',
    replicas: 3,
    cpuPercent: 22,
    memoryPercent: 45,
    diskPercent: 30,
    requestsPerSecond: 2100,
    errorRate: 0.0,
    p99LatencyMs: 2,
    monthlyCostUSD: 280,
    uptime: 99.99,
    version: '3.13',
  },
  {
    id: 'svc-att-use1',
    name: 'attendance-service',
    type: 'compute',
    region: 'us-east-1',
    status: 'degraded',
    replicas: 2,
    cpuPercent: 88,
    memoryPercent: 82,
    diskPercent: 25,
    requestsPerSecond: 560,
    errorRate: 2.4,
    p99LatencyMs: 890,
    monthlyCostUSD: 320,
    uptime: 99.21,
    version: '1.0.2',
  },

  // EU-WEST-1
  {
    id: 'svc-web-euw1',
    name: 'aura-web',
    type: 'compute',
    region: 'eu-west-1',
    status: 'healthy',
    replicas: 3,
    cpuPercent: 38,
    memoryPercent: 52,
    diskPercent: 18,
    requestsPerSecond: 890,
    errorRate: 0.1,
    p99LatencyMs: 130,
    monthlyCostUSD: 720,
    uptime: 99.97,
    version: '1.2.4',
  },
  {
    id: 'svc-payroll-euw1',
    name: 'payroll-service',
    type: 'compute',
    region: 'eu-west-1',
    status: 'healthy',
    replicas: 2,
    cpuPercent: 30,
    memoryPercent: 40,
    diskPercent: 12,
    requestsPerSecond: 210,
    errorRate: 0.04,
    p99LatencyMs: 195,
    monthlyCostUSD: 420,
    uptime: 99.93,
    version: '1.1.8',
  },
  {
    id: 'svc-pg-euw1',
    name: 'postgresql',
    type: 'database',
    region: 'eu-west-1',
    status: 'healthy',
    replicas: 1,
    cpuPercent: 48,
    memoryPercent: 68,
    diskPercent: 55,
    requestsPerSecond: 2900,
    errorRate: 0.01,
    p99LatencyMs: 7,
    monthlyCostUSD: 1050,
    uptime: 99.99,
    version: '16.2',
  },
  {
    id: 'svc-redis-euw1',
    name: 'redis',
    type: 'cache',
    region: 'eu-west-1',
    status: 'healthy',
    replicas: 1,
    cpuPercent: 15,
    memoryPercent: 60,
    diskPercent: 38,
    requestsPerSecond: 6200,
    errorRate: 0.0,
    p99LatencyMs: 1,
    monthlyCostUSD: 160,
    uptime: 100,
    version: '7.2',
  },
  {
    id: 'svc-analytics-euw1',
    name: 'analytics-service',
    type: 'compute',
    region: 'eu-west-1',
    status: 'healthy',
    replicas: 2,
    cpuPercent: 62,
    memoryPercent: 78,
    diskPercent: 45,
    requestsPerSecond: 180,
    errorRate: 0.15,
    p99LatencyMs: 450,
    monthlyCostUSD: 480,
    uptime: 99.88,
    version: '2.1.0',
  },

  // ME-SOUTH-1
  {
    id: 'svc-web-mes1',
    name: 'aura-web',
    type: 'compute',
    region: 'me-south-1',
    status: 'healthy',
    replicas: 2,
    cpuPercent: 25,
    memoryPercent: 35,
    diskPercent: 15,
    requestsPerSecond: 420,
    errorRate: 0.08,
    p99LatencyMs: 155,
    monthlyCostUSD: 480,
    uptime: 99.96,
    version: '1.2.4',
  },
  {
    id: 'svc-pg-mes1',
    name: 'postgresql',
    type: 'database',
    region: 'me-south-1',
    status: 'maintenance',
    replicas: 1,
    cpuPercent: 10,
    memoryPercent: 55,
    diskPercent: 48,
    requestsPerSecond: 0,
    errorRate: 0.0,
    p99LatencyMs: 0,
    monthlyCostUSD: 850,
    uptime: 99.8,
    version: '16.2',
  },
  {
    id: 'svc-redis-mes1',
    name: 'redis',
    type: 'cache',
    region: 'me-south-1',
    status: 'healthy',
    replicas: 1,
    cpuPercent: 12,
    memoryPercent: 50,
    diskPercent: 28,
    requestsPerSecond: 3100,
    errorRate: 0.0,
    p99LatencyMs: 1,
    monthlyCostUSD: 140,
    uptime: 100,
    version: '7.2',
  },
];

const MOCK_INCIDENTS: CloudIncident[] = [
  {
    id: 'inc-001',
    title: 'High CPU on attendance-service (us-east-1)',
    severity: 'high',
    affectedServices: ['attendance-service'],
    region: 'us-east-1',
    startedAt: new Date(Date.now() - 3_600_000).toISOString(),
    status: 'active',
    description:
      'Attendance service experiencing elevated CPU (88%) causing increased p99 latency.',
    updates: [
      {
        timestamp: new Date(Date.now() - 3_600_000).toISOString(),
        message: 'Incident detected — elevated CPU & error rate',
      },
      {
        timestamp: new Date(Date.now() - 1_800_000).toISOString(),
        message: 'Engineering team investigating root cause',
      },
    ],
  },
  {
    id: 'inc-002',
    title: 'Scheduled maintenance: PostgreSQL me-south-1',
    severity: 'low',
    affectedServices: ['postgresql', 'aura-web', 'payroll-service'],
    region: 'me-south-1',
    startedAt: new Date(Date.now() - 7_200_000).toISOString(),
    status: 'mitigated',
    description: 'Planned maintenance window for PostgreSQL version upgrade.',
    updates: [
      {
        timestamp: new Date(Date.now() - 7_200_000).toISOString(),
        message: 'Maintenance window started',
      },
      {
        timestamp: new Date(Date.now() - 5_400_000).toISOString(),
        message: 'Database upgrade in progress',
      },
    ],
  },
];

const MOCK_COMPLIANCE: ComplianceStatus[] = [
  {
    region: 'us-east-1',
    dataResidency: true,
    encryptionAtRest: true,
    encryptionInTransit: true,
    backupEnabled: true,
    backupRetentionDays: 30,
    lastBackupAt: new Date(Date.now() - 21_600_000).toISOString(),
    gdprCompliant: true,
    soc2Compliant: true,
    iso27001Compliant: true,
    overallScore: 98,
  },
  {
    region: 'eu-west-1',
    dataResidency: true,
    encryptionAtRest: true,
    encryptionInTransit: true,
    backupEnabled: true,
    backupRetentionDays: 30,
    lastBackupAt: new Date(Date.now() - 18_000_000).toISOString(),
    gdprCompliant: true,
    soc2Compliant: true,
    iso27001Compliant: true,
    overallScore: 99,
  },
  {
    region: 'me-south-1',
    dataResidency: true,
    encryptionAtRest: true,
    encryptionInTransit: true,
    backupEnabled: true,
    backupRetentionDays: 14,
    lastBackupAt: new Date(Date.now() - 43_200_000).toISOString(),
    gdprCompliant: false,
    soc2Compliant: true,
    iso27001Compliant: false,
    overallScore: 82,
  },
];

const MOCK_FINOPS_RECOMMENDATIONS: FinOpsRecommendation[] = [
  {
    id: 'fo-1',
    type: 'right-sizing',
    title: 'Downsize analytics-service',
    description:
      'analytics-service uses only 38% of allocated memory. Reduce from t3.large to t3.medium.',
    potentialSavingsUSD: 240,
    effort: 'low',
    priority: 'high',
    affectedService: 'analytics-service',
    region: 'eu-west-1',
  },
  {
    id: 'fo-2',
    type: 'reserved-instance',
    title: 'Reserve PostgreSQL instances',
    description:
      '3 PostgreSQL instances running 24/7 for 12+ months. Switch to 1-year reserved for 30% savings.',
    potentialSavingsUSD: 756,
    effort: 'low',
    priority: 'high',
    affectedService: 'postgresql',
  },
  {
    id: 'fo-3',
    type: 'right-sizing',
    title: 'Scale down dev Redis',
    description:
      'Dev Redis instance at only 12% memory usage. Reduce from r6g.large to r6g.medium.',
    potentialSavingsUSD: 120,
    effort: 'low',
    priority: 'medium',
    affectedService: 'redis',
    region: 'me-south-1',
  },
  {
    id: 'fo-4',
    type: 'unused-resource',
    title: 'Delete unused EBS snapshots',
    description: '14 EBS snapshots older than 90 days detected across all regions.',
    potentialSavingsUSD: 85,
    effort: 'low',
    priority: 'low',
  },
  {
    id: 'fo-5',
    type: 'storage-optimization',
    title: 'Enable S3 Intelligent-Tiering',
    description:
      'Document storage bucket 68% infrequently accessed. Intelligent-Tiering reduces cost by 40%.',
    potentialSavingsUSD: 310,
    effort: 'medium',
    priority: 'high',
  },
  {
    id: 'fo-6',
    type: 'spot-instance',
    title: 'Use Spot for analytics workloads',
    description:
      'Analytics batch jobs are interruptible and could run on Spot instances for 60% savings.',
    potentialSavingsUSD: 192,
    effort: 'medium',
    priority: 'medium',
    affectedService: 'analytics-service',
    region: 'eu-west-1',
  },
];

// ============================================================================
// SERVICE
// ============================================================================

function buildRegionOverview(region: Region, services: CloudService[]): RegionOverview {
  const regional = services.filter((s) => s.region === region);
  const labels: Record<Region, { label: string; flag: string }> = {
    'us-east-1': { label: 'US East (Virginia)', flag: 'US' },
    'eu-west-1': { label: 'EU West (Ireland)', flag: 'EU' },
    'me-south-1': { label: 'ME South (Bahrain)', flag: 'BH' },
  };

  return {
    region,
    ...labels[region],
    serviceCount: regional.length,
    healthyServices: regional.filter((s) => s.status === 'healthy').length,
    degradedServices: regional.filter((s) => s.status === 'degraded').length,
    downServices: regional.filter((s) => s.status === 'down').length,
    totalMonthlyCostUSD: regional.reduce((sum, s) => sum + s.monthlyCostUSD, 0),
    totalCpuPercent: regional.reduce((sum, s) => sum + s.cpuPercent, 0) / (regional.length || 1),
    totalMemoryPercent:
      regional.reduce((sum, s) => sum + s.memoryPercent, 0) / (regional.length || 1),
  };
}

export const cloudInfraService = {
  // ── Overview ──────────────────────────────────────────────────────────────

  async getInfrastructureOverview(): Promise<InfrastructureOverview> {
    const regions: Region[] = ['us-east-1', 'eu-west-1', 'me-south-1'];
    const regionOverviews = regions.map((r) => buildRegionOverview(r, MOCK_SERVICES));

    return {
      totalServices: MOCK_SERVICES.length,
      healthyServices: MOCK_SERVICES.filter((s) => s.status === 'healthy').length,
      degradedServices: MOCK_SERVICES.filter((s) => s.status === 'degraded').length,
      downServices: MOCK_SERVICES.filter((s) => s.status === 'down').length,
      totalMonthlyCostUSD: MOCK_SERVICES.reduce((s, svc) => s + svc.monthlyCostUSD, 0),
      regions: regionOverviews,
      services: MOCK_SERVICES,
      activeIncidents: MOCK_INCIDENTS.filter((i) => i.status !== 'resolved'),
      overallHealth: Math.round(
        (MOCK_SERVICES.filter((s) => s.status === 'healthy').length / MOCK_SERVICES.length) * 100
      ),
    };
  },

  // ── Resources ─────────────────────────────────────────────────────────────

  async getResourcesByRegion(): Promise<Record<Region, CloudService[]>> {
    return {
      'us-east-1': MOCK_SERVICES.filter((s) => s.region === 'us-east-1'),
      'eu-west-1': MOCK_SERVICES.filter((s) => s.region === 'eu-west-1'),
      'me-south-1': MOCK_SERVICES.filter((s) => s.region === 'me-south-1'),
    };
  },

  async getServiceHealth(): Promise<
    Array<{ service: CloudService; healthy: boolean; message: string }>
  > {
    return MOCK_SERVICES.map((s) => ({
      service: s,
      healthy: s.status === 'healthy',
      message:
        s.status === 'down'
          ? 'Service is down'
          : s.status === 'degraded'
            ? 'Elevated errors/latency'
            : s.status === 'maintenance'
              ? 'Scheduled maintenance'
              : 'All systems operational',
    }));
  },

  // ── Cost ──────────────────────────────────────────────────────────────────

  async getCostBreakdown(period = 'current-month'): Promise<CostBreakdown> {
    const total = MOCK_SERVICES.reduce((s, svc) => s + svc.monthlyCostUSD, 0);

    // Aggregate by service name
    const byServiceMap = new Map<string, number>();
    for (const svc of MOCK_SERVICES) {
      byServiceMap.set(svc.name, (byServiceMap.get(svc.name) ?? 0) + svc.monthlyCostUSD);
    }
    const byService = Array.from(byServiceMap.entries())
      .map(([serviceName, costUSD]) => ({
        serviceName,
        costUSD,
        percentage: (costUSD / total) * 100,
      }))
      .sort((a, b) => b.costUSD - a.costUSD);

    // By region
    const regions: Region[] = ['us-east-1', 'eu-west-1', 'me-south-1'];
    const byRegion = regions.map((region) => {
      const costUSD = MOCK_SERVICES.filter((s) => s.region === region).reduce(
        (s, svc) => s + svc.monthlyCostUSD,
        0
      );
      return { region, costUSD, percentage: (costUSD / total) * 100 };
    });

    // By type
    const typeMap = new Map<ResourceType, number>();
    for (const svc of MOCK_SERVICES) {
      typeMap.set(svc.type, (typeMap.get(svc.type) ?? 0) + svc.monthlyCostUSD);
    }
    const byType = Array.from(typeMap.entries())
      .map(([type, costUSD]) => ({ type, costUSD, percentage: (costUSD / total) * 100 }))
      .sort((a, b) => b.costUSD - a.costUSD);

    return { period, totalUSD: total, byService, byRegion, byType };
  },

  async getCostForecast(months = 12): Promise<CostForecast[]> {
    const baseCostUSD = MOCK_SERVICES.reduce((s, svc) => s + svc.monthlyCostUSD, 0);
    const budgetUSD = baseCostUSD * 1.1;
    const now = new Date();
    const result: CostForecast[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const isPast = i > 0;
      const growth = 1 + (months - i) * 0.015; // 1.5% monthly growth

      result.push({
        month: label,
        actualUSD: isPast ? Math.round(baseCostUSD * (0.85 + (months - i) * 0.012)) : null,
        forecastUSD: !isPast ? Math.round(baseCostUSD * growth) : null,
        budgetUSD: Math.round(budgetUSD),
      });
    }

    return result;
  },

  // ── Scaling ───────────────────────────────────────────────────────────────

  async getScalingMetrics(): Promise<ScalingMetric[]> {
    return MOCK_SERVICES.filter((s) => s.type === 'compute').map((s) => ({
      serviceId: s.id,
      serviceName: s.name,
      region: s.region,
      currentReplicas: s.replicas,
      minReplicas: 2,
      maxReplicas: 10,
      cpuPercent: s.cpuPercent,
      memoryPercent: s.memoryPercent,
      requestsPerSecond: s.requestsPerSecond,
      hpaTarget: 70,
      lastScaleEvent:
        s.cpuPercent > 80 ? new Date(Date.now() - 1_800_000).toISOString() : undefined,
      lastScaleDirection: s.cpuPercent > 80 ? ('up' as const) : undefined,
    }));
  },

  // ── Incidents ─────────────────────────────────────────────────────────────

  async getIncidents(): Promise<CloudIncident[]> {
    return MOCK_INCIDENTS;
  },

  // ── Compliance ────────────────────────────────────────────────────────────

  async getComplianceStatus(): Promise<ComplianceStatus[]> {
    return MOCK_COMPLIANCE;
  },

  // ── FinOps ────────────────────────────────────────────────────────────────

  async getFinOpsRecommendations(): Promise<FinOpsRecommendation[]> {
    return MOCK_FINOPS_RECOMMENDATIONS;
  },

  async getTotalPotentialSavings(): Promise<number> {
    return MOCK_FINOPS_RECOMMENDATIONS.reduce((s, r) => s + r.potentialSavingsUSD, 0);
  },
};

export default cloudInfraService;
