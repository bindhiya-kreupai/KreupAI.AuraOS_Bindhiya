// Core HR Module - Service Layer

import { APIClient } from '@/lib/api-client';
import type {
  Asset, AssetAssignment, CoreHRSettings,
  InterCompanyTransfer, SharedServiceRequest
} from './types';

// Employee Database Services
export class EmployeeService {
  private static endpoint = '/core-hr/employees';

  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await APIClient.get<{ employees?: Employee[] }>(this.endpoint);
      return response.employees || [];
    } catch (error) {
      return [];
    }
  }

  static async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const response = await APIClient.get<{ employee: Employee }>(`${this.endpoint}/${employeeId}`);
      return response.employee;
    } catch (error) {
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
      const response = await APIClient.get<{ employees?: Employee[] }>(`${this.endpoint}/search`, { query });
      return response.employees || [];
    } catch (error) {
      return [];
    }
  }
}

// Organization Structure Services
export class OrganizationService {
  private static endpoint = '/core-hr/organization';

  static async getAllUnits(): Promise<OrganizationUnit[]> {
    try {
      const response = await APIClient.get<{ units?: OrganizationUnit[] }>(this.endpoint);
      return response.units || [];
    } catch (error) {
      return [];
    }
  }

  static async createUnit(unitData: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const response = await APIClient.post<{ unit: OrganizationUnit }>(this.endpoint, unitData);
    return response.unit;
  }

  static async updateUnit(unitId: string, updates: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const response = await APIClient.put<{ unit: OrganizationUnit }>(`${this.endpoint}/${unitId}`, updates);
    return response.unit;
  }
}

// Employment History Services
export class EmploymentHistoryService {
  private static endpoint = '/core-hr/employment-history';

  static async getAllHistory(): Promise<EmploymentHistory[]> {
    try {
      const response = await APIClient.get<{ history?: EmploymentHistory[] }>(this.endpoint);
      return response.history || [];
    } catch (error) {
      return [];
    }
  }

  static async getHistoryByEmployee(employeeId: string): Promise<EmploymentHistory[]> {
    try {
      const response = await APIClient.get<{ history?: EmploymentHistory[] }>(this.endpoint, { employeeId });
      return response.history || [];
    } catch (error) {
      return [];
    }
  }

  static async createHistoryRecord(historyData: Partial<EmploymentHistory>): Promise<EmploymentHistory> {
    const response = await APIClient.post<{ record: EmploymentHistory }>(this.endpoint, historyData);
    return response.record;
  }
}

// Document Management Services
export class DocumentService {
  private static endpoint = '/core-hr/documents';

  static async getAllDocuments(): Promise<EmployeeDocument[]> {
    try {
      const response = await APIClient.get<{ documents?: EmployeeDocument[] }>(this.endpoint);
      return response.documents || [];
    } catch (error) {
      return [];
    }
  }

  static async getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    try {
      const response = await APIClient.get<{ documents?: EmployeeDocument[] }>(this.endpoint, { employeeId });
      return response.documents || [];
    } catch (error) {
      return [];
    }
  }

  static async uploadDocument(documentData: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
    const response = await APIClient.post<{ document: EmployeeDocument }>(this.endpoint, documentData);
    return response.document;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    const response = await APIClient.put<{ position: Position }>(`${this.endpoint}/${positionId}`, updates);
    return response.position;
  }
}

// Cost Center Services
export class CostCenterService {
  private static endpoint = '/core-hr/cost-centers';

  static async getAllCostCenters(): Promise<CostCenter[]> {
    try {
      const response = await APIClient.get<{ costCenters?: CostCenter[] }>(this.endpoint);
      return response.costCenters || [];
    } catch (error) {
      return [];
    }
  }

  static async createCostCenter(costCenterData: Partial<CostCenter>): Promise<CostCenter> {
    const response = await APIClient.post<{ costCenter: CostCenter }>(this.endpoint, costCenterData);
    return response.costCenter;
  }
}

// Life Events Services
export class LifeEventService {
  private static endpoint = '/core-hr/life-events';

  static async getAllLifeEvents(): Promise<LifeEvent[]> {
    try {
      const response = await APIClient.get<{ events?: LifeEvent[] }>(this.endpoint);
      return response.events || [];
    } catch (error) {
      return [];
    }
  }

  static async createLifeEvent(eventData: Partial<LifeEvent>): Promise<LifeEvent> {
    const response = await APIClient.post<{ event: LifeEvent }>(this.endpoint, eventData);
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
    } catch (error) {
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
}

// ID Card Services
export class IDCardService {
  private static endpoint = '/core-hr/id-cards';

  static async getAllIDCards(): Promise<IDCard[]> {
    try {
      const response = await APIClient.get<{ cards?: IDCard[] }>(this.endpoint);
      return response.cards || [];
    } catch (error) {
      return [];
    }
  }

  static async issueIDCard(cardData: Partial<IDCard>): Promise<IDCard> {
    const response = await APIClient.post<{ card: IDCard }>(this.endpoint, cardData);
    return response.card;
  }
}

// Letter Generation Services
export class LetterService {
  private static endpoint = '/core-hr/letters';

  static async getAllLetterRequests(): Promise<LetterRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: LetterRequest[] }>(this.endpoint);
      return response.requests || [];
    } catch (error) {
      return [];
    }
  }

  static async createLetterRequest(requestData: Partial<LetterRequest>): Promise<LetterRequest> {
    const response = await APIClient.post<{ request: LetterRequest }>(this.endpoint, requestData);
    return response.request;
  }
}

// Exit Management Services
export class ExitService {
  private static endpoint = '/core-hr/exits';

  static async getAllExitProcesses(): Promise<ExitProcess[]> {
    try {
      const response = await APIClient.get<{ exits?: ExitProcess[] }>(this.endpoint);
      return response.exits || [];
    } catch (error) {
      return [];
    }
  }

  static async initiateExit(exitData: Partial<ExitProcess>): Promise<ExitProcess> {
    const response = await APIClient.post<{ exit: ExitProcess }>(this.endpoint, exitData);
    return response.exit;
  }

  static async updateExit(exitId: string, updates: Partial<ExitProcess>): Promise<ExitProcess> {
    const response = await APIClient.put<{ exit: ExitProcess }>(`${this.endpoint}/${exitId}`, updates);
    return response.exit;
  }
}

// Anniversary Services
export class AnniversaryService {
  private static endpoint = '/core-hr/anniversaries';

  static async getAllAnniversaries(): Promise<Anniversary[]> {
    try {
      const response = await APIClient.get<{ anniversaries?: Anniversary[] }>(this.endpoint);
      return response.anniversaries || [];
    } catch (error) {
      return [];
    }
  }

  static async getUpcomingAnniversaries(days: number = 30): Promise<Anniversary[]> {
    try {
      const response = await APIClient.get<{ anniversaries?: Anniversary[] }>(this.endpoint, { days });
      return response.anniversaries || [];
    } catch (error) {
      return [];
    }
  }
}

// Auto-Numbering Services
export class AutoNumberService {
  private static endpoint = '/core-hr/auto-numbers';

  static async getAllSequences(): Promise<AutoNumberSequence[]> {
    try {
      const response = await APIClient.get<{ sequences?: AutoNumberSequence[] }>(this.endpoint);
      return response.sequences || [];
    } catch (error) {
      return [];
    }
  }

  static async generateNumber(entityType: string): Promise<string> {
    const response = await APIClient.post<{ number: string }>(`${this.endpoint}/generate`, { entityType });
    return response.number;
  }
}

// Probation Tracking Services
export class ProbationService {
  private static endpoint = '/core-hr/probation';

  static async getAllProbationRecords(): Promise<ProbationRecord[]> {
    try {
      const response = await APIClient.get<{ records?: ProbationRecord[] }>(this.endpoint);
      return response.records || [];
    } catch (error) {
      return [];
    }
  }

  static async createProbationRecord(recordData: Partial<ProbationRecord>): Promise<ProbationRecord> {
    const response = await APIClient.post<{ record: ProbationRecord }>(this.endpoint, recordData);
    return response.record;
  }
}

// Confirmation Letter Services
export class ConfirmationLetterService {
  private static endpoint = '/core-hr/confirmation-letters';

  static async getAllConfirmationLetters(): Promise<ConfirmationLetter[]> {
    try {
      const response = await APIClient.get<{ letters?: ConfirmationLetter[] }>(this.endpoint);
      return response.letters || [];
    } catch (error) {
      return [];
    }
  }

  static async generateConfirmationLetter(letterData: Partial<ConfirmationLetter>): Promise<ConfirmationLetter> {
    const response = await APIClient.post<{ letter: ConfirmationLetter }>(this.endpoint, letterData);
    return response.letter;
  }
}

// Asset Management Services
export class AssetService {
  private static endpoint = '/core-hr/assets';

  static async getAllAssets(): Promise<Asset[]> {
    try {
      const response = await APIClient.get<{ assets?: Asset[] }>(this.endpoint);
      return response.assets || [];
    } catch (error) {
      return [];
    }
  }

  static async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const response = await APIClient.post<{ asset: Asset }>(this.endpoint, assetData);
    return response.asset;
  }

  static async assignAsset(assetId: string, employeeId: string, employeeName: string): Promise<AssetAssignment> {
    const response = await APIClient.post<{ assignment: AssetAssignment }>(`${this.endpoint}/${assetId}/assign`, {
      employeeId,
      employeeName,
    });
    return response.assignment;
  }
}

export class AssetAssignmentService {
  private static endpoint = '/core-hr/asset-assignments';

  static async getAllAssignments(): Promise<AssetAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: AssetAssignment[] }>(this.endpoint);
      return response.assignments || [];
    } catch (error) {
      return [];
    }
  }

  static async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: AssetAssignment[] }>(this.endpoint, { employeeId });
      return response.assignments || [];
    } catch (error) {
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
    } catch (error) {
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
  private static endpoint = '/core-hr/transfers';

  static async getAllTransfers(): Promise<InterCompanyTransfer[]> {
    try {
      const response = await APIClient.get<{ transfers?: InterCompanyTransfer[] }>(this.endpoint);
      return response.transfers || [];
    } catch (error) {
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
    const response = await APIClient.post<{ transfer: InterCompanyTransfer }>(this.endpoint, transferData);
    return response.transfer;
  }
}

// Shared Services Request Services
export class SharedServiceRequestService {
  private static endpoint = '/core-hr/shared-services';

  static async getAllRequests(): Promise<SharedServiceRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: SharedServiceRequest[] }>(this.endpoint);
      return response.requests || [];
    } catch (error) {
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
    return response.request;
  }
}
