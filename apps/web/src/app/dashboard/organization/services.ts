// Organization Chart Services
import type {
  Department,
  Position,
  ReportingRelationship,
  OrganizationLevel,
  PositionRequest,
  OrganizationChange,
  DepartmentTransfer,
  OrganizationMetrics,
  OrganizationSettings,
  OrgChartView,
  PositionHistory,
  SpanOfControl,
  OrganizationNode,
  DepartmentHeadcount
} from './types';
import { APIClient, APIError } from '@/lib/api-client';

export class DepartmentService {
  private static readonly BASE_ENDPOINT = '/departments';

  static async getDepartments(filters?: { type?: string; parentId?: string; managerId?: string }): Promise<Department[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.type) params.type = filters.type;
      if (filters?.parentId) params.parentId = filters.parentId;
      if (filters?.managerId) params.managerId = filters.managerId;

      return await APIClient.get<Department[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch departments: ${error.message}`);
      }
      throw error;
    }
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    try {
      return await APIClient.get<Department>(`${this.BASE_ENDPOINT}/${id}`);
    } catch (error: any) {
      if (error instanceof APIError && error.statusCode === 404) {
        return null;
      }
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch department: ${error.message}`);
      }
      throw error;
    }
  }

  static async createDepartment(department: Department): Promise<Department> {
    try {
      return await APIClient.post<Department>(this.BASE_ENDPOINT, department);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create department: ${error.message}`);
      }
      throw error;
    }
  }

  static async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    try {
      return await APIClient.put<Department>(`${this.BASE_ENDPOINT}/${id}`, updates);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update department: ${error.message}`);
      }
      throw error;
    }
  }

  static async deleteDepartment(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.BASE_ENDPOINT}/${id}`);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to delete department: ${error.message}`);
      }
      throw error;
    }
  }

  static async updateHeadcount(id: string, headcount: DepartmentHeadcount): Promise<Department> {
    return this.updateDepartment(id, { headcount });
  }

  static async getDepartmentHierarchy(rootId?: string): Promise<Department[]> {
    try {
      const params: Record<string, any> = { hierarchy: true };
      if (rootId) params.rootId = rootId;

      return await APIClient.get<Department[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch department hierarchy: ${error.message}`);
      }
      throw error;
    }
  }

  private static buildDepartmentTree(departments: Department[], parentId: string): Department[] {
    const children = departments.filter(d => d.parentDepartmentId === parentId);
    return children.map(child => ({
      ...child,
      subDepartments: this.buildDepartmentTree(departments, child.id).map(d => d.id)
    }));
  }
}

export class PositionService {
  private static readonly BASE_ENDPOINT = '/positions';

  static async getPositions(filters?: { departmentId?: string; status?: string; type?: string }): Promise<Position[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.departmentId) params.departmentId = filters.departmentId;
      if (filters?.status) params.status = filters.status;
      if (filters?.type) params.type = filters.type;

      return await APIClient.get<Position[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch positions: ${error.message}`);
      }
      throw error;
    }
  }

  static async getPositionById(id: string): Promise<Position | null> {
    try {
      return await APIClient.get<Position>(`${this.BASE_ENDPOINT}/${id}`);
    } catch (error: any) {
      if (error instanceof APIError && error.statusCode === 404) {
        return null;
      }
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch position: ${error.message}`);
      }
      throw error;
    }
  }

  static async createPosition(position: Position): Promise<Position> {
    try {
      const created = await APIClient.post<Position>(this.BASE_ENDPOINT, position);

      // Add to position history
      if (position.currentEmployee) {
        await this.addPositionHistory({
          id: `history-${Date.now()}`,
          positionId: created.id,
          employeeId: position.currentEmployee.employeeId,
          employeeName: position.currentEmployee.employeeName,
          startDate: position.currentEmployee.startDate,
          departmentId: position.departmentId,
          departmentName: position.departmentName,
          title: position.jobTitle,
          level: position.level,
          changedBy: position.createdBy,
          changedDate: position.createdDate
        });
      }

      return created;
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create position: ${error.message}`);
      }
      throw error;
    }
  }

  static async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    try {
      const updated = await APIClient.put<Position>(`${this.BASE_ENDPOINT}/${id}`, updates);

      // Track significant changes in history
      if (updates.currentEmployee) {
        const currentPosition = await this.getPositionById(id);
        if (currentPosition && updates.currentEmployee.employeeId !== currentPosition.currentEmployee?.employeeId) {
          await this.addPositionHistory({
            id: `history-${Date.now()}`,
            positionId: id,
            employeeId: updates.currentEmployee.employeeId,
            employeeName: updates.currentEmployee.employeeName,
            startDate: updates.currentEmployee.startDate,
            departmentId: currentPosition.departmentId,
            departmentName: currentPosition.departmentName,
            title: currentPosition.jobTitle,
            level: currentPosition.level,
            changedBy: 'system',
            changedDate: new Date().toISOString()
          });
        }
      }

      return updated;
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update position: ${error.message}`);
      }
      throw error;
    }
  }

  static async deletePosition(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.BASE_ENDPOINT}/${id}`);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to delete position: ${error.message}`);
      }
      throw error;
    }
  }

  static async assignEmployee(positionId: string, employeeId: string, employeeName: string, employeeEmail: string, startDate: string): Promise<Position> {
    try {
      return await this.updatePosition(positionId, {
        currentEmployee: {
          employeeId,
          employeeName,
          employeeEmail,
          startDate,
          isPrimary: true,
          allocationPercentage: 100
        },
        status: 'active'
      });
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to assign employee: ${error.message}`);
      }
      throw error;
    }
  }

  static async removeEmployee(positionId: string): Promise<Position> {
    try {
      const position = await this.getPositionById(positionId);
      if (!position) throw new Error('Position not found');

      // End current assignment in history
      if (position.currentEmployee) {
        const history = await this.getPositionHistory(positionId);
        const currentHistory = history.find(h =>
          h.employeeId === position.currentEmployee!.employeeId && !h.endDate
        );

        if (currentHistory) {
          await this.updatePositionHistory(currentHistory.id, {
            endDate: new Date().toISOString()
          });
        }
      }

      return await this.updatePosition(positionId, {
        currentEmployee: undefined,
        status: 'vacant'
      });
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to remove employee: ${error.message}`);
      }
      throw error;
    }
  }

  static async getVacantPositions(): Promise<Position[]> {
    return this.getPositions({ status: 'vacant' });
  }

  static async getPositionHistory(positionId: string): Promise<PositionHistory[]> {
    try {
      return await APIClient.get<PositionHistory[]>(
        `${this.BASE_ENDPOINT}/${positionId}/history`
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch position history: ${error.message}`);
      }
      throw error;
    }
  }

  private static async addPositionHistory(history: PositionHistory): Promise<void> {
    try {
      await APIClient.post<PositionHistory>(
        `/position-history`,
        history
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to add position history: ${error.message}`);
      }
      throw error;
    }
  }

  private static async updatePositionHistory(id: string, updates: Partial<PositionHistory>): Promise<void> {
    try {
      await APIClient.put<PositionHistory>(
        `/position-history/${id}`,
        updates
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update position history: ${error.message}`);
      }
      throw error;
    }
  }
}

export class ReportingRelationshipService {
  private static readonly BASE_ENDPOINT = '/reporting-relationships';

  static async getRelationships(filters?: { managerId?: string; subordinateId?: string }): Promise<ReportingRelationship[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.managerId) params.managerId = filters.managerId;
      if (filters?.subordinateId) params.subordinateId = filters.subordinateId;

      return await APIClient.get<ReportingRelationship[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch reporting relationships: ${error.message}`);
      }
      throw error;
    }
  }

  static async createRelationship(relationship: ReportingRelationship): Promise<ReportingRelationship> {
    try {
      // Check for circular reporting
      if (await this.hasCircularReporting(relationship.subordinateId, relationship.managerId)) {
        throw new Error('Circular reporting relationship detected');
      }

      return await APIClient.post<ReportingRelationship>(this.BASE_ENDPOINT, relationship);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create reporting relationship: ${error.message}`);
      }
      throw error;
    }
  }

  static async deleteRelationship(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.BASE_ENDPOINT}/${id}`);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to delete reporting relationship: ${error.message}`);
      }
      throw error;
    }
  }

  static async getDirectReports(managerId: string): Promise<ReportingRelationship[]> {
    return this.getRelationships({ managerId });
  }

  static async getManager(subordinateId: string): Promise<ReportingRelationship | null> {
    try {
      const relationships = await this.getRelationships({ subordinateId });
      return relationships.find(r => r.isPrimary) || relationships[0] || null;
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch manager: ${error.message}`);
      }
      throw error;
    }
  }

  private static async hasCircularReporting(employeeId: string, potentialManagerId: string): Promise<boolean> {
    try {
      if (employeeId === potentialManagerId) return true;

      const managerRelationship = await this.getManager(potentialManagerId);
      if (!managerRelationship) return false;

      return this.hasCircularReporting(employeeId, managerRelationship.managerId);
    } catch (error: any) {
      // If error occurs during circular check, assume false to allow operation
      return false;
    }
  }

  static async calculateSpanOfControl(managerId: string): Promise<SpanOfControl> {
    try {
      const directReports = await this.getDirectReports(managerId);

      let totalReports = directReports.length;
      let maxLevels = 1;
      const departments = new Set<string>();
      const locations = new Set<string>();

      // Recursively calculate total reports
      for (const report of directReports) {
        const subReports = await this.getDirectReports(report.subordinateId);
        totalReports += subReports.length;
        maxLevels = Math.max(maxLevels, 2);
        departments.add(report.departmentId);
      }

      const manager = directReports[0];
      const isOptimal = directReports.length >= 3 && directReports.length <= 9;

      return {
        managerId,
        managerName: manager?.managerName || '',
        managerTitle: manager?.managerTitle || '',
        directReports: directReports.length,
        totalReports,
        levels: maxLevels,
        departments: departments.size,
        locations: Array.from(locations),
        isOptimal,
        recommendation: isOptimal ? undefined : directReports.length < 3 ? 'Consider consolidating roles' : 'Consider delegating to additional managers'
      };
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to calculate span of control: ${error.message}`);
      }
      throw error;
    }
  }
}

export class OrganizationLevelService {
  private static readonly BASE_ENDPOINT = '/organization-levels';

  static async getLevels(): Promise<OrganizationLevel[]> {
    try {
      return await APIClient.get<OrganizationLevel[]>(this.BASE_ENDPOINT);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch organization levels: ${error.message}`);
      }
      throw error;
    }
  }

  static async createLevel(level: OrganizationLevel): Promise<OrganizationLevel> {
    try {
      return await APIClient.post<OrganizationLevel>(this.BASE_ENDPOINT, level);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create organization level: ${error.message}`);
      }
      throw error;
    }
  }

  static async updateLevel(id: string, updates: Partial<OrganizationLevel>): Promise<OrganizationLevel> {
    try {
      return await APIClient.put<OrganizationLevel>(`${this.BASE_ENDPOINT}/${id}`, updates);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update organization level: ${error.message}`);
      }
      throw error;
    }
  }
}

export class PositionRequestService {
  private static readonly BASE_ENDPOINT = '/position-requests';

  static async getRequests(filters?: { departmentId?: string; status?: string }): Promise<PositionRequest[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.departmentId) params.departmentId = filters.departmentId;
      if (filters?.status) params.status = filters.status;

      return await APIClient.get<PositionRequest[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch position requests: ${error.message}`);
      }
      throw error;
    }
  }

  static async submitRequest(request: PositionRequest): Promise<PositionRequest> {
    try {
      return await APIClient.post<PositionRequest>(this.BASE_ENDPOINT, request);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to submit position request: ${error.message}`);
      }
      throw error;
    }
  }

  static async approveRequest(id: string, approverId: string, approverName: string, approverTitle: string, level: number): Promise<PositionRequest> {
    try {
      const approval = {
        approverId,
        approverName,
        approverTitle,
        level,
        status: 'approved' as const,
        approvedDate: new Date().toISOString()
      };

      return await APIClient.post<PositionRequest>(
        `${this.BASE_ENDPOINT}/${id}/approve`,
        approval
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to approve position request: ${error.message}`);
      }
      throw error;
    }
  }

  static async rejectRequest(id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments: string): Promise<PositionRequest> {
    try {
      const approval = {
        approverId,
        approverName,
        approverTitle,
        level,
        status: 'rejected' as const,
        approvedDate: new Date().toISOString(),
        comments
      };

      return await APIClient.post<PositionRequest>(
        `${this.BASE_ENDPOINT}/${id}/reject`,
        approval
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to reject position request: ${error.message}`);
      }
      throw error;
    }
  }
}

export class OrganizationChangeService {
  private static readonly BASE_ENDPOINT = '/organization-changes';

  static async getChanges(filters?: { status?: string }): Promise<OrganizationChange[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.status) params.status = filters.status;

      return await APIClient.get<OrganizationChange[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch organization changes: ${error.message}`);
      }
      throw error;
    }
  }

  static async createChange(change: OrganizationChange): Promise<OrganizationChange> {
    try {
      return await APIClient.post<OrganizationChange>(this.BASE_ENDPOINT, change);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create organization change: ${error.message}`);
      }
      throw error;
    }
  }

  static async updateChange(id: string, updates: Partial<OrganizationChange>): Promise<OrganizationChange> {
    try {
      return await APIClient.put<OrganizationChange>(`${this.BASE_ENDPOINT}/${id}`, updates);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update organization change: ${error.message}`);
      }
      throw error;
    }
  }
}

export class DepartmentTransferService {
  private static readonly BASE_ENDPOINT = '/department-transfers';

  static async getTransfers(filters?: { employeeId?: string; status?: string }): Promise<DepartmentTransfer[]> {
    try {
      const params: Record<string, any> = {};
      if (filters?.employeeId) params.employeeId = filters.employeeId;
      if (filters?.status) params.status = filters.status;

      return await APIClient.get<DepartmentTransfer[]>(this.BASE_ENDPOINT, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch department transfers: ${error.message}`);
      }
      throw error;
    }
  }

  static async createTransfer(transfer: DepartmentTransfer): Promise<DepartmentTransfer> {
    try {
      return await APIClient.post<DepartmentTransfer>(this.BASE_ENDPOINT, transfer);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to create department transfer: ${error.message}`);
      }
      throw error;
    }
  }

  static async approveTransfer(id: string, approverId: string, approverName: string): Promise<DepartmentTransfer> {
    try {
      const approval = {
        approverId,
        approverName,
        approvedDate: new Date().toISOString()
      };

      return await APIClient.post<DepartmentTransfer>(
        `${this.BASE_ENDPOINT}/${id}/approve`,
        approval
      );
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to approve department transfer: ${error.message}`);
      }
      throw error;
    }
  }
}

export class OrganizationAnalyticsService {
  private static readonly BASE_ENDPOINT = '/organization-metrics';

  static async getMetrics(): Promise<OrganizationMetrics> {
    try {
      return await APIClient.get<OrganizationMetrics>(this.BASE_ENDPOINT);
    } catch (error: any) {
      if (error instanceof APIError) {
        // Return default metrics if API fails
                return {
          totalDepartments: 0,
          totalPositions: 0,
          filledPositions: 0,
          vacantPositions: 0,
          totalHeadcount: 0,
          fullTimeEmployees: 0,
          partTimeEmployees: 0,
          contractors: 0,
          averageSpanOfControl: 0,
          organizationLevels: 0,
          departmentsByType: [],
          positionsByType: [],
          headcountByDepartment: [],
          headcountByLocation: [],
          vacancyRate: 0,
          turnoverImpact: 0,
          topLevelManagers: 0,
          managerToEmployeeRatio: 0,
          costCenterDistribution: [],
          growthTrend: []
        };
      }
      throw error;
    }
  }

  static async calculateMetrics(): Promise<OrganizationMetrics> {
    try {
      return await APIClient.post<OrganizationMetrics>(`${this.BASE_ENDPOINT}/calculate`, {});
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to calculate metrics: ${error.message}`);
      }
      throw error;
    }
  }
}

export class OrganizationSettingsService {
  private static readonly BASE_ENDPOINT = '/organization-settings';

  static async getSettings(): Promise<OrganizationSettings> {
    try {
      return await APIClient.get<OrganizationSettings>(this.BASE_ENDPOINT);
    } catch (error: any) {
      if (error instanceof APIError) {
        // Return default settings if API fails
                return {
          enableDepartmentHierarchy: true,
          maxOrganizationLevels: 10,
          requirePositionApproval: true,
          approvalLevels: 2,
          allowMatrixReporting: true,
          maxReportingRelationships: 3,
          enableCostCenters: true,
          enableBudgetTracking: true,
          enableSuccessionPlanning: true,
          autoUpdateOrgChart: true,
          showVacantPositions: true,
          showContractors: true,
          enablePositionVersioning: true,
          positionCodeFormat: 'POS-{YYYY}-{####}',
          departmentCodeFormat: 'DEPT-{####}',
          fiscalYearStart: '01-01',
          defaultCurrency: 'USD'
        };
      }
      throw error;
    }
  }

  static async updateSettings(updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    try {
      return await APIClient.put<OrganizationSettings>(this.BASE_ENDPOINT, updates);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to update organization settings: ${error.message}`);
      }
      throw error;
    }
  }
}

export class OrgChartService {
  private static readonly BASE_ENDPOINT = '/org-chart';

  static async getViews(): Promise<OrgChartView[]> {
    try {
      return await APIClient.get<OrgChartView[]>(`${this.BASE_ENDPOINT}/views`);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch org chart views: ${error.message}`);
      }
      throw error;
    }
  }

  static async buildOrgChart(rootDepartmentId?: string): Promise<OrganizationNode> {
    try {
      const params: Record<string, any> = {};
      if (rootDepartmentId) params.rootDepartmentId = rootDepartmentId;

      return await APIClient.get<OrganizationNode>(`${this.BASE_ENDPOINT}/build`, params);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw new Error(`Failed to build org chart: ${error.message}`);
      }
      throw error;
    }
  }

  private static buildDepartmentNode(
    department: Department,
    allDepartments: Department[],
    allPositions: Position[],
    allRelationships: ReportingRelationship[]
  ): OrganizationNode {
    const node: OrganizationNode = {
      id: department.id,
      nodeType: 'department',
      departmentId: department.id,
      name: department.departmentName,
      level: department.level,
      order: 0,
      children: [],
      isExpanded: true
    };

    // Add positions in this department
    const deptPositions = allPositions.filter(p => p.departmentId === department.id);
    node.children = deptPositions.map(pos => this.buildPositionNode(pos, allRelationships));

    // Add sub-departments
    const subDepartments = allDepartments.filter(d => d.parentDepartmentId === department.id);
    node.children.push(...subDepartments.map(subDept =>
      this.buildDepartmentNode(subDept, allDepartments, allPositions, allRelationships)
    ));

    return node;
  }

  private static buildPositionNode(position: Position, allRelationships: ReportingRelationship[]): OrganizationNode {
    return {
      id: position.id,
      nodeType: 'position',
      positionId: position.id,
      departmentId: position.departmentId,
      employeeId: position.currentEmployee?.employeeId,
      name: position.jobTitle,
      title: position.currentEmployee?.employeeName || 'Vacant',
      level: position.level,
      order: 0,
      children: [],
      isExpanded: false
    };
  }
}
