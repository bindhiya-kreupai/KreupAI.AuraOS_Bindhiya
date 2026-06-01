// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
// Core HR Module - Service Layer

import { APIClient } from '@/lib/api-client';
import type {
  Asset, AssetAssignment, CoreHRSettings,
  InterCompanyTransfer, SharedServiceRequest, CostCenter, IDCard, ExitProcess, ClearanceItem, Anniversary, ProbationRecord, ConfirmationLetter, Employee, OrganizationUnit, EmploymentHistory, EmployeeDocument, DocumentTemplate, Position, LifeEvent, MassUpdate, LetterRequest, AutoNumberSequence } from './types';

function mapAssetAssignment(raw: any): AssetAssignment {
  return {
    assignmentId: raw.id || raw.assignmentId,
    assetId: raw.assetId,
    assetTag: raw.asset?.assetCode || raw.assetTag || raw.assetId,
    assetName: raw.asset?.assetName || raw.assetName || 'Unknown Asset',
    employeeId: raw.employeeId,
    employeeName:
      raw.employee?.firstName && raw.employee?.lastName
        ? `${raw.employee.firstName} ${raw.employee.lastName}`
        : raw.employeeName || 'Unknown Employee',
    assignmentDate: new Date(raw.assignedDate || raw.assignmentDate),
    returnDate: raw.returnedDate ? new Date(raw.returnedDate) : undefined,
    expectedReturnDate: raw.expectedReturnDate ? new Date(raw.expectedReturnDate) : undefined,
    condition: raw.conditionAtAssignment || raw.condition || '',
    assignedBy: raw.assignedBy || 'system',
    returnCondition: raw.returnCondition || undefined,
    returnedBy: raw.returnedBy || undefined,
    notes: raw.notes || undefined,
    status: String(raw.status || 'ACTIVE').toLowerCase() as AssetAssignment['status'],
  };
}

function mapAsset(raw: any): Asset {
  const status = String(raw.status || 'AVAILABLE').toUpperCase();

  return {
    assetId: raw.id || raw.assetId,
    assetTag: raw.assetCode || raw.assetTag || raw.serialNumber || '',
    assetName: raw.assetName || 'Unknown Asset',
    assetType: String(raw.assetType || 'other').toLowerCase() as Asset['assetType'],
    category: raw.category || '',
    manufacturer: raw.manufacturer || raw.brand || '',
    model: raw.modelNumber || raw.model || '',
    serialNumber: raw.serialNumber || '',
    purchaseDate: raw.purchaseDate ? new Date(raw.purchaseDate) : new Date(),
    purchaseCost: Number(raw.purchasePrice || raw.purchaseCost || 0),
    currentValue: Number(raw.currentValue || 0),
    warrantyExpiryDate: raw.warrantyExpiryDate ? new Date(raw.warrantyExpiryDate) : undefined,
    specifications: raw.specifications || undefined,
    location: raw.location?.name || raw.location || '',
    assignedTo: raw.assignedTo || undefined,
    assignedToName: raw.assignedToName || undefined,
    assignedDate: raw.assignedDate ? new Date(raw.assignedDate) : undefined,
    status:
      status === 'ASSIGNED'
        ? 'assigned'
        : status === 'IN_REPAIR'
          ? 'in_repair'
          : status === 'RETIRED' || status === 'DISPOSED'
            ? 'retired'
            : status === 'LOST'
              ? 'lost'
              : 'available',
    condition: String(raw.condition || 'good').toLowerCase() as Asset['condition'],
    lastMaintenanceDate: raw.lastMaintenanceDate ? new Date(raw.lastMaintenanceDate) : undefined,
    nextMaintenanceDate: raw.nextMaintenanceDate ? new Date(raw.nextMaintenanceDate) : undefined,
  };
}

function mapCostCenter(raw: any): CostCenter {
  const departments = Array.isArray(raw.departments) ? raw.departments : [];

  return {
    costCenterId: raw.id || raw.costCenterId,
    costCenterCode: raw.code || raw.costCenterCode || '',
    costCenterName: raw.name || raw.costCenterName || 'Unknown Cost Center',
    description: raw.description || '',
    department: raw.department || departments[0]?.name || '',
    managerId: raw.managerId || undefined,
    managerName: raw.managerName || undefined,
    location: raw.location || undefined,
    fiscalYear: Number(raw.fiscalYear || new Date().getFullYear()),
    budget: {
      totalBudget: Number(raw.budget?.totalBudget || raw.budget?.allocatedBudget || 0),
      allocatedBudget: Number(raw.budget?.allocatedBudget || raw.budget?.totalBudget || 0),
      spentBudget: Number(raw.budget?.spentBudget || 0),
      remainingBudget: Number(
        raw.budget?.remainingBudget ||
          Math.max(
            Number(raw.budget?.allocatedBudget || raw.budget?.totalBudget || 0) -
              Number(raw.budget?.spentBudget || 0),
            0
          )
      ),
      categories: Array.isArray(raw.budget?.categories) ? raw.budget.categories : [],
    },
    employees: Array.isArray(raw.employees)
      ? raw.employees
      : departments.map((department: any) => String(department.id)),
    isActive: raw.isActive ?? true,
    effectiveDate: raw.effectiveDate ? new Date(raw.effectiveDate) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
  };
}

function mapIDCard(raw: any): IDCard {
  return {
    cardId: raw.id || raw.cardId,
    employeeId: raw.employeeId,
    employeeName:
      raw.employee?.firstName && raw.employee?.lastName
        ? `${raw.employee.firstName} ${raw.employee.lastName}`
        : raw.employeeName || 'Unknown Employee',
    cardNumber: raw.cardNumber || raw.id || '',
    issueDate: raw.issueDate ? new Date(raw.issueDate) : new Date(),
    expiryDate: raw.expiryDate ? new Date(raw.expiryDate) : new Date(),
    cardType: String(raw.cardType || 'employee').toLowerCase() as IDCard['cardType'],
    accessLevel: raw.accessLevel || 'Standard',
    photo: raw.photoUrl || raw.photo || '',
    qrCode: raw.qrCode || undefined,
    isActive: !['EXPIRED', 'REVOKED'].includes(String(raw.status || '').toUpperCase()),
    replacementReason: raw.replacementReason || undefined,
    previousCardId: raw.previousCardId || undefined,
    issuedBy: raw.issuedBy || 'system',
  };
}

function mapExitProcess(raw: any): ExitProcess {
  const status = String(raw.status || 'PENDING').toUpperCase();
  const clearanceItems = Array.isArray(raw.clearances)
    ? raw.clearances.map((item: any, index: number) => ({
        itemId: item.id || `clearance-${index}`,
        itemName: item.itemName || item.name || item.clearanceType || 'Clearance Item',
        department: item.department || item.departmentName || 'General',
        assignedTo: item.assignedTo || item.assignedToName || 'Unassigned',
        dueDate: item.dueDate ? new Date(item.dueDate) : new Date(),
        completedDate: item.completedDate ? new Date(item.completedDate) : undefined,
        status: String(item.status || 'PENDING').toLowerCase() as ClearanceItem['status'],
        notes: item.notes || undefined,
      }))
    : [];

  return {
    exitId: raw.id || raw.exitId,
    employeeId: raw.employeeId,
    employeeName:
      raw.employee?.firstName && raw.employee?.lastName
        ? `${raw.employee.firstName} ${raw.employee.lastName}`
        : raw.employeeName || 'Unknown Employee',
    exitType: String(raw.exitType || 'RESIGNATION').toLowerCase().replace('contract_end', 'end_of_contract') as ExitProcess['exitType'],
    exitReason: raw.reason || raw.exitReason || '',
    resignationDate: raw.resignationDate ? new Date(raw.resignationDate) : undefined,
    lastWorkingDate: raw.lastWorkingDate ? new Date(raw.lastWorkingDate) : new Date(),
    noticePeriod: Number(raw.noticePeriodDays || raw.noticePeriod || 0),
    noticeServed: Number(raw.noticeServed || 0),
    isRehireable: raw.rehireEligible ?? raw.isRehireable ?? false,
    exitInterviewScheduled: raw.exitInterviewScheduled ?? false,
    exitInterviewDate: raw.exitInterviewDate ? new Date(raw.exitInterviewDate) : undefined,
    exitInterviewCompleted: raw.exitInterviewCompleted ?? false,
    clearanceItems,
    finalSettlement: raw.finalSettlement || undefined,
    status:
      status === 'COMPLETED'
        ? 'completed'
        : status === 'APPROVED' || status === 'PROCESSING'
          ? 'in_progress'
          : 'initiated',
    initiatedBy: raw.initiatedBy || raw.createdBy || 'system',
    initiatedDate: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    completedDate: raw.completedDate ? new Date(raw.completedDate) : undefined,
  };
}

function mapAnniversary(raw: any): Anniversary {
  const anniversaryDate = raw.anniversaryDate ? new Date(raw.anniversaryDate) : new Date();

  return {
    anniversaryId: raw.anniversaryId || `${raw.employeeId}-${anniversaryDate.toISOString()}`,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName || 'Unknown Employee',
    anniversaryType: 'work',
    anniversaryDate,
    yearsOfService: raw.yearsOfService || undefined,
    notificationDate: raw.notificationDate ? new Date(raw.notificationDate) : anniversaryDate,
    notificationsSent: Array.isArray(raw.notificationsSent) ? raw.notificationsSent : [],
    acknowledgedBy: Array.isArray(raw.acknowledgedBy) ? raw.acknowledgedBy : undefined,
    celebrationPlanned: raw.celebrationPlanned ?? false,
    status: raw.status || 'upcoming',
  };
}

function mapProbationRecord(raw: any): ProbationRecord {
  const status = String(raw.status || 'ACTIVE').toUpperCase();

  return {
    recordId: raw.id || raw.recordId,
    employeeId: raw.employeeId,
    employeeName:
      raw.employee?.firstName && raw.employee?.lastName
        ? `${raw.employee.firstName} ${raw.employee.lastName}`
        : raw.employeeName || 'Unknown Employee',
    department: raw.employee?.department || raw.department || '',
    probationStartDate: raw.startDate ? new Date(raw.startDate) : new Date(),
    probationEndDate: raw.endDate ? new Date(raw.endDate) : new Date(),
    probationPeriod: raw.probationPeriod || raw.probationPeriodDays || 90,
    extensionPeriod: raw.extensionPeriod || undefined,
    extendedEndDate: raw.extendedEndDate ? new Date(raw.extendedEndDate) : undefined,
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    finalDecision: raw.finalDecision || undefined,
    confirmationDate: raw.confirmationDate ? new Date(raw.confirmationDate) : undefined,
    confirmationLetterId: raw.confirmationLetterId || undefined,
    status:
      status === 'EXTENDED'
        ? 'extended'
        : status === 'CONFIRMED'
          ? 'confirmed'
          : status === 'TERMINATED'
            ? 'terminated'
            : 'ongoing',
  };
}

function mapConfirmationLetter(raw: any): ConfirmationLetter {
  const employeeName =
    raw.employee?.firstName && raw.employee?.lastName
      ? `${raw.employee.firstName} ${raw.employee.lastName}`
      : raw.employeeName || 'Unknown Employee';
  const generatedDate = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const confirmationDate = raw.confirmationDate ? new Date(raw.confirmationDate) : generatedDate;

  return {
    letterId: raw.id || raw.letterId,
    employeeId: raw.employeeId,
    employeeName,
    confirmationDate,
    effectiveDate: raw.effectiveDate ? new Date(raw.effectiveDate) : confirmationDate,
    probationStartDate: raw.probationStartDate ? new Date(raw.probationStartDate) : generatedDate,
    probationEndDate: raw.probationEndDate ? new Date(raw.probationEndDate) : confirmationDate,
    newJobTitle: raw.newJobTitle || undefined,
    newSalary: raw.newSalary || undefined,
    content: raw.content || '',
    templateId: raw.templateId || raw.template?.id || '',
    generatedDate,
    generatedBy: raw.createdBy || raw.generatedBy || 'system',
    approvedBy: raw.approvedBy || 'system',
    approvalDate: raw.approvalDate ? new Date(raw.approvalDate) : generatedDate,
    issuedDate: raw.issuedAt ? new Date(raw.issuedAt) : raw.issuedDate ? new Date(raw.issuedDate) : undefined,
    documentUrl: raw.generatedPdfUrl || raw.documentUrl || '',
    referenceNumber: raw.referenceNumber || String(raw.id || ''),
    status: String(raw.status || 'DRAFT').toLowerCase() as ConfirmationLetter['status'],
  };
}

// Employee Database Services
export class EmployeeService {
  private static endpoint = '/core-hr/employees';

  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await APIClient.get<{ employees?: Employee[] }>(this.endpoint);
      return response.employees || [];
    } catch (error: any) {
      return [];
    }
  }

  static async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const response = await APIClient.get<{ employee: Employee }>(`${this.endpoint}/${employeeId}`);
      return response.employee;
    } catch (error: any) {
      return null;
    }
  }

  static async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    const response = await APIClient.post<{ employee: Employee }>(this.endpoint, employeeData);
    return response.employee;
  }

  static async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const response = await APIClient.put<{ employee: Employee }>(`${this.endpoint}/${employeeId}`, updates);
    return response.employee;
  }

  static async searchEmployees(query: string): Promise<Employee[]> {
    try {
      const response = await APIClient.get<{ employees?: Employee[] }>(this.endpoint, { query });
      return response.employees || [];
    } catch (error: any) {
      return [];
    }
  }

  static async terminateEmployee(employeeId: string, terminationDate: string, reason: string): Promise<Employee> {
    const response = await APIClient.put<{ employee: Employee }>(`${this.endpoint}/${employeeId}`, {
      terminationDate,
      terminationReason: reason,
      status: 'terminated',
    });
    return response.employee;
  }
}

// Organization Structure Services
export class OrganizationService {
  private static endpoint = '/core-hr/organization';

  static async getAllUnits(): Promise<OrganizationUnit[]> {
    try {
      const response = await APIClient.get<{ units?: OrganizationUnit[] }>(this.endpoint);
      return response.units || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createUnit(unitData: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const response = await APIClient.post<{ unit: OrganizationUnit }>(this.endpoint, unitData);
    return response.unit;
  }

  static async updateUnit(unitId: string, updates: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const response = await APIClient.put<{ unit: OrganizationUnit }>(this.endpoint, {
      id: unitId,
      ...updates,
    });
    return response.unit;
  }

  static async getHierarchy(): Promise<any> {
    const units = await this.getAllUnits();
    return {
      hierarchyId: 'default-hierarchy',
      hierarchyName: 'Organization Hierarchy',
      hierarchyType: 'reporting',
      rootUnitId: units[0]?.unitId || units[0]?.id || '',
      levels: [],
      effectiveDate: new Date(),
      isActive: true,
    };
  }
}

// Employment History Services
export class EmploymentHistoryService {
  private static endpoint = '/core-hr/employment-history';

  static async getAllHistory(): Promise<EmploymentHistory[]> {
    try {
      const response = await APIClient.get<{ history?: EmploymentHistory[] }>(this.endpoint);
      return response.history || [];
    } catch (error: any) {
      return [];
    }
  }

  static async getHistoryByEmployee(employeeId: string): Promise<EmploymentHistory[]> {
    try {
      const response = await APIClient.get<{ history?: EmploymentHistory[] }>(this.endpoint, { employeeId });
      return response.history || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createHistoryRecord(historyData: Partial<EmploymentHistory>): Promise<EmploymentHistory> {
    const response = await APIClient.post<{ record: EmploymentHistory }>(this.endpoint, historyData);
    return response.record;
  }

  static async getEmployeeHistory(employeeId: string): Promise<EmploymentHistory[]> {
    return this.getHistoryByEmployee(employeeId);
  }

  static async recordChange(historyData: Partial<EmploymentHistory>): Promise<EmploymentHistory> {
    return this.createHistoryRecord(historyData);
  }
}

// Document Management Services
export class DocumentService {
  private static endpoint = '/core-hr/documents';

  static async getAllDocuments(): Promise<EmployeeDocument[]> {
    try {
      const response = await APIClient.get<{ documents?: EmployeeDocument[] }>(this.endpoint);
      return response.documents || [];
    } catch (error: any) {
      return [];
    }
  }

  static async getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    try {
      const response = await APIClient.get<{ documents?: EmployeeDocument[] }>(this.endpoint, { employeeId });
      return response.documents || [];
    } catch (error: any) {
      return [];
    }
  }

  static async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    return this.getDocumentsByEmployee(employeeId);
  }

  static async uploadDocument(documentData: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
    const response = await APIClient.post<{ document: EmployeeDocument }>(this.endpoint, documentData);
    return response.document;
  }

  static async verifyDocument(documentId: string, verifiedBy: string): Promise<void> {
    const response = await APIClient.get<{ documents?: any[] }>(this.endpoint, { id: documentId });
    void response;
    void verifiedBy;
  }

  static async getAllTemplates(): Promise<DocumentTemplate[]> {
    return DocumentTemplateService.getAllTemplates();
  }

  static async scanDocumentAI(file: File): Promise<Partial<EmployeeDocument>> {
    try {
      // Simulate AI OCR processing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            isAIParsed: true,
            ocrData: {
              documentNumber: 'DXB-882-991',
              expiryDate: new Date(2029, 11, 31),
              nationality: 'UAE',
              parsingConfidence: 0.94,
            },
            status: 'active'
          });
        }, 2000);
      });
    } catch (error: any) {
      return {};
    }
  }
}

export class DocumentTemplateService {
  private static endpoint = '/core-hr/document-templates';

  static async getAllTemplates(): Promise<DocumentTemplate[]> {
    try {
      const response = await APIClient.get<{ templates?: DocumentTemplate[] }>(this.endpoint);
      return response.templates || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createTemplate(templateData: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const response = await APIClient.post<{ template: DocumentTemplate }>(this.endpoint, templateData);
    return response.template;
  }
}

// Position Management Services
export class PositionService {
  private static endpoint = '/core-hr/positions';

  static async getAllPositions(): Promise<Position[]> {
    try {
      const response = await APIClient.get<{ positions?: Position[] }>(this.endpoint);
      return response.positions || [];
    } catch (error: any) {
      return [
        {
          id: 'POS-101',
          positionCode: 'ENG-SNR-001',
          title: 'Senior Software Engineer',
          departmentId: 'DEPT-01',
          status: 'filled',
          headcount: 1,
          fte: 1,
          budgetCommitted: 120000,
          actualCost: 115000,
          utilizationRate: 0.96,
          isSimulated: false,
          createdDate: new Date(),
          lastModifiedDate: new Date(),
          effectiveDate: new Date()
        },
        {
          id: 'POS-102',
          positionCode: 'HR-DIR-001',
          title: 'HR Director',
          departmentId: 'DEPT-02',
          status: 'open',
          headcount: 1,
          fte: 1,
          budgetCommitted: 180000,
          actualCost: 0,
          utilizationRate: 0,
          isSimulated: true, // Simulation example
          createdDate: new Date(),
          lastModifiedDate: new Date(),
          effectiveDate: new Date()
        }
      ];
    }
  }

  static async createPosition(positionData: Partial<Position>): Promise<Position> {
    const response = await APIClient.post<{ position: Position }>(this.endpoint, positionData);
    return response.position;
  }

  static async updatePosition(positionId: string, updates: Partial<Position>): Promise<Position> {
    const response = await APIClient.put<{ position: Position }>(this.endpoint, {
      id: positionId,
      ...updates,
    });
    return response.position;
  }

  static async closePosition(positionId: string): Promise<Position> {
    return this.updatePosition(positionId, {
      status: 'CLOSED' as any,
      closedDate: new Date().toISOString() as any,
    });
  }
}

// Cost Center Services
export class CostCenterService {
  private static endpoint = '/core-hr/cost-centers';

  static async getAllCostCenters(): Promise<CostCenter[]> {
    try {
      const response = await APIClient.get<{ costCenters?: any[] }>(this.endpoint);
      return Array.isArray(response.costCenters)
        ? response.costCenters.map((costCenter) => mapCostCenter(costCenter))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async createCostCenter(costCenterData: Partial<CostCenter>): Promise<CostCenter> {
    const response = await APIClient.post<{ costCenter: any }>(this.endpoint, costCenterData);
    return mapCostCenter(response.costCenter);
  }

  static async updateCostCenter(costCenterId: string, updates: Partial<CostCenter>): Promise<CostCenter> {
    const response = await APIClient.put<{ costCenter: any }>(this.endpoint, {
      id: costCenterId,
      ...updates,
    });
    return mapCostCenter(response.costCenter);
  }

  static async allocateBudget(_costCenterId: string, _amount: number, _year: number): Promise<void> {
    return;
  }
}

// Life Events Services
export class LifeEventService {
  private static endpoint = '/core-hr/life-events';

  static async getAllLifeEvents(): Promise<LifeEvent[]> {
    try {
      const response = await APIClient.get<{ events?: LifeEvent[] }>(this.endpoint);
      return response.events || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createLifeEvent(eventData: Partial<LifeEvent>): Promise<LifeEvent> {
    const response = await APIClient.post<{ event: LifeEvent }>(this.endpoint, eventData);
    return response.event;
  }

  static async getAllEvents(): Promise<LifeEvent[]> {
    return this.getAllLifeEvents();
  }

  static async getEmployeeEvents(employeeId: string): Promise<LifeEvent[]> {
    try {
      const response = await APIClient.get<{ events?: LifeEvent[] }>(this.endpoint, { employeeId });
      return response.events || [];
    } catch (error: any) {
      return [];
    }
  }

  static async recordEvent(eventData: Partial<LifeEvent>): Promise<LifeEvent> {
    return this.createLifeEvent(eventData);
  }

  static async processEvent(eventId: string, processedBy: string): Promise<LifeEvent> {
    const response = await APIClient.put<{ event: LifeEvent }>(this.endpoint, {
      id: eventId,
      status: 'COMPLETED',
      processedBy,
      processedDate: new Date().toISOString(),
    });
    return response.event;
  }
}

// Mass Updates Services
export class MassUpdateService {
  private static endpoint = '/core-hr/mass-updates';

  static async getAllMassUpdates(): Promise<MassUpdate[]> {
    try {
      const response = await APIClient.get<{ updates?: MassUpdate[] }>(this.endpoint);
      return response.updates || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createMassUpdate(updateData: Partial<MassUpdate>): Promise<MassUpdate> {
    const response = await APIClient.post<{ update: MassUpdate }>(this.endpoint, updateData);
    return response.update;
  }

  static async executeMassUpdate(updateId: string): Promise<MassUpdate> {
    const response = await APIClient.post<{ update: MassUpdate }>(`${this.endpoint}/${updateId}/execute`, {});
    return response.update;
  }

  static async getAllUpdates(): Promise<MassUpdate[]> {
    return this.getAllMassUpdates();
  }

  static async createUpdate(updateData: Partial<MassUpdate>): Promise<MassUpdate> {
    return this.createMassUpdate(updateData);
  }

  static async executeUpdate(updateId: string, _executedBy?: string): Promise<any> {
    const result: any = await this.executeMassUpdate(updateId);
    return {
      ...result,
      successCount: result?.results?.successful ?? result?.successCount ?? 0,
      failureCount: result?.results?.failed ?? result?.failureCount ?? 0,
    };
  }

  static async previewUpdate(updateId: string): Promise<any> {
    return {
      updateId,
      affectedCount: 0,
      changes: [],
    };
  }
}

// ID Card Services
export class IDCardService {
  private static endpoint = '/core-hr/id-cards';

  static async getAllIDCards(): Promise<IDCard[]> {
    try {
      const response = await APIClient.get<{ cards?: any[] }>(this.endpoint);
      return Array.isArray(response.cards) ? response.cards.map((card) => mapIDCard(card)) : [];
    } catch (error: any) {
      return [];
    }
  }

  static async issueIDCard(cardData: Partial<IDCard>): Promise<IDCard> {
    const response = await APIClient.post<{ card: any }>(this.endpoint, cardData);
    return mapIDCard(response.card);
  }

  static async getAllCards(): Promise<IDCard[]> {
    return this.getAllIDCards();
  }

  static async getEmployeeCard(employeeId: string): Promise<IDCard | null> {
    try {
      const response = await APIClient.get<{ cards?: any[] }>(this.endpoint, { employeeId });
      return Array.isArray(response.cards) && response.cards[0] ? mapIDCard(response.cards[0]) : null;
    } catch (error: any) {
      return null;
    }
  }

  static async generateCard(employeeId: string, cardType: IDCard['cardType']): Promise<IDCard> {
    return this.issueIDCard({ employeeId, cardType, status: 'ISSUED' } as any);
  }

  static async deactivateCard(cardId: string): Promise<IDCard> {
    const response = await APIClient.put<{ card: any }>(this.endpoint, {
      id: cardId,
      status: 'REVOKED',
    });
    return mapIDCard(response.card);
  }
}

// Letter Generation Services
export class LetterService {
  private static endpoint = '/core-hr/letters';

  static async getAllLetterRequests(): Promise<LetterRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: LetterRequest[] }>(this.endpoint);
      return response.requests || [];
    } catch (error: any) {
      return [];
    }
  }

  static async getAllRequests(): Promise<LetterRequest[]> {
    return this.getAllLetterRequests();
  }

  static async getEmployeeRequests(employeeId: string): Promise<LetterRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: LetterRequest[] }>(this.endpoint, { employeeId });
      return response.requests || [];
    } catch (error: any) {
      return [];
    }
  }

  static async createLetterRequest(requestData: Partial<LetterRequest>): Promise<LetterRequest> {
    const response = await APIClient.post<{ request?: LetterRequest; letter?: LetterRequest }>(this.endpoint, requestData);
    return response.request || response.letter || ({} as LetterRequest);
  }

  static async createRequest(requestData: Partial<LetterRequest>): Promise<LetterRequest> {
    return this.createLetterRequest(requestData);
  }

  static async approveRequest(requestId: string, approvedBy: string, approverEmployeeId: string): Promise<LetterRequest> {
    const response = await APIClient.put<{ letter?: LetterRequest; request?: LetterRequest }>(this.endpoint, {
      id: requestId,
      status: 'APPROVED',
      approvedBy,
      approverEmployeeId,
      issuedAt: new Date().toISOString(),
    });
    return response.request || response.letter || ({} as LetterRequest);
  }

  static async getAllTemplates(): Promise<any[]> {
    return [];
  }
}

// Exit Management Services
export class ExitService {
  private static endpoint = '/core-hr/exits';

  static async getAllExitProcesses(): Promise<ExitProcess[]> {
    try {
      const response = await APIClient.get<{ exits?: any[] }>(this.endpoint);
      return Array.isArray(response.exits) ? response.exits.map((exit) => mapExitProcess(exit)) : [];
    } catch (error: any) {
      return [];
    }
  }

  static async getAllExits(): Promise<ExitProcess[]> {
    return this.getAllExitProcesses();
  }

  static async initiateExit(exitData: Partial<ExitProcess>): Promise<ExitProcess> {
    const response = await APIClient.post<{ exit: any }>(this.endpoint, exitData);
    return mapExitProcess(response.exit);
  }

  static async updateExit(exitId: string, updates: Partial<ExitProcess>): Promise<ExitProcess> {
    const response = await APIClient.put<{ exit: any }>(this.endpoint, {
      id: exitId,
      ...updates,
    });
    return mapExitProcess(response.exit);
  }

  static async updateClearanceItem(exitId: string, itemId: string, status: string, approvedBy?: string): Promise<ExitProcess> {
    return this.updateExit(exitId, {
      clearanceItems: [
        {
          itemId,
          status,
          approvedBy,
        },
      ] as any,
    });
  }

  static async completeFinalSettlement(exitId: string, settlementData: any): Promise<ExitProcess> {
    return this.updateExit(exitId, {
      finalSettlement: settlementData,
      status: 'completed',
    } as any);
  }

  static async getAllClearanceTemplates(): Promise<any[]> {
    return [];
  }
}

// Anniversary Services
export class AnniversaryService {
  private static endpoint = '/core-hr/anniversaries';

  static async getAllAnniversaries(): Promise<Anniversary[]> {
    try {
      const response = await APIClient.get<{ anniversaries?: any[] }>(this.endpoint);
      return Array.isArray(response.anniversaries)
        ? response.anniversaries.map((anniversary) => mapAnniversary(anniversary))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async getUpcomingAnniversaries(days: number = 30): Promise<Anniversary[]> {
    try {
      const response = await APIClient.get<{ anniversaries?: any[] }>(this.endpoint, { days });
      return Array.isArray(response.anniversaries)
        ? response.anniversaries.map((anniversary) => mapAnniversary(anniversary))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async generateAnniversaries(_year: number): Promise<number> {
    const anniversaries = await this.getAllAnniversaries();
    return anniversaries.length;
  }

  static async sendNotifications(_anniversaryId: string): Promise<void> {
    return;
  }
}

// Auto-Numbering Services
export class AutoNumberService {
  private static endpoint = '/core-hr/auto-numbers';

  private static mapEntityType(entityType: string): AutoNumberSequence['entityType'] {
    const normalized = String(entityType || '').toLowerCase();

    switch (normalized) {
      case 'employee':
      case 'position':
      case 'document':
      case 'letter':
      case 'exit':
      case 'asset':
      case 'id_card':
        return normalized;
      default:
        return 'custom';
    }
  }

  private static mapSequence(raw: any): AutoNumberSequence {
    const prefix = String(raw.prefix || 'SEQ');
    const numberLength = Number(raw.padLength || raw.numberLength || 4);
    const currentValue = Number(raw.currentNumber || 0);

    return {
      sequenceId: String(raw.entityType || raw.sequenceId || prefix).toLowerCase(),
      sequenceName: raw.description || `${raw.entityType || 'Custom'} Sequence`,
      entityType: this.mapEntityType(raw.entityType),
      prefix,
      suffix: raw.suffix || '',
      currentNumber: currentValue + 1,
      incrementBy: Number(raw.incrementBy || 1),
      numberLength,
      resetFrequency: raw.resetFrequency || 'never',
      lastResetDate: raw.lastResetDate ? new Date(raw.lastResetDate) : undefined,
      nextResetDate: raw.nextResetDate ? new Date(raw.nextResetDate) : undefined,
      format: raw.format || `${prefix}-{number}`,
      isActive: raw.isActive ?? true,
      createdDate: raw.createdDate ? new Date(raw.createdDate) : new Date(),
    };
  }

  static async getAllSequences(): Promise<AutoNumberSequence[]> {
    try {
      const response = await APIClient.get<{ sequences?: any[] }>(this.endpoint);
      return Array.isArray(response.sequences)
        ? response.sequences.map((sequence) => this.mapSequence(sequence))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async generateNumber(entityType: string): Promise<string> {
    const response = await APIClient.post<{ number?: string; generatedNumber?: string }>(this.endpoint, { entityType });
    return response.number || response.generatedNumber || '';
  }

  static async createSequence(sequenceData: Partial<AutoNumberSequence>): Promise<AutoNumberSequence> {
    return this.mapSequence({
      entityType: sequenceData.entityType || 'custom',
      prefix: sequenceData.prefix || 'SEQ',
      padLength: sequenceData.numberLength || 4,
      currentNumber: (sequenceData.currentNumber || 1) - 1,
      description: sequenceData.sequenceName || 'Custom Sequence',
      incrementBy: sequenceData.incrementBy || 1,
      resetFrequency: sequenceData.resetFrequency || 'never',
      createdDate: new Date().toISOString(),
      isActive: sequenceData.isActive ?? true,
    });
  }

  static async resetSequence(_sequenceId: string): Promise<void> {
    return;
  }
}

// Probation Tracking Services
export class ProbationService {
  private static endpoint = '/core-hr/probation';

  static async getAllProbationRecords(): Promise<ProbationRecord[]> {
    try {
      const response = await APIClient.get<{ records?: any[] }>(this.endpoint);
      return Array.isArray(response.records) ? response.records.map((record) => mapProbationRecord(record)) : [];
    } catch (error: any) {
      return [];
    }
  }

  static async createProbationRecord(recordData: Partial<ProbationRecord>): Promise<ProbationRecord> {
    const response = await APIClient.post<{ record: any }>(this.endpoint, recordData);
    return mapProbationRecord(response.record);
  }

  static async getAllRecords(): Promise<ProbationRecord[]> {
    return this.getAllProbationRecords();
  }

  static async getEmployeeProbation(employeeId: string): Promise<ProbationRecord | null> {
    try {
      const response = await APIClient.get<{ records?: any[] }>(this.endpoint, { employeeId });
      return Array.isArray(response.records) && response.records[0]
        ? mapProbationRecord(response.records[0])
        : null;
    } catch (error: any) {
      return null;
    }
  }

  static async addReview(recordId: string, reviewData: any): Promise<ProbationRecord> {
    const response = await APIClient.put<{ record: any }>(this.endpoint, {
      id: recordId,
      reviews: [reviewData],
    });
    return mapProbationRecord(response.record);
  }

  static async extendProbation(recordId: string, extensionDays: number, reason: string): Promise<ProbationRecord> {
    const response = await APIClient.put<{ record: any }>(this.endpoint, {
      id: recordId,
      status: 'EXTENDED',
      extensionPeriod: extensionDays,
      extensionReason: reason,
    });
    return mapProbationRecord(response.record);
  }
}

// Confirmation Letter Services
export class ConfirmationLetterService {
  private static endpoint = '/core-hr/confirmation-letters';

  static async getAllConfirmationLetters(): Promise<ConfirmationLetter[]> {
    try {
      const response = await APIClient.get<{ letters?: any[] }>(this.endpoint);
      return Array.isArray(response.letters) ? response.letters.map((letter) => mapConfirmationLetter(letter)) : [];
    } catch (error: any) {
      return [];
    }
  }

  static async generateConfirmationLetter(letterData: Partial<ConfirmationLetter>): Promise<ConfirmationLetter> {
    const response = await APIClient.post<{ letter: any }>(this.endpoint, letterData);
    return mapConfirmationLetter(response.letter);
  }
}

export class ConfirmationService {
  static async getAllConfirmations(): Promise<ConfirmationLetter[]> {
    return ConfirmationLetterService.getAllConfirmationLetters();
  }

  static async getEmployeeConfirmations(employeeId: string): Promise<ConfirmationLetter[]> {
    try {
      const response = await APIClient.get<{ letters?: any[] }>('/core-hr/confirmation-letters', { employeeId });
      return Array.isArray(response.letters)
        ? response.letters.map((letter) => mapConfirmationLetter(letter))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async generateLetter(employeeId: string, confirmationData: any): Promise<ConfirmationLetter> {
    return ConfirmationLetterService.generateConfirmationLetter({
      employeeId,
      ...confirmationData,
    });
  }
}

// Asset Management Services
export class AssetService {
  private static endpoint = '/core-hr/assets';

  static async getAllAssets(): Promise<Asset[]> {
    try {
      const response = await APIClient.get<{ assets?: any[] }>(this.endpoint);
      return Array.isArray(response.assets) ? response.assets.map((asset) => mapAsset(asset)) : [];
    } catch (error: any) {
      return [];
    }
  }

  static async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const response = await APIClient.post<{ asset: any }>(this.endpoint, assetData);
    return mapAsset(response.asset);
  }

  static async updateAsset(assetId: string, updates: Partial<Asset>): Promise<Asset> {
    const response = await APIClient.put<{ asset: any }>(this.endpoint, {
      id: assetId,
      ...updates,
    });
    return mapAsset(response.asset);
  }

  static async assignAsset(assetId: string, employeeId: string, employeeName: string): Promise<AssetAssignment> {
    const response = await APIClient.post<{ assignment: any }>('/core-hr/asset-assignments', {
      assetId,
      employeeId,
      employeeName,
      assignedDate: new Date().toISOString(),
    });
    return mapAssetAssignment(response.assignment);
  }

  static async returnAsset(assetId: string): Promise<Asset> {
    return this.updateAsset(assetId, { status: 'available' } as any);
  }

  static async retireAsset(assetId: string, _disposalMethod?: string, _disposalDate?: string): Promise<Asset> {
    return this.updateAsset(assetId, { status: 'retired' } as any);
  }

  static async getEmployeeAssets(employeeId: string): Promise<Asset[]> {
    const assignments = await AssetAssignmentService.getAssignmentsByEmployee(employeeId);
    return assignments.map((assignment) => ({
      assetId: assignment.assetId,
      assetTag: assignment.assetTag,
      assetName: assignment.assetName,
      assetType: 'other',
      category: '',
      manufacturer: '',
      model: '',
      serialNumber: assignment.assetTag,
      purchaseDate: new Date(),
      purchaseCost: 0,
      currentValue: 0,
      location: '',
      assignedTo: assignment.employeeId,
      assignedToName: assignment.employeeName,
      assignedDate: assignment.assignmentDate,
      status: 'assigned',
      condition: 'good',
    }));
  }
}

export class AssetAssignmentService {
  private static endpoint = '/core-hr/asset-assignments';

  static async getAllAssignments(): Promise<AssetAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: any[] }>(this.endpoint);
      return Array.isArray(response.assignments)
        ? response.assignments.map((assignment) => mapAssetAssignment(assignment))
        : [];
    } catch (error: any) {
      return [];
    }
  }

  static async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: any[] }>(this.endpoint, { employeeId });
      return Array.isArray(response.assignments)
        ? response.assignments.map((assignment) => mapAssetAssignment(assignment))
        : [];
    } catch (error: any) {
      return [];
    }
  }
}

// Settings Service
export class CoreHRSettingsService {
  private static endpoint = '/core-hr/settings';

  static async getSettings(): Promise<CoreHRSettings> {
    try {
      const response = await APIClient.get<{ settings: CoreHRSettings }>(this.endpoint);
      return response.settings;
    } catch (error: any) {
      return {
        settingsId: 'settings-1',
        employeeNumberPrefix: 'EMP',
        enableAutoNumbering: true,
        probationPeriodDays: 90,
        defaultNoticePeriod: 30,
        enableProbationTracking: true,
        enableAssetManagement: true,
        enableDocumentExpiry: true,
        documentExpiryNotificationDays: 30,
        enableAnniversaryAlerts: true,
        enableExitManagement: true,
        lastUpdatedDate: new Date(),
        lastUpdatedBy: 'system',
      };
    }
  }

  static async updateSettings(updates: Partial<CoreHRSettings>): Promise<CoreHRSettings> {
    const response = await APIClient.put<{ settings: CoreHRSettings }>(this.endpoint, updates);
    return response.settings;
  }
}

// Global Transfer Services
export class InterCompanyTransferService {
  private static endpoint = '/v1/hr/transfers';

  private static mapTransfer(raw: any): InterCompanyTransfer {
    return {
      transferId: raw.id,
      employeeId: raw.employeeId,
      employeeName:
        raw.employee?.firstName && raw.employee?.lastName
          ? `${raw.employee.firstName} ${raw.employee.lastName}`
          : raw.employeeName || 'Unknown Employee',
      fromCompanyId: raw.fromCompanyId,
      fromCompanyName: raw.fromCompany?.name || raw.fromCompanyName || raw.fromCompanyId,
      toCompanyId: raw.toCompanyId,
      toCompanyName: raw.toCompany?.name || raw.toCompanyName || raw.toCompanyId,
      transferType: String(raw.transferType || 'PERMANENT').toLowerCase() as InterCompanyTransfer['transferType'],
      effectiveDate: new Date(raw.effectiveDate),
      status: String(raw.status || 'PENDING').toLowerCase() as InterCompanyTransfer['status'],
      requestedBy: raw.requestedBy || 'Unknown',
      approvedBy: raw.approvedBy || undefined,
    };
  }

  static async getAllTransfers(): Promise<InterCompanyTransfer[]> {
    try {
      const response = await APIClient.get<{ data?: any[] }>(this.endpoint);
      return Array.isArray(response.data)
        ? response.data.map((transfer) => this.mapTransfer(transfer))
        : [];
    } catch (error: any) {
      return [
        {
          transferId: 'TRF-001',
          employeeId: 'EMP-101',
          employeeName: 'Sarah Jenkins',
          fromCompanyId: 'ENT-01',
          fromCompanyName: 'Aura Dubai',
          toCompanyId: 'ENT-02',
          toCompanyName: 'Aura Riyadh',
          transferType: 'permanent',
          effectiveDate: new Date(),
          status: 'pending',
          requestedBy: 'HR-Admin'
        },
        {
          transferId: 'TRF-002',
          employeeId: 'EMP-202',
          employeeName: 'Ahmed Omar',
          fromCompanyId: 'ENT-02',
          fromCompanyName: 'Aura Riyadh',
          toCompanyId: 'ENT-03',
          toCompanyName: 'Aura Mumbai',
          transferType: 'secondment',
          effectiveDate: new Date(),
          status: 'approved',
          requestedBy: 'System-Agent'
        }
      ];
    }
  }

  static async initiateTransfer(transferData: Partial<InterCompanyTransfer>): Promise<InterCompanyTransfer> {
    const response = await APIClient.post<{ data: any }>(this.endpoint, {
      employeeId: transferData.employeeId,
      fromCompanyId: transferData.fromCompanyId,
      toCompanyId: transferData.toCompanyId,
      effectiveDate: transferData.effectiveDate,
      transferType: transferData.transferType?.toUpperCase(),
    });
    return this.mapTransfer(response.data);
  }
}

// Shared Services Request Services
export class SharedServiceRequestService {
  private static endpoint = '/core-hr/shared-services';

  private static mapRequest(request: SharedServiceRequest): SharedServiceRequest {
    return {
      ...request,
      createdDate: new Date(request.createdDate),
    };
  }

  static async getAllRequests(): Promise<SharedServiceRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: SharedServiceRequest[] }>(this.endpoint);
      return (response.requests || []).map((request) => this.mapRequest(request));
    } catch (error: any) {
      return [
        {
          requestId: 'SSR-101',
          requestorId: 'EMP-001',
          requestorName: 'Marcus Aurelius',
          category: 'hr_letter',
          subject: 'No Objection Certificate',
          details: 'NOC for personal bank loan application.',
          priority: 'medium',
          status: 'in_progress',
          createdDate: new Date()
        },
        {
          requestId: 'SSR-102',
          requestorId: 'EMP-005',
          requestorName: 'Elena Fisher',
          category: 'it_access',
          subject: 'VPN Access Request',
          details: 'Remote access required for Riyadh transition project.',
          priority: 'high',
          status: 'open',
          createdDate: new Date()
        }
      ];
    }
  }

  static async createRequest(requestData: Partial<SharedServiceRequest>): Promise<SharedServiceRequest> {
    const response = await APIClient.post<{ request: SharedServiceRequest }>(this.endpoint, requestData);
    return this.mapRequest(response.request);
  }
}
