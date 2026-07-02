// Security Module - Service Layer
// Handles all business logic and data operations for security features

import { APIClient } from '@/lib/api-client';
import type {
  AuditLog,
  RolePermission,
  SecuritySettings,
  SecurityAlert,
  Permission,
} from './types';

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

export interface AuditLogFilters {
  action?: string;
  userId?: string;
  module?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogListResult {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export class AuditLogService {
  private static endpoint = '/security/audit-logs';

  static async getAll(filters?: AuditLogFilters): Promise<AuditLogListResult> {
    try {
      const params: Record<string, any> = {};
      if (filters?.action) params.action = filters.action;
      if (filters?.userId) params.userId = filters.userId;
      if (filters?.module) params.module = filters.module;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.q) params.q = filters.q;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      const response = await APIClient.get<any>(this.endpoint, params);
      const logs = APIClient.unwrapList<AuditLog>(response, 'logs');
      const pagination = response?.meta?.pagination ?? {};
      return {
        logs,
        total: Number(pagination.total ?? logs.length),
        page: Number(pagination.page ?? filters?.page ?? 1),
        limit: Number(pagination.limit ?? filters?.limit ?? 20),
      };
    } catch (error: any) {
      return { logs: [], total: 0, page: 1, limit: 20 };
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
      const response = await APIClient.post<unknown>(this.endpoint, data);
      return APIClient.unwrapItem<RolePermission>(response, 'role');
    } catch (error: any) {
      return null;
    }
  }

  static async update(
    id: string,
    updates: Partial<RolePermission>
  ): Promise<RolePermission | null> {
    try {
      const response = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
      return APIClient.unwrapItem<RolePermission>(response, 'role');
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<SecuritySettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  static async update(settings: Partial<SecuritySettings>): Promise<SecuritySettings | null> {
    try {
      const response = await APIClient.put<unknown>(this.endpoint, settings);
      return APIClient.unwrapItem<SecuritySettings>(response, 'settings');
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
      const response = await APIClient.post<unknown>(this.endpoint, data);
      return APIClient.unwrapItem<SecurityAlert>(response, 'alert');
    } catch (error: any) {
      return null;
    }
  }

  static async update(id: string, updates: Partial<SecurityAlert>): Promise<SecurityAlert | null> {
    try {
      const response = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
      return APIClient.unwrapItem<SecurityAlert>(response, 'alert');
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

  static async getActive(): Promise<SecurityAlert[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/active`);
      return APIClient.unwrapList<SecurityAlert>(response, 'alerts');
    } catch (error: any) {
      return [];
    }
  }
}

// ============================================================================
// PERMISSION SERVICE
// ============================================================================

export class PermissionService {
  private static endpoint = '/security/permissions';

  static async getAll(): Promise<Permission[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Permission>(response, 'permissions');
    } catch (error: any) {
      return [];
    }
  }
}
