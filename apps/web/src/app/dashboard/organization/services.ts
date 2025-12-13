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

const STORAGE_KEYS = {
  DEPARTMENTS: 'org_departments',
  POSITIONS: 'org_positions',
  RELATIONSHIPS: 'org_relationships',
  LEVELS: 'org_levels',
  POSITION_REQUESTS: 'org_position_requests',
  ORG_CHANGES: 'org_changes',
  TRANSFERS: 'org_transfers',
  METRICS: 'org_metrics',
  SETTINGS: 'org_settings',
  VIEWS: 'org_views',
  POSITION_HISTORY: 'org_position_history',
};

export class DepartmentService {
  static async getDepartments(filters?: { type?: string; parentId?: string; managerId?: string }): Promise<Department[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    let departments: Department[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.type) departments = departments.filter(d => d.departmentType === filters.type);
      if (filters.parentId) departments = departments.filter(d => d.parentDepartmentId === filters.parentId);
      if (filters.managerId) departments = departments.filter(d => d.managerId === filters.managerId);
    }

    return departments;
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    const departments = await this.getDepartments();
    return departments.find(d => d.id === id) || null;
  }

  static async createDepartment(department: Department): Promise<Department> {
    // TODO: Replace with actual API call
    const departments = await this.getDepartments();
    departments.push(department);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    return department;
  }

  static async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    // TODO: Replace with actual API call
    const departments = await this.getDepartments();
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Department not found');

    departments[index] = { ...departments[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    return departments[index];
  }

  static async deleteDepartment(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const departments = await this.getDepartments();

    // Check if department has sub-departments
    const hasSubDepartments = departments.some(d => d.parentDepartmentId === id);
    if (hasSubDepartments) {
      throw new Error('Cannot delete department with sub-departments');
    }

    // Check if department has positions
    const positions = await PositionService.getPositions({ departmentId: id });
    if (positions.length > 0) {
      throw new Error('Cannot delete department with active positions');
    }

    const filtered = departments.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(filtered));
  }

  static async updateHeadcount(id: string, headcount: DepartmentHeadcount): Promise<Department> {
    return this.updateDepartment(id, { headcount });
  }

  static async getDepartmentHierarchy(rootId?: string): Promise<Department[]> {
    // TODO: Replace with actual API call
    const departments = await this.getDepartments();

    if (rootId) {
      return this.buildDepartmentTree(departments, rootId);
    }

    return departments.filter(d => !d.parentDepartmentId);
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
  static async getPositions(filters?: { departmentId?: string; status?: string; type?: string }): Promise<Position[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    let positions: Position[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) positions = positions.filter(p => p.departmentId === filters.departmentId);
      if (filters.status) positions = positions.filter(p => p.status === filters.status);
      if (filters.type) positions = positions.filter(p => p.positionType === filters.type);
    }

    return positions;
  }

  static async getPositionById(id: string): Promise<Position | null> {
    const positions = await this.getPositions();
    return positions.find(p => p.id === id) || null;
  }

  static async createPosition(position: Position): Promise<Position> {
    // TODO: Replace with actual API call
    const positions = await this.getPositions();
    positions.push(position);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));

    // Add to position history
    if (position.currentEmployee) {
      await this.addPositionHistory({
        id: `history-${Date.now()}`,
        positionId: position.id,
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

    return position;
  }

  static async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    // TODO: Replace with actual API call
    const positions = await this.getPositions();
    const index = positions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Position not found');

    const oldPosition = positions[index];
    positions[index] = { ...oldPosition, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));

    // Track significant changes in history
    if (updates.currentEmployee && updates.currentEmployee.employeeId !== oldPosition.currentEmployee?.employeeId) {
      await this.addPositionHistory({
        id: `history-${Date.now()}`,
        positionId: id,
        employeeId: updates.currentEmployee.employeeId,
        employeeName: updates.currentEmployee.employeeName,
        startDate: updates.currentEmployee.startDate,
        departmentId: positions[index].departmentId,
        departmentName: positions[index].departmentName,
        title: positions[index].jobTitle,
        level: positions[index].level,
        changedBy: 'system',
        changedDate: new Date().toISOString()
      });
    }

    return positions[index];
  }

  static async deletePosition(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const position = await this.getPositionById(id);
    if (!position) throw new Error('Position not found');

    if (position.currentEmployee) {
      throw new Error('Cannot delete position with current employee assignment');
    }

    const positions = await this.getPositions();
    const filtered = positions.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(filtered));
  }

  static async assignEmployee(positionId: string, employeeId: string, employeeName: string, employeeEmail: string, startDate: string): Promise<Position> {
    const position = await this.getPositionById(positionId);
    if (!position) throw new Error('Position not found');

    if (position.currentEmployee) {
      throw new Error('Position already filled. Please remove current employee first.');
    }

    return this.updatePosition(positionId, {
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
  }

  static async removeEmployee(positionId: string): Promise<Position> {
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

    return this.updatePosition(positionId, {
      currentEmployee: undefined,
      status: 'vacant'
    });
  }

  static async getVacantPositions(): Promise<Position[]> {
    return this.getPositions({ status: 'vacant' });
  }

  static async getPositionHistory(positionId: string): Promise<PositionHistory[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.POSITION_HISTORY);
    const history: PositionHistory[] = data ? JSON.parse(data) : [];
    return history.filter(h => h.positionId === positionId);
  }

  private static async addPositionHistory(history: PositionHistory): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEYS.POSITION_HISTORY);
    const historyList: PositionHistory[] = data ? JSON.parse(data) : [];
    historyList.push(history);
    localStorage.setItem(STORAGE_KEYS.POSITION_HISTORY, JSON.stringify(historyList));
  }

  private static async updatePositionHistory(id: string, updates: Partial<PositionHistory>): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEYS.POSITION_HISTORY);
    const historyList: PositionHistory[] = data ? JSON.parse(data) : [];
    const index = historyList.findIndex(h => h.id === id);

    if (index !== -1) {
      historyList[index] = { ...historyList[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.POSITION_HISTORY, JSON.stringify(historyList));
    }
  }
}

export class ReportingRelationshipService {
  static async getRelationships(filters?: { managerId?: string; subordinateId?: string }): Promise<ReportingRelationship[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
    let relationships: ReportingRelationship[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.managerId) relationships = relationships.filter(r => r.managerId === filters.managerId);
      if (filters.subordinateId) relationships = relationships.filter(r => r.subordinateId === filters.subordinateId);
    }

    return relationships;
  }

  static async createRelationship(relationship: ReportingRelationship): Promise<ReportingRelationship> {
    // TODO: Replace with actual API call
    const relationships = await this.getRelationships();

    // Check for circular reporting
    if (await this.hasCircularReporting(relationship.subordinateId, relationship.managerId)) {
      throw new Error('Circular reporting relationship detected');
    }

    relationships.push(relationship);
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(relationships));
    return relationship;
  }

  static async deleteRelationship(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const relationships = await this.getRelationships();
    const filtered = relationships.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(filtered));
  }

  static async getDirectReports(managerId: string): Promise<ReportingRelationship[]> {
    return this.getRelationships({ managerId });
  }

  static async getManager(subordinateId: string): Promise<ReportingRelationship | null> {
    const relationships = await this.getRelationships({ subordinateId });
    return relationships.find(r => r.isPrimary) || relationships[0] || null;
  }

  private static async hasCircularReporting(employeeId: string, potentialManagerId: string): Promise<boolean> {
    if (employeeId === potentialManagerId) return true;

    const managerRelationship = await this.getManager(potentialManagerId);
    if (!managerRelationship) return false;

    return this.hasCircularReporting(employeeId, managerRelationship.managerId);
  }

  static async calculateSpanOfControl(managerId: string): Promise<SpanOfControl> {
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
  }
}

export class OrganizationLevelService {
  static async getLevels(): Promise<OrganizationLevel[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.LEVELS);
    return data ? JSON.parse(data) : [];
  }

  static async createLevel(level: OrganizationLevel): Promise<OrganizationLevel> {
    // TODO: Replace with actual API call
    const levels = await this.getLevels();
    levels.push(level);
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
    return level;
  }

  static async updateLevel(id: string, updates: Partial<OrganizationLevel>): Promise<OrganizationLevel> {
    // TODO: Replace with actual API call
    const levels = await this.getLevels();
    const index = levels.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Level not found');

    levels[index] = { ...levels[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
    return levels[index];
  }
}

export class PositionRequestService {
  static async getRequests(filters?: { departmentId?: string; status?: string }): Promise<PositionRequest[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.POSITION_REQUESTS);
    let requests: PositionRequest[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) requests = requests.filter(r => r.departmentId === filters.departmentId);
      if (filters.status) requests = requests.filter(r => r.status === filters.status);
    }

    return requests;
  }

  static async submitRequest(request: PositionRequest): Promise<PositionRequest> {
    // TODO: Replace with actual API call
    const requests = await this.getRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.POSITION_REQUESTS, JSON.stringify(requests));
    return request;
  }

  static async approveRequest(id: string, approverId: string, approverName: string, approverTitle: string, level: number): Promise<PositionRequest> {
    // TODO: Replace with actual API call
    const requests = await this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const approval = {
      approverId,
      approverName,
      approverTitle,
      level,
      status: 'approved' as const,
      approvedDate: new Date().toISOString()
    };

    requests[index].approvalChain.push(approval);

    // Check if all required approvals are complete
    const requiredApprovals = requests[index].approvalChain.length;
    const completedApprovals = requests[index].approvalChain.filter(a => a.status === 'approved').length;

    if (completedApprovals === requiredApprovals) {
      requests[index].status = 'approved';

      // Create position if request is for new position
      if (requests[index].requestType === 'new_position' && requests[index].requestedPosition) {
        await PositionService.createPosition(requests[index].requestedPosition as Position);
      }
    }

    requests[index].lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.POSITION_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }

  static async rejectRequest(id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments: string): Promise<PositionRequest> {
    // TODO: Replace with actual API call
    const requests = await this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const approval = {
      approverId,
      approverName,
      approverTitle,
      level,
      status: 'rejected' as const,
      approvedDate: new Date().toISOString(),
      comments
    };

    requests[index].approvalChain.push(approval);
    requests[index].status = 'rejected';
    requests[index].lastModified = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.POSITION_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }
}

export class OrganizationChangeService {
  static async getChanges(filters?: { status?: string }): Promise<OrganizationChange[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ORG_CHANGES);
    let changes: OrganizationChange[] = data ? JSON.parse(data) : [];

    if (filters?.status) {
      changes = changes.filter(c => c.status === filters.status);
    }

    return changes;
  }

  static async createChange(change: OrganizationChange): Promise<OrganizationChange> {
    // TODO: Replace with actual API call
    const changes = await this.getChanges();
    changes.push(change);
    localStorage.setItem(STORAGE_KEYS.ORG_CHANGES, JSON.stringify(changes));
    return change;
  }

  static async updateChange(id: string, updates: Partial<OrganizationChange>): Promise<OrganizationChange> {
    // TODO: Replace with actual API call
    const changes = await this.getChanges();
    const index = changes.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Change not found');

    changes[index] = { ...changes[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ORG_CHANGES, JSON.stringify(changes));
    return changes[index];
  }
}

export class DepartmentTransferService {
  static async getTransfers(filters?: { employeeId?: string; status?: string }): Promise<DepartmentTransfer[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    let transfers: DepartmentTransfer[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) transfers = transfers.filter(t => t.employeeId === filters.employeeId);
      if (filters.status) transfers = transfers.filter(t => t.status === filters.status);
    }

    return transfers;
  }

  static async createTransfer(transfer: DepartmentTransfer): Promise<DepartmentTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getTransfers();
    transfers.push(transfer);
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
    return transfer;
  }

  static async approveTransfer(id: string, approverId: string, approverName: string): Promise<DepartmentTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getTransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transfer not found');

    transfers[index].status = 'approved';
    transfers[index].approvedBy = approverId;
    transfers[index].approvedByName = approverName;

    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
    return transfers[index];
  }
}

export class OrganizationAnalyticsService {
  static async getMetrics(): Promise<OrganizationMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
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

  static async calculateMetrics(): Promise<OrganizationMetrics> {
    const departments = await DepartmentService.getDepartments();
    const positions = await PositionService.getPositions();

    const filledPositions = positions.filter(p => p.status === 'active' && p.currentEmployee).length;
    const vacantPositions = positions.filter(p => p.status === 'vacant').length;

    const metrics: OrganizationMetrics = {
      totalDepartments: departments.length,
      totalPositions: positions.length,
      filledPositions,
      vacantPositions,
      totalHeadcount: filledPositions,
      fullTimeEmployees: positions.filter(p => p.employmentType === 'full_time' && p.currentEmployee).length,
      partTimeEmployees: positions.filter(p => p.employmentType === 'part_time' && p.currentEmployee).length,
      contractors: positions.filter(p => p.employmentType === 'contract' && p.currentEmployee).length,
      averageSpanOfControl: 0,
      organizationLevels: Math.max(...departments.map(d => d.level), 0),
      departmentsByType: [],
      positionsByType: [],
      headcountByDepartment: departments.map(d => ({
        departmentId: d.id,
        departmentName: d.departmentName,
        headcount: d.headcount.total
      })),
      headcountByLocation: [],
      vacancyRate: positions.length > 0 ? (vacantPositions / positions.length) * 100 : 0,
      turnoverImpact: 0,
      topLevelManagers: 0,
      managerToEmployeeRatio: 0,
      costCenterDistribution: [],
      growthTrend: []
    };

    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    return metrics;
  }
}

export class OrganizationSettingsService {
  static async getSettings(): Promise<OrganizationSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
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

  static async updateSettings(updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class OrgChartService {
  static async getViews(): Promise<OrgChartView[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.VIEWS);
    return data ? JSON.parse(data) : [];
  }

  static async buildOrgChart(rootDepartmentId?: string): Promise<OrganizationNode> {
    const departments = await DepartmentService.getDepartments();
    const positions = await PositionService.getPositions();
    const relationships = await ReportingRelationshipService.getRelationships();

    // Build tree structure starting from root
    const rootDept = rootDepartmentId
      ? departments.find(d => d.id === rootDepartmentId)
      : departments.find(d => !d.parentDepartmentId);

    if (!rootDept) {
      throw new Error('Root department not found');
    }

    return this.buildDepartmentNode(rootDept, departments, positions, relationships);
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
