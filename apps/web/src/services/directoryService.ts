/**
 * @module directoryService
 * @description Employee Directory Service — search, org chart, profiles,
 *              department/location data, and reporting chain (Sec 17.4)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
export type WorkLocation = 'office' | 'remote' | 'hybrid';

export interface DirectoryEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  extension?: string;
  designation: string;
  department: string;
  departmentId: string;
  location: string;
  locationId: string;
  managerId?: string;
  managerName?: string;
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  joinDate: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  skills: string[];
  directReportsCount: number;
  isActive: boolean;
}

export interface OrgChartNode {
  employee: DirectoryEmployee;
  children: OrgChartNode[];
  level: number;
  isExpanded: boolean;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
  headName?: string;
  employeeCount: number;
  parentDepartmentId?: string;
  description?: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  employeeCount: number;
  address?: string;
  isHeadquarters: boolean;
}

export interface DirectorySearchFilters {
  query?: string;
  departmentId?: string;
  locationId?: string;
  designation?: string;
  employmentType?: EmploymentType;
  workLocation?: WorkLocation;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class DirectoryService {
  /**
   * Search employees by name, email, ID, department
   */
  static async searchEmployees(
    query?: string,
    filters?: DirectorySearchFilters
  ): Promise<DirectoryEmployee[]> {
    return APIClient.get<DirectoryEmployee[]>('/v1/directory/employees', {
      query,
      ...filters,
    });
  }

  /**
   * Get full employee profile card data
   */
  static async getEmployee(id: string): Promise<DirectoryEmployee | null> {
    return APIClient.get<DirectoryEmployee>(`/v1/directory/employees/${id}`);
  }

  /**
   * Get hierarchical org chart structure
   */
  static async getOrgChart(rootId?: string): Promise<OrgChartNode | null> {
    return APIClient.get<OrgChartNode>('/v1/directory/org-chart', { rootId });
  }

  /**
   * Get all departments with head counts
   */
  static async getDepartments(): Promise<Department[]> {
    return APIClient.get<Department[]>('/v1/directory/departments');
  }

  /**
   * Get office locations with employee counts
   */
  static async getLocations(): Promise<OfficeLocation[]> {
    return APIClient.get<OfficeLocation[]>('/v1/directory/locations');
  }

  /**
   * Get reporting chain from employee up to CEO
   */
  static async getReportingChain(employeeId: string): Promise<DirectoryEmployee[]> {
    return APIClient.get<DirectoryEmployee[]>(
      `/v1/directory/employees/${employeeId}/reporting-chain`
    );
  }

  /**
   * Get direct reports for a manager
   */
  static async getDirectReports(managerId: string): Promise<DirectoryEmployee[]> {
    return APIClient.get<DirectoryEmployee[]>(
      `/v1/directory/employees/${managerId}/direct-reports`
    );
  }
}
