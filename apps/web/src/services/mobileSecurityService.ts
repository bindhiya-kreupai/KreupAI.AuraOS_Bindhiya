/**
 * @module mobileSecurityService
 * @description Mobile Device Management (MDM) & Security service — device compliance checking,
 *              device registration, biometric validation, security policies, remote wipe,
 *              incident reporting, and compliance reporting (Sec 15.4)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type DevicePlatform = 'iOS' | 'Android' | 'Windows' | 'macOS';
export type DeviceStatus = 'registered' | 'compliant' | 'non_compliant' | 'revoked' | 'pending';
export type BiometricType = 'fingerprint' | 'face_id' | 'iris' | 'none';
export type ComplianceReason =
  | 'os_outdated'
  | 'encryption_disabled'
  | 'jailbroken'
  | 'rooted'
  | 'pin_not_set'
  | 'screen_lock_disabled'
  | 'unknown_source_apps'
  | 'compliant';

export interface DeviceInfo {
  deviceId?: string;
  userId?: string;
  platform: DevicePlatform;
  osVersion: string;
  model: string;
  manufacturer?: string;
  isEncrypted?: boolean;
  isJailbroken?: boolean;
  isRooted?: boolean;
  hasScreenLock?: boolean;
  hasPinSet?: boolean;
  biometricType?: BiometricType;
  appVersion?: string;
  lastActiveAt?: string;
}

export interface RegisteredDevice {
  id: string;
  userId: string;
  userName: string;
  platform: DevicePlatform;
  osVersion: string;
  model: string;
  manufacturer: string;
  status: DeviceStatus;
  complianceReasons: ComplianceReason[];
  isEncrypted: boolean;
  isJailbroken: boolean;
  hasPinSet: boolean;
  biometricType: BiometricType;
  registeredAt: string;
  lastActiveAt: string;
  appVersion: string;
  department: string;
}

export interface BiometricValidation {
  type: BiometricType;
  supported: boolean;
  enrolled: boolean;
  lastVerified: string | null;
  failedAttempts: number;
}

export interface SecurityPolicy {
  pinRequired: boolean;
  biometricEnabled: boolean;
  autoLockTimeoutMinutes: number; // 1 | 5 | 15 | 30
  dataEncryptionRequired: boolean;
  minOsVersion: Record<DevicePlatform, string>;
  jailbreakDetection: boolean;
  maxFailedAttempts: number;
  remoteWipeEnabled: boolean;
  vpnRequired: boolean;
  allowedNetworks: string[];
}

export interface SecurityIncidentReport {
  id?: string;
  deviceId: string;
  reportedBy: string;
  incidentType: 'lost' | 'stolen' | 'compromised' | 'unauthorized_access';
  description: string;
  reportedAt?: string;
  actionTaken?: 'wipe_requested' | 'lock_requested' | 'monitoring' | 'resolved';
  status?: 'open' | 'investigating' | 'resolved';
}

export interface DeviceComplianceReport {
  generatedAt: string;
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  revokedDevices: number;
  pendingDevices: number;
  complianceRate: number;
  byPlatform: Record<DevicePlatform, { total: number; compliant: number }>;
  topIssues: { reason: ComplianceReason; count: number }[];
  devices: RegisteredDevice[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DEVICES: RegisteredDevice[] = [
  {
    id: 'dev-001',
    userId: 'emp-101',
    userName: 'Ahmed Al-Rashidi',
    platform: 'iOS',
    osVersion: '17.4.1',
    model: 'iPhone 15 Pro',
    manufacturer: 'Apple',
    status: 'compliant',
    complianceReasons: ['compliant'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'face_id',
    registeredAt: '2024-01-15T09:00:00Z',
    lastActiveAt: '2025-02-24T14:30:00Z',
    appVersion: '3.2.1',
    department: 'Engineering',
  },
  {
    id: 'dev-002',
    userId: 'emp-102',
    userName: 'Sara Al-Mansouri',
    platform: 'Android',
    osVersion: '14.0',
    model: 'Samsung Galaxy S24',
    manufacturer: 'Samsung',
    status: 'compliant',
    complianceReasons: ['compliant'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'fingerprint',
    registeredAt: '2024-02-10T10:00:00Z',
    lastActiveAt: '2025-02-25T09:15:00Z',
    appVersion: '3.2.1',
    department: 'HR',
  },
  {
    id: 'dev-003',
    userId: 'emp-103',
    userName: 'Mohammed Khalid',
    platform: 'Android',
    osVersion: '11.0',
    model: 'Pixel 5',
    manufacturer: 'Google',
    status: 'non_compliant',
    complianceReasons: ['os_outdated', 'pin_not_set'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: false,
    biometricType: 'fingerprint',
    registeredAt: '2023-11-20T08:30:00Z',
    lastActiveAt: '2025-02-22T11:00:00Z',
    appVersion: '3.1.0',
    department: 'Finance',
  },
  {
    id: 'dev-004',
    userId: 'emp-104',
    userName: 'Fatima Al-Zahra',
    platform: 'iOS',
    osVersion: '16.7.5',
    model: 'iPhone 13',
    manufacturer: 'Apple',
    status: 'non_compliant',
    complianceReasons: ['os_outdated'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'face_id',
    registeredAt: '2023-09-05T14:00:00Z',
    lastActiveAt: '2025-02-20T16:45:00Z',
    appVersion: '3.0.5',
    department: 'Marketing',
  },
  {
    id: 'dev-005',
    userId: 'emp-105',
    userName: 'Omar Yusuf',
    platform: 'Android',
    osVersion: '12.0',
    model: 'OnePlus 9',
    manufacturer: 'OnePlus',
    status: 'non_compliant',
    complianceReasons: ['jailbroken', 'encryption_disabled'],
    isEncrypted: false,
    isJailbroken: true,
    hasPinSet: true,
    biometricType: 'fingerprint',
    registeredAt: '2024-03-01T11:00:00Z',
    lastActiveAt: '2025-02-18T08:30:00Z',
    appVersion: '3.1.5',
    department: 'Sales',
  },
  {
    id: 'dev-006',
    userId: 'emp-106',
    userName: 'Nour Al-Hassan',
    platform: 'iOS',
    osVersion: '17.3',
    model: 'iPhone 14',
    manufacturer: 'Apple',
    status: 'revoked',
    complianceReasons: ['compliant'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'face_id',
    registeredAt: '2024-04-12T09:00:00Z',
    lastActiveAt: '2025-01-10T12:00:00Z',
    appVersion: '3.2.0',
    department: 'Operations',
  },
  {
    id: 'dev-007',
    userId: 'emp-107',
    userName: 'Khalid Al-Otaibi',
    platform: 'Android',
    osVersion: '13.0',
    model: 'Samsung Galaxy A54',
    manufacturer: 'Samsung',
    status: 'compliant',
    complianceReasons: ['compliant'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'fingerprint',
    registeredAt: '2024-05-20T13:00:00Z',
    lastActiveAt: '2025-02-25T10:00:00Z',
    appVersion: '3.2.1',
    department: 'IT',
  },
  {
    id: 'dev-008',
    userId: 'emp-108',
    userName: 'Hana Al-Sayed',
    platform: 'iOS',
    osVersion: '17.4',
    model: 'iPhone 15',
    manufacturer: 'Apple',
    status: 'pending',
    complianceReasons: ['compliant'],
    isEncrypted: true,
    isJailbroken: false,
    hasPinSet: true,
    biometricType: 'face_id',
    registeredAt: '2025-02-24T08:00:00Z',
    lastActiveAt: '2025-02-24T08:00:00Z',
    appVersion: '3.2.1',
    department: 'Legal',
  },
];

const MOCK_SECURITY_POLICY: SecurityPolicy = {
  pinRequired: true,
  biometricEnabled: true,
  autoLockTimeoutMinutes: 5,
  dataEncryptionRequired: true,
  minOsVersion: {
    iOS: '17.0',
    Android: '12.0',
    Windows: '11.0',
    macOS: '14.0',
  },
  jailbreakDetection: true,
  maxFailedAttempts: 5,
  remoteWipeEnabled: true,
  vpnRequired: false,
  allowedNetworks: ['Corporate-WiFi', 'AuraOS-VPN'],
};

// ============================================================================
// SERVICE
// ============================================================================

export class MobileSecurityService {
  // ── Device Compliance Check ────────────────────────────────────────────────

  static async checkDeviceCompliance(deviceInfo: DeviceInfo): Promise<{
    isCompliant: boolean;
    reasons: ComplianceReason[];
    score: number;
  }> {
    await new Promise((r) => setTimeout(r, 300));
    const policy = MOCK_SECURITY_POLICY;
    const reasons: ComplianceReason[] = [];

    const minVer = policy.minOsVersion[deviceInfo.platform];
    if (minVer && deviceInfo.osVersion) {
      const current = deviceInfo.osVersion.split('.').map(Number);
      const required = minVer.split('.').map(Number);
      const isOld =
        current[0] < required[0] ||
        (current[0] === required[0] && (current[1] ?? 0) < (required[1] ?? 0));
      if (isOld) reasons.push('os_outdated');
    }
    if (policy.dataEncryptionRequired && deviceInfo.isEncrypted === false)
      reasons.push('encryption_disabled');
    if (policy.jailbreakDetection && (deviceInfo.isJailbroken || deviceInfo.isRooted)) {
      reasons.push(deviceInfo.platform === 'iOS' ? 'jailbroken' : 'rooted');
    }
    if (policy.pinRequired && deviceInfo.hasPinSet === false) reasons.push('pin_not_set');
    if (!deviceInfo.hasScreenLock) reasons.push('screen_lock_disabled');

    const isCompliant = reasons.length === 0;
    const score = Math.max(0, 100 - reasons.length * 20);
    return { isCompliant, reasons: isCompliant ? ['compliant'] : reasons, score };
  }

  // ── Register Device ────────────────────────────────────────────────────────

  static async registerDevice(deviceInfo: DeviceInfo): Promise<RegisteredDevice> {
    await new Promise((r) => setTimeout(r, 500));
    const compliance = await MobileSecurityService.checkDeviceCompliance(deviceInfo);
    const newDevice: RegisteredDevice = {
      id: `dev-${Date.now()}`,
      userId: deviceInfo.userId ?? 'emp-current',
      userName: 'Current User',
      platform: deviceInfo.platform,
      osVersion: deviceInfo.osVersion,
      model: deviceInfo.model,
      manufacturer: deviceInfo.manufacturer ?? 'Unknown',
      status: compliance.isCompliant ? 'compliant' : 'non_compliant',
      complianceReasons: compliance.reasons,
      isEncrypted: deviceInfo.isEncrypted ?? false,
      isJailbroken: deviceInfo.isJailbroken ?? false,
      hasPinSet: deviceInfo.hasPinSet ?? false,
      biometricType: deviceInfo.biometricType ?? 'none',
      registeredAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      appVersion: deviceInfo.appVersion ?? '3.2.1',
      department: 'General',
    };
    MOCK_DEVICES.push(newDevice);
    return newDevice;
  }

  // ── Get Registered Devices ─────────────────────────────────────────────────

  static async getRegisteredDevices(userId: string): Promise<RegisteredDevice[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_DEVICES.filter((d) => d.userId === userId);
  }

  // ── Revoke Device ──────────────────────────────────────────────────────────

  static async revokeDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    const device = MOCK_DEVICES.find((d) => d.id === deviceId);
    if (!device) return { success: false, message: 'Device not found' };
    device.status = 'revoked';
    return { success: true, message: `Device ${device.model} revoked and remote wipe initiated` };
  }

  // ── Validate Biometric ─────────────────────────────────────────────────────

  static async validateBiometric(type: BiometricType): Promise<BiometricValidation> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      type,
      supported: type !== 'none',
      enrolled: type !== 'none',
      lastVerified: type !== 'none' ? new Date().toISOString() : null,
      failedAttempts: 0,
    };
  }

  // ── Get Security Policy ────────────────────────────────────────────────────

  static async getSecurityPolicy(): Promise<SecurityPolicy> {
    await new Promise((r) => setTimeout(r, 150));
    return { ...MOCK_SECURITY_POLICY };
  }

  // ── Report Security Incident ───────────────────────────────────────────────

  static async reportSecurityIncident(
    data: Omit<SecurityIncidentReport, 'id' | 'reportedAt' | 'status'>
  ): Promise<SecurityIncidentReport> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      ...data,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'open',
      actionTaken: 'wipe_requested',
    };
  }

  // ── Get Device Compliance Report ───────────────────────────────────────────

  static async getDeviceComplianceReport(): Promise<DeviceComplianceReport> {
    await new Promise((r) => setTimeout(r, 300));
    const total = MOCK_DEVICES.length;
    const compliant = MOCK_DEVICES.filter((d) => d.status === 'compliant').length;
    const nonCompliant = MOCK_DEVICES.filter((d) => d.status === 'non_compliant').length;
    const revoked = MOCK_DEVICES.filter((d) => d.status === 'revoked').length;
    const pending = MOCK_DEVICES.filter((d) => d.status === 'pending').length;

    const byPlatform = MOCK_DEVICES.reduce(
      (acc, d) => {
        if (!acc[d.platform]) acc[d.platform] = { total: 0, compliant: 0 };
        acc[d.platform].total++;
        if (d.status === 'compliant') acc[d.platform].compliant++;
        return acc;
      },
      {} as Record<DevicePlatform, { total: number; compliant: number }>
    );

    const issueCounts: Partial<Record<ComplianceReason, number>> = {};
    MOCK_DEVICES.forEach((d) => {
      d.complianceReasons.forEach((r) => {
        if (r !== 'compliant') issueCounts[r] = (issueCounts[r] ?? 0) + 1;
      });
    });
    const topIssues = Object.entries(issueCounts)
      .map(([reason, count]) => ({ reason: reason as ComplianceReason, count: count as number }))
      .sort((a, b) => b.count - a.count);

    return {
      generatedAt: new Date().toISOString(),
      totalDevices: total,
      compliantDevices: compliant,
      nonCompliantDevices: nonCompliant,
      revokedDevices: revoked,
      pendingDevices: pending,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      byPlatform,
      topIssues,
      devices: [...MOCK_DEVICES],
    };
  }
}
