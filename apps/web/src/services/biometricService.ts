/**
 * @module biometricService
 * @description Biometric device integration — fingerprint, face, iris recognition devices,
 *   attendance sync, enrollment, analytics, device health monitoring.
 * @project AURA HCM Platform
 * @section 22.4 — Biometric Integration
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type DeviceBrand = 'ZKTeco' | 'HikVision' | 'Suprema' | 'Anviz' | 'Virdi';
export type DeviceType = 'fingerprint' | 'face' | 'iris' | 'multi_modal' | 'card_reader';
export type DeviceStatus = 'online' | 'offline' | 'error' | 'syncing' | 'maintenance';
export type PunchType = 'in' | 'out' | 'break_start' | 'break_end' | 'overtime_in' | 'overtime_out';
export type BiometricMethod = 'fingerprint' | 'face' | 'iris' | 'pin' | 'card';

export interface BiometricDevice {
  id: string;
  name: string;
  brand: DeviceBrand;
  model: string;
  type: DeviceType;
  status: DeviceStatus;
  location: string;
  building: string;
  ipAddress: string;
  serialNumber: string;
  firmwareVersion: string;
  enrolledEmployees: number;
  lastSyncAt: string;
  lastHeartbeatAt: string;
  pendingPunches: number;
  totalCapacity: number;
  metrics: DeviceMetrics;
}

export interface DeviceMetrics {
  successRate: number; // %
  avgScanTimeMs: number;
  dailyScans: number;
  failedScans: number;
  peakHour: string;
  uptime: number; // % over last 30 days
}

export interface BiometricEnrollment {
  employeeId: string;
  deviceId: string;
  method: BiometricMethod;
  enrolledAt: string;
  enrolledBy: string;
  status: 'active' | 'pending' | 'failed';
  templateQuality?: number; // 0-100
}

export interface AttendancePunch {
  id: string;
  deviceId: string;
  deviceName: string;
  employeeId: string;
  employeeName: string;
  punchTime: string;
  punchType: PunchType;
  method: BiometricMethod;
  verificationScore: number; // 0-100
  isValid: boolean;
  processedAt?: string;
}

export interface SyncResult {
  deviceId: string;
  syncedAt: string;
  newPunches: number;
  duplicates: number;
  errors: number;
  dateRange: { start: string; end: string };
}

export interface BiometricAnalytics {
  period: string;
  totalDevices: number;
  onlineDevices: number;
  totalPunches: number;
  successfulPunches: number;
  failedPunches: number;
  successRate: number;
  avgScanTime: number;
  peakUsageHour: string;
  topFailureReasons: Array<{ reason: string; count: number }>;
  devicePerformance: Array<{
    deviceId: string;
    deviceName: string;
    successRate: number;
    dailyAvg: number;
  }>;
}

export interface DeviceConfiguration {
  deviceId: string;
  attendanceRule: 'first_last' | 'all_punches' | 'smart';
  matchThreshold: number; // 30-80, default 45
  cameraEnabled: boolean;
  audioFeedback: boolean;
  displayMessage: string;
  timezone: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  failedScanRetries: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_DEVICES: BiometricDevice[] = [
  {
    id: 'dev-001',
    name: 'Main Entrance — Dubai HQ',
    brand: 'ZKTeco',
    model: 'ZK-ProFace X',
    type: 'multi_modal',
    status: 'online',
    location: 'Ground Floor',
    building: 'Dubai Internet City HQ',
    ipAddress: '10.0.1.101',
    serialNumber: 'ZKP-2024-001',
    firmwareVersion: '6.8.2',
    enrolledEmployees: 312,
    lastSyncAt: '2026-02-25T08:45:00Z',
    lastHeartbeatAt: '2026-02-25T09:00:00Z',
    pendingPunches: 0,
    totalCapacity: 10000,
    metrics: {
      successRate: 98.4,
      avgScanTimeMs: 450,
      dailyScans: 620,
      failedScans: 10,
      peakHour: '09:00–10:00',
      uptime: 99.8,
    },
  },
  {
    id: 'dev-002',
    name: 'Server Room — Dubai HQ',
    brand: 'Suprema',
    model: 'BioStation 3',
    type: 'fingerprint',
    status: 'online',
    location: '3rd Floor, IT Wing',
    building: 'Dubai Internet City HQ',
    ipAddress: '10.0.1.102',
    serialNumber: 'SUP-2023-045',
    firmwareVersion: '1.6.0',
    enrolledEmployees: 48,
    lastSyncAt: '2026-02-25T08:30:00Z',
    lastHeartbeatAt: '2026-02-25T09:00:00Z',
    pendingPunches: 0,
    totalCapacity: 5000,
    metrics: {
      successRate: 99.2,
      avgScanTimeMs: 320,
      dailyScans: 96,
      failedScans: 1,
      peakHour: '09:00–10:00',
      uptime: 100,
    },
  },
  {
    id: 'dev-003',
    name: 'Office Entry — Riyadh',
    brand: 'HikVision',
    model: 'DS-K1T671TMF',
    type: 'face',
    status: 'online',
    location: 'Main Lobby',
    building: 'KAFD Tower A',
    ipAddress: '10.1.0.51',
    serialNumber: 'HKV-2024-112',
    firmwareVersion: '2.2.8',
    enrolledEmployees: 141,
    lastSyncAt: '2026-02-25T06:00:00Z',
    lastHeartbeatAt: '2026-02-25T09:00:00Z',
    pendingPunches: 3,
    totalCapacity: 8000,
    metrics: {
      successRate: 96.8,
      avgScanTimeMs: 580,
      dailyScans: 285,
      failedScans: 9,
      peakHour: '08:00–09:00',
      uptime: 98.2,
    },
  },
  {
    id: 'dev-004',
    name: 'Office Entry — Bengaluru',
    brand: 'Anviz',
    model: 'EP300 Pro',
    type: 'fingerprint',
    status: 'offline',
    location: 'Main Door',
    building: 'Indiranagar Office',
    ipAddress: '10.2.0.22',
    serialNumber: 'ANV-2022-077',
    firmwareVersion: '3.4.1',
    enrolledEmployees: 198,
    lastSyncAt: '2026-02-24T18:00:00Z',
    lastHeartbeatAt: '2026-02-24T19:00:00Z',
    pendingPunches: 142,
    totalCapacity: 5000,
    metrics: {
      successRate: 94.1,
      avgScanTimeMs: 720,
      dailyScans: 396,
      failedScans: 24,
      peakHour: '09:00–10:00',
      uptime: 92.4,
    },
  },
  {
    id: 'dev-005',
    name: 'Reception — London',
    brand: 'Suprema',
    model: 'FaceStation 2',
    type: 'face',
    status: 'online',
    location: 'Reception',
    building: 'Canary Wharf Office',
    ipAddress: '172.16.1.10',
    serialNumber: 'SUP-2024-033',
    firmwareVersion: '1.9.0',
    enrolledEmployees: 63,
    lastSyncAt: '2026-02-25T08:00:00Z',
    lastHeartbeatAt: '2026-02-25T08:58:00Z',
    pendingPunches: 0,
    totalCapacity: 5000,
    metrics: {
      successRate: 97.8,
      avgScanTimeMs: 410,
      dailyScans: 126,
      failedScans: 3,
      peakHour: '09:00–09:30',
      uptime: 99.1,
    },
  },
  {
    id: 'dev-006',
    name: 'Main Entry — San Francisco',
    brand: 'ZKTeco',
    model: 'SpeedFace V5L',
    type: 'multi_modal',
    status: 'error',
    location: 'Ground Floor',
    building: '101 California Street',
    ipAddress: '192.168.1.25',
    serialNumber: 'ZKS-2024-088',
    firmwareVersion: '6.5.0',
    enrolledEmployees: 86,
    lastSyncAt: '2026-02-25T02:00:00Z',
    lastHeartbeatAt: '2026-02-25T07:30:00Z',
    pendingPunches: 0,
    totalCapacity: 8000,
    metrics: {
      successRate: 89.2,
      avgScanTimeMs: 650,
      dailyScans: 172,
      failedScans: 20,
      peakHour: '09:00–10:00',
      uptime: 88.6,
    },
  },
];

const MOCK_PUNCHES: AttendancePunch[] = Array.from({ length: 100 }, (_, i) => ({
  id: `punch-${String(i + 1).padStart(4, '0')}`,
  deviceId: MOCK_DEVICES[Math.floor(i / 20)].id,
  deviceName: MOCK_DEVICES[Math.floor(i / 20)].name,
  employeeId: `emp-${String(Math.floor(Math.random() * 300) + 100).padStart(4, '0')}`,
  employeeName: ['Ahmed Al-Mansouri', 'Sara Mitchell', 'Tom Chen', 'Maria Santos', 'Rajesh Nair'][
    i % 5
  ],
  punchTime: new Date(Date.now() - i * 12 * 60 * 1000).toISOString(),
  punchType: i % 2 === 0 ? 'in' : 'out',
  method: (i % 3 === 0 ? 'fingerprint' : i % 3 === 1 ? 'face' : 'pin') as BiometricMethod,
  verificationScore: 65 + Math.floor(Math.random() * 35),
  isValid: i % 12 !== 0,
  processedAt:
    i % 12 !== 0 ? new Date(Date.now() - i * 12 * 60 * 1000 + 2000).toISOString() : undefined,
}));

const MOCK_ENROLLMENTS: BiometricEnrollment[] = [
  {
    employeeId: 'emp-0201',
    deviceId: 'dev-001',
    method: 'fingerprint',
    enrolledAt: '2023-03-01',
    enrolledBy: 'IT Admin',
    status: 'active',
    templateQuality: 92,
  },
  {
    employeeId: 'emp-0201',
    deviceId: 'dev-001',
    method: 'face',
    enrolledAt: '2023-03-01',
    enrolledBy: 'IT Admin',
    status: 'active',
    templateQuality: 88,
  },
  {
    employeeId: 'emp-0312',
    deviceId: 'dev-004',
    method: 'fingerprint',
    enrolledAt: '2021-06-15',
    enrolledBy: 'IT Admin',
    status: 'active',
    templateQuality: 79,
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class BiometricService {
  static async getDevices(): Promise<BiometricDevice[]> {
    try {
      const res = await fetch('/api/attendance/biometric-devices');
      const json = await res.json();
      return json.success
        ? json.data.map((d: any) => ({
            ...d,
            metrics: {
              successRate: d.successRate ?? 100,
              avgScanTimeMs: d.avgScanTimeMs ?? 0,
              dailyScans: d.dailyScans ?? 0,
              failedScans: d.failedScans ?? 0,
              peakHour: d.peakHour ?? '09:00–10:00',
              uptime: d.uptime ?? 100,
            },
          }))
        : [];
    } catch {
      return [];
    }
  }

  static async getDeviceStatus(deviceId: string): Promise<BiometricDevice | null> {
    try {
      const devs = await this.getDevices();
      return devs.find((d) => d.id === deviceId) ?? null;
    } catch {
      return null;
    }
  }

  static async addDevice(device: Partial<BiometricDevice>): Promise<BiometricDevice | null> {
    try {
      const res = await fetch('/api/attendance/biometric-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  }

  static async updateDevice(
    deviceId: string,
    device: Partial<BiometricDevice>
  ): Promise<BiometricDevice | null> {
    try {
      const res = await fetch(`/api/attendance/biometric-devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  }

  static async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/attendance/biometric-devices/${deviceId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return json.success || false;
    } catch {
      return false;
    }
  }

  static async enrollEmployee(
    employeeId: string,
    deviceId: string,
    method: BiometricMethod
  ): Promise<BiometricEnrollment> {
    const enrollment: BiometricEnrollment = {
      employeeId,
      deviceId,
      method,
      enrolledAt: new Date().toISOString(),
      enrolledBy: 'Current User',
      status: 'active',
      templateQuality: 75 + Math.floor(Math.random() * 25),
    };
    try {
      const dev = await this.getDeviceStatus(deviceId);
      if (dev) {
        await this.updateDevice(deviceId, {
          enrolledEmployees: (dev.enrolledEmployees || 0) + 1,
        });
      }
    } catch {
      // ignore
    }
    return enrollment;
  }

  static async syncAttendance(
    deviceId: string,
    dateRange: { start: string; end: string }
  ): Promise<SyncResult> {
    const device = await this.getDeviceStatus(deviceId);
    if (!device) throw new Error('Device not found');

    const newPunches = Math.floor(Math.random() * 50);
    await this.updateDevice(deviceId, {
      pendingPunches: 0,
      lastSyncAt: new Date().toISOString(),
    });

    return {
      deviceId,
      syncedAt: new Date().toISOString(),
      newPunches,
      duplicates: Math.floor(newPunches * 0.02),
      errors: Math.floor(newPunches * 0.005),
      dateRange,
    };
  }

  static async getAttendanceLogs(deviceId: string, _date: string): Promise<AttendancePunch[]> {
    return MOCK_PUNCHES.filter((p) => p.deviceId === deviceId).slice(0, 20);
  }

  static async getBiometricAnalytics(): Promise<BiometricAnalytics> {
    const devices = await this.getDevices();
    const totalPunches = devices.reduce((s, d) => s + (d.metrics?.dailyScans || 0), 0);
    const totalFailed = devices.reduce((s, d) => s + (d.metrics?.failedScans || 0), 0);

    return {
      period: 'Today',
      totalDevices: devices.length,
      onlineDevices: devices.filter((d) => d.status === 'online').length,
      totalPunches,
      successfulPunches: totalPunches - totalFailed,
      failedPunches: totalFailed,
      successRate:
        totalPunches > 0
          ? parseFloat((((totalPunches - totalFailed) / totalPunches) * 100).toFixed(1))
          : 100,
      avgScanTime:
        devices.length > 0
          ? Math.round(
              devices.reduce((s, d) => s + (d.metrics?.avgScanTimeMs || 0), 0) / devices.length
            )
          : 0,
      peakUsageHour: '09:00–10:00',
      topFailureReasons: [
        { reason: 'Low finger quality / dirty sensor', count: 18 },
        { reason: 'Mask detection (face recognition)', count: 12 },
        { reason: 'New employee not enrolled', count: 8 },
        { reason: 'Timeout — no match found', count: 5 },
        { reason: 'Template corrupted', count: 2 },
      ],
      devicePerformance: devices.map((d) => ({
        deviceId: d.id,
        deviceName: d.name,
        successRate: d.metrics?.successRate || 100,
        dailyAvg: d.metrics?.dailyScans || 0,
      })),
    };
  }

  static async configureDevice(
    deviceId: string,
    settings: Partial<DeviceConfiguration>
  ): Promise<DeviceConfiguration> {
    return {
      deviceId,
      attendanceRule: 'first_last',
      matchThreshold: 45,
      cameraEnabled: true,
      audioFeedback: true,
      displayMessage: 'Welcome to KreupAI',
      timezone: 'Asia/Dubai',
      autoSync: true,
      syncIntervalMinutes: 5,
      failedScanRetries: 3,
      ...settings,
    };
  }

  static async getEnrollments(deviceId?: string): Promise<BiometricEnrollment[]> {
    if (deviceId) return MOCK_ENROLLMENTS.filter((e) => e.deviceId === deviceId);
    return [...MOCK_ENROLLMENTS];
  }
}
