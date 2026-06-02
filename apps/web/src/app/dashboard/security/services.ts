// Security Module - Service Layer
// Handles all business logic and data operations for security features

import { APIClient } from '@/lib/api-client';
import type { AuditLog, RolePermission, SecuritySettings, SecurityAlert } from './types';

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

export class AuditLogService {
  private static endpoint = '/security/audit-logs';

  static async getAll(): Promise<AuditLog[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<AuditLog>(response, 'logs');
    } catch (error: any) {
      return [];
    }
  }

  static async create(data: Partial<AuditLog>): Promise<AuditLog | null> {
    try {
      const response = await APIClient.post<{ log: AuditLog }>(this.endpoint, data);
      return response.log;
    } catch (error: any) {
      return null;
    }
  }

  static async getById(logId: string): Promise<AuditLog | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${logId}`);
      return APIClient.unwrapItem<AuditLog>(response, 'log');
    } catch (error: any) {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<RolePermission>(response, 'roles');
    } catch (error: any) {
      return [];
    }
  }

  static async create(data: Partial<RolePermission>): Promise<RolePermission | null> {
    try {
      const response = await APIClient.post<{ role: RolePermission }>(this.endpoint, data);
      return response.role;
    } catch (error: any) {
      return null;
    }
  }

  static async update(
    id: string,
    updates: Partial<RolePermission>
  ): Promise<RolePermission | null> {
    try {
      const response = await APIClient.put<{ role: RolePermission }>(
        `${this.endpoint}/${id}`,
        updates
      );
      return response.role;
    } catch (error: any) {
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await APIClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error: any) {
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
    } catch (error: any) {
      return null;
    }
  }

  static async update(settings: Partial<SecuritySettings>): Promise<SecuritySettings | null> {
    try {
      const response = await APIClient.put<{ settings: SecuritySettings }>(this.endpoint, settings);
      return response.settings;
    } catch (error: any) {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<SecurityAlert>(response, 'alerts');
    } catch (error: any) {
      return [];
    }
  }

  static async create(data: Partial<SecurityAlert>): Promise<SecurityAlert | null> {
    try {
      const response = await APIClient.post<{ alert: SecurityAlert }>(this.endpoint, data);
      return response.alert;
    } catch (error: any) {
      return null;
    }
  }

  static async update(id: string, updates: Partial<SecurityAlert>): Promise<SecurityAlert | null> {
    try {
      const response = await APIClient.put<{ alert: SecurityAlert }>(
        `${this.endpoint}/${id}`,
        updates
      );
      return response.alert;
    } catch (error: any) {
      return null;
    }
  }

  static async getActive(): Promise<SecurityAlert[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/active`);
      return APIClient.unwrapList<SecurityAlert>(response, 'alerts');
    } catch (error: any) {
      return [];
    }
  }
}
