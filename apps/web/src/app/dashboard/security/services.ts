// Security Module - Service Layer
// Handles all business logic and data operations for security features

import { APIClient } from '@/lib/api-client';
import { AuditLog, RolePermission, SecuritySettings, SecurityAlert } from './types';

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

export class AuditLogService {
  private static endpoint = '/security/audit-logs';

  static async getAll(): Promise<AuditLog[]> {
    try {
      const response = await APIClient.get<{ logs?: AuditLog[] }>(this.endpoint);
      return response.logs || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  static async create(data: Partial<AuditLog>): Promise<AuditLog | null> {
    try {
      const response = await APIClient.post<{ log: AuditLog }>(this.endpoint, data);
      return response.log;
    } catch (error) {
      console.error('Error creating audit log:', error);
      return null;
    }
  }

  static async getById(logId: string): Promise<AuditLog | null> {
    try {
      const response = await APIClient.get<{ log?: AuditLog }>(`${this.endpoint}/${logId}`);
      return response.log || null;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return null;
    }
  }
}

// ============================================================================
// ROLE SERVICE
// ============================================================================

export class RoleService {
  private static endpoint = '/security/roles';

  static async getAll(): Promise<RolePermission[]> {
    try {
      const response = await APIClient.get<{ roles?: RolePermission[] }>(this.endpoint);
      return response.roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  static async create(data: Partial<RolePermission>): Promise<RolePermission | null> {
    try {
      const response = await APIClient.post<{ role: RolePermission }>(this.endpoint, data);
      return response.role;
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  }

  static async update(id: string, updates: Partial<RolePermission>): Promise<RolePermission | null> {
    try {
      const response = await APIClient.put<{ role: RolePermission }>(`${this.endpoint}/${id}`, updates);
      return response.role;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await APIClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }
}

// ============================================================================
// SECURITY SETTINGS SERVICE
// ============================================================================

export class SecuritySettingsService {
  private static endpoint = '/security/settings';

  static async get(): Promise<SecuritySettings | null> {
    try {
      const response = await APIClient.get<{ settings: SecuritySettings }>(this.endpoint);
      return response.settings;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return null;
    }
  }

  static async update(settings: Partial<SecuritySettings>): Promise<SecuritySettings | null> {
    try {
      const response = await APIClient.put<{ settings: SecuritySettings }>(this.endpoint, settings);
      return response.settings;
    } catch (error) {
      console.error('Error updating security settings:', error);
      return null;
    }
  }
}

// ============================================================================
// SECURITY ALERT SERVICE
// ============================================================================

export class SecurityAlertService {
  private static endpoint = '/security/alerts';

  static async getAll(): Promise<SecurityAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: SecurityAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  }

  static async create(data: Partial<SecurityAlert>): Promise<SecurityAlert | null> {
    try {
      const response = await APIClient.post<{ alert: SecurityAlert }>(this.endpoint, data);
      return response.alert;
    } catch (error) {
      console.error('Error creating security alert:', error);
      return null;
    }
  }

  static async update(id: string, updates: Partial<SecurityAlert>): Promise<SecurityAlert | null> {
    try {
      const response = await APIClient.put<{ alert: SecurityAlert }>(`${this.endpoint}/${id}`, updates);
      return response.alert;
    } catch (error) {
      console.error('Error updating security alert:', error);
      return null;
    }
  }

  static async getActive(): Promise<SecurityAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: SecurityAlert[] }>(`${this.endpoint}/active`);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching active security alerts:', error);
      return [];
    }
  }
}
