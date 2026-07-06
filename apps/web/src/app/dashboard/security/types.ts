export type AccessLevel = 'read' | 'write' | 'admin';
export type AuditAction =
  'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'approve';
export interface AuditLog {
  logId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: string;
}
export interface RolePermission {
  roleId: string;
  roleName: string;
  permissions: Permission[];
  assignedUsers: number;
  createdAt: string;
}
export interface Permission {
  resource: string;
  action?: string;
  accessLevel?: AccessLevel | string;
  description?: string;
  conditions?: string[];
}
export interface SecuritySettings {
  settingsId: string;
  organizationId: string;
  auditSettings: { retentionDays: number; logAllActions: boolean };
  accessSettings: {
    sessionTimeout: number;
    mfaRequired: boolean;
    passwordPolicy: { minLength: number; requireSpecialChars: boolean; expiryDays: number };
  };
  gdprSettings: { dataRetentionDays: number; rightToErasure: boolean; consentRequired: boolean };
  notifications: { suspiciousActivity: boolean; accessViolation: boolean; dataExport: boolean };
  updatedAt: string;
}
export interface SecurityAlert {
  alertId: string;
  alertType: 'access_violation' | 'suspicious_activity' | 'data_export' | 'failed_login';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  userId?: string;
  ipAddress?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  createdAt: string;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
