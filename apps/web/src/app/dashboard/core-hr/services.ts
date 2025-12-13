// Core HR Module - Service Layer

import {
  Employee, OrganizationUnit, EmploymentHistory, EmployeeDocument, DocumentTemplate,
  Position, CostCenter, LifeEvent, MassUpdate, IDCard, LetterRequest,
  ExitProcess, Anniversary, AutoNumberSequence, ProbationRecord, ConfirmationLetter,
  Asset, AssetAssignment, CoreHRSettings
} from './types';

const STORAGE_KEYS = {
  EMPLOYEES: 'core_hr_employees',
  ORG_UNITS: 'core_hr_org_units',
  EMPLOYMENT_HISTORY: 'core_hr_employment_history',
  DOCUMENTS: 'core_hr_documents',
  DOCUMENT_TEMPLATES: 'core_hr_document_templates',
  POSITIONS: 'core_hr_positions',
  COST_CENTERS: 'core_hr_cost_centers',
  LIFE_EVENTS: 'core_hr_life_events',
  MASS_UPDATES: 'core_hr_mass_updates',
  ID_CARDS: 'core_hr_id_cards',
  LETTER_REQUESTS: 'core_hr_letter_requests',
  EXIT_PROCESSES: 'core_hr_exit_processes',
  ANNIVERSARIES: 'core_hr_anniversaries',
  AUTO_NUMBER_SEQUENCES: 'core_hr_auto_number_sequences',
  PROBATION_RECORDS: 'core_hr_probation_records',
  CONFIRMATION_LETTERS: 'core_hr_confirmation_letters',
  ASSETS: 'core_hr_assets',
  ASSET_ASSIGNMENTS: 'core_hr_asset_assignments',
  SETTINGS: 'core_hr_settings',
};

// Employee Database Services
export class EmployeeService {
  static async getAllEmployees(): Promise<Employee[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  }

  static async getEmployeeById(employeeId: string): Promise<Employee | null> {
    const employees = await this.getAllEmployees();
    return employees.find(e => e.employeeId === employeeId) || null;
  }

  static async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    const employees = await this.getAllEmployees();
    const newEmployee: Employee = {
      employeeId: `emp-${Date.now()}`,
      employeeNumber: await AutoNumberService.generateNumber('employee'),
      personalInfo: employeeData.personalInfo as any,
      employmentInfo: employeeData.employmentInfo as any,
      contactInfo: employeeData.contactInfo as any,
      emergencyContacts: employeeData.emergencyContacts || [],
      status: 'active',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      lastModifiedBy: 'current-user',
      ...employeeData,
    };

    employees.push(newEmployee);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    return newEmployee;
  }

  static async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const employees = await this.getAllEmployees();
    const index = employees.findIndex(e => e.employeeId === employeeId);
    if (index === -1) throw new Error('Employee not found');

    employees[index] = { ...employees[index], ...updates, lastModifiedDate: new Date(), lastModifiedBy: 'current-user' };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    return employees[index];
  }

  static async searchEmployees(query: string): Promise<Employee[]> {
    const employees = await this.getAllEmployees();
    return employees.filter(e =>
      e.personalInfo.firstName.toLowerCase().includes(query.toLowerCase()) ||
      e.personalInfo.lastName.toLowerCase().includes(query.toLowerCase()) ||
      e.employeeNumber.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Organization Structure Services
export class OrganizationService {
  static async getAllUnits(): Promise<OrganizationUnit[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ORG_UNITS);
    return data ? JSON.parse(data) : [];
  }

  static async createUnit(unitData: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const units = await this.getAllUnits();
    const newUnit: OrganizationUnit = {
      unitId: `unit-${Date.now()}`,
      unitCode: unitData.unitCode || '',
      unitName: unitData.unitName || '',
      unitType: unitData.unitType || 'department',
      level: unitData.level || 1,
      employeeCount: 0,
      isActive: true,
      effectiveDate: new Date(),
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      ...unitData,
    };

    units.push(newUnit);
    localStorage.setItem(STORAGE_KEYS.ORG_UNITS, JSON.stringify(units));
    return newUnit;
  }

  static async updateUnit(unitId: string, updates: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
    const units = await this.getAllUnits();
    const index = units.findIndex(u => u.unitId === unitId);
    if (index === -1) throw new Error('Organization unit not found');

    units[index] = { ...units[index], ...updates, lastModifiedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.ORG_UNITS, JSON.stringify(units));
    return units[index];
  }
}

// Employment History Services
export class EmploymentHistoryService {
  static async getAllHistory(): Promise<EmploymentHistory[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYMENT_HISTORY);
    return data ? JSON.parse(data) : [];
  }

  static async getHistoryByEmployee(employeeId: string): Promise<EmploymentHistory[]> {
    const history = await this.getAllHistory();
    return history.filter(h => h.employeeId === employeeId);
  }

  static async createHistoryRecord(historyData: Partial<EmploymentHistory>): Promise<EmploymentHistory> {
    const history = await this.getAllHistory();
    const newRecord: EmploymentHistory = {
      historyId: `hist-${Date.now()}`,
      employeeId: historyData.employeeId || '',
      employeeName: historyData.employeeName || '',
      changeType: historyData.changeType || 'hire',
      effectiveDate: historyData.effectiveDate || new Date(),
      newValues: historyData.newValues || {},
      createdDate: new Date(),
      createdBy: 'current-user',
      ...historyData,
    };

    history.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.EMPLOYMENT_HISTORY, JSON.stringify(history));
    return newRecord;
  }
}

// Document Management Services
export class DocumentService {
  static async getAllDocuments(): Promise<EmployeeDocument[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    const documents = await this.getAllDocuments();
    return documents.filter(d => d.employeeId === employeeId);
  }

  static async uploadDocument(documentData: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
    const documents = await this.getAllDocuments();
    const newDocument: EmployeeDocument = {
      documentId: `doc-${Date.now()}`,
      employeeId: documentData.employeeId || '',
      employeeName: documentData.employeeName || '',
      documentType: documentData.documentType || 'other',
      documentName: documentData.documentName || '',
      fileName: documentData.fileName || '',
      fileSize: documentData.fileSize || 0,
      fileUrl: documentData.fileUrl || '',
      uploadedBy: 'current-user',
      uploadedDate: new Date(),
      isConfidential: documentData.isConfidential || false,
      accessLevel: documentData.accessLevel || 'internal',
      allowedRoles: documentData.allowedRoles || [],
      tags: documentData.tags || [],
      version: 1,
      status: 'active',
      ...documentData,
    };

    documents.push(newDocument);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    return newDocument;
  }
}

export class DocumentTemplateService {
  static async getAllTemplates(): Promise<DocumentTemplate[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_TEMPLATES);
    return data ? JSON.parse(data) : [];
  }

  static async createTemplate(templateData: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const templates = await this.getAllTemplates();
    const newTemplate: DocumentTemplate = {
      templateId: `template-${Date.now()}`,
      templateName: templateData.templateName || 'New Template',
      templateType: templateData.templateType || 'custom',
      content: templateData.content || '',
      variables: templateData.variables || [],
      isActive: true,
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      ...templateData,
    };

    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_TEMPLATES, JSON.stringify(templates));
    return newTemplate;
  }
}

// Position Management Services
export class PositionService {
  static async getAllPositions(): Promise<Position[]> {
    const data = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createPosition(positionData: Partial<Position>): Promise<Position> {
    const positions = await this.getAllPositions();
    const newPosition: Position = {
      positionId: `pos-${Date.now()}`,
      positionCode: positionData.positionCode || '',
      positionTitle: positionData.positionTitle || '',
      department: positionData.department || '',
      jobFamily: positionData.jobFamily || '',
      jobLevel: positionData.jobLevel || '',
      gradeLevel: positionData.gradeLevel || '',
      location: positionData.location || '',
      employmentType: positionData.employmentType || 'full_time',
      isHeadcount: positionData.isHeadcount ?? true,
      salaryRange: positionData.salaryRange as any,
      description: positionData.description || '',
      responsibilities: positionData.responsibilities || [],
      qualifications: positionData.qualifications || [],
      requiredSkills: positionData.requiredSkills || [],
      preferredSkills: positionData.preferredSkills || [],
      positionStatus: 'open',
      effectiveDate: new Date(),
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      ...positionData,
    };

    positions.push(newPosition);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    return newPosition;
  }

  static async updatePosition(positionId: string, updates: Partial<Position>): Promise<Position> {
    const positions = await this.getAllPositions();
    const index = positions.findIndex(p => p.positionId === positionId);
    if (index === -1) throw new Error('Position not found');

    positions[index] = { ...positions[index], ...updates, lastModifiedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    return positions[index];
  }
}

// Cost Center Services
export class CostCenterService {
  static async getAllCostCenters(): Promise<CostCenter[]> {
    const data = localStorage.getItem(STORAGE_KEYS.COST_CENTERS);
    return data ? JSON.parse(data) : [];
  }

  static async createCostCenter(costCenterData: Partial<CostCenter>): Promise<CostCenter> {
    const costCenters = await this.getAllCostCenters();
    const newCostCenter: CostCenter = {
      costCenterId: `cc-${Date.now()}`,
      costCenterCode: costCenterData.costCenterCode || '',
      costCenterName: costCenterData.costCenterName || '',
      description: costCenterData.description || '',
      department: costCenterData.department || '',
      fiscalYear: costCenterData.fiscalYear || new Date().getFullYear(),
      budget: costCenterData.budget as any,
      employees: costCenterData.employees || [],
      isActive: true,
      effectiveDate: new Date(),
      ...costCenterData,
    };

    costCenters.push(newCostCenter);
    localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(costCenters));
    return newCostCenter;
  }
}

// Life Events Services
export class LifeEventService {
  static async getAllLifeEvents(): Promise<LifeEvent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LIFE_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createLifeEvent(eventData: Partial<LifeEvent>): Promise<LifeEvent> {
    const events = await this.getAllLifeEvents();
    const newEvent: LifeEvent = {
      eventId: `event-${Date.now()}`,
      employeeId: eventData.employeeId || '',
      employeeName: eventData.employeeName || '',
      eventType: eventData.eventType || 'other',
      eventDate: eventData.eventDate || new Date(),
      description: eventData.description || '',
      requiredActions: eventData.requiredActions || [],
      supportingDocuments: eventData.supportingDocuments || [],
      reportedDate: new Date(),
      reportedBy: 'current-user',
      status: 'reported',
      ...eventData,
    };

    events.push(newEvent);
    localStorage.setItem(STORAGE_KEYS.LIFE_EVENTS, JSON.stringify(events));
    return newEvent;
  }
}

// Mass Updates Services
export class MassUpdateService {
  static async getAllMassUpdates(): Promise<MassUpdate[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MASS_UPDATES);
    return data ? JSON.parse(data) : [];
  }

  static async createMassUpdate(updateData: Partial<MassUpdate>): Promise<MassUpdate> {
    const updates = await this.getAllMassUpdates();
    const newUpdate: MassUpdate = {
      updateId: `update-${Date.now()}`,
      updateType: updateData.updateType || 'custom',
      updateName: updateData.updateName || 'New Mass Update',
      description: updateData.description || '',
      targetEmployees: updateData.targetEmployees || [],
      fieldUpdates: updateData.fieldUpdates || [],
      effectiveDate: updateData.effectiveDate || new Date(),
      createdBy: 'current-user',
      createdDate: new Date(),
      status: 'draft',
      ...updateData,
    };

    updates.push(newUpdate);
    localStorage.setItem(STORAGE_KEYS.MASS_UPDATES, JSON.stringify(updates));
    return newUpdate;
  }

  static async executeMassUpdate(updateId: string): Promise<MassUpdate> {
    const updates = await this.getAllMassUpdates();
    const update = updates.find(u => u.updateId === updateId);
    if (!update) throw new Error('Mass update not found');

    update.status = 'executed';
    update.executedDate = new Date();
    update.executedBy = 'current-user';

    localStorage.setItem(STORAGE_KEYS.MASS_UPDATES, JSON.stringify(updates));
    return update;
  }
}

// ID Card Services
export class IDCardService {
  static async getAllIDCards(): Promise<IDCard[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ID_CARDS);
    return data ? JSON.parse(data) : [];
  }

  static async issueIDCard(cardData: Partial<IDCard>): Promise<IDCard> {
    const cards = await this.getAllIDCards();
    const newCard: IDCard = {
      cardId: `card-${Date.now()}`,
      employeeId: cardData.employeeId || '',
      employeeName: cardData.employeeName || '',
      cardNumber: await AutoNumberService.generateNumber('id_card'),
      issueDate: new Date(),
      expiryDate: cardData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      cardType: cardData.cardType || 'employee',
      accessLevel: cardData.accessLevel || 'standard',
      photo: cardData.photo || '',
      isActive: true,
      issuedBy: 'current-user',
      ...cardData,
    };

    cards.push(newCard);
    localStorage.setItem(STORAGE_KEYS.ID_CARDS, JSON.stringify(cards));
    return newCard;
  }
}

// Letter Generation Services
export class LetterService {
  static async getAllLetterRequests(): Promise<LetterRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LETTER_REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  static async createLetterRequest(requestData: Partial<LetterRequest>): Promise<LetterRequest> {
    const requests = await this.getAllLetterRequests();
    const newRequest: LetterRequest = {
      requestId: `letter-${Date.now()}`,
      employeeId: requestData.employeeId || '',
      employeeName: requestData.employeeName || '',
      letterType: requestData.letterType || 'custom',
      templateId: requestData.templateId || '',
      requestDate: new Date(),
      requestedBy: 'current-user',
      status: 'pending',
      referenceNumber: await AutoNumberService.generateNumber('letter'),
      ...requestData,
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.LETTER_REQUESTS, JSON.stringify(requests));
    return newRequest;
  }
}

// Exit Management Services
export class ExitService {
  static async getAllExitProcesses(): Promise<ExitProcess[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EXIT_PROCESSES);
    return data ? JSON.parse(data) : [];
  }

  static async initiateExit(exitData: Partial<ExitProcess>): Promise<ExitProcess> {
    const exits = await this.getAllExitProcesses();
    const newExit: ExitProcess = {
      exitId: `exit-${Date.now()}`,
      employeeId: exitData.employeeId || '',
      employeeName: exitData.employeeName || '',
      exitType: exitData.exitType || 'resignation',
      exitReason: exitData.exitReason || '',
      lastWorkingDate: exitData.lastWorkingDate || new Date(),
      noticePeriod: exitData.noticePeriod || 30,
      noticeServed: 0,
      isRehireable: exitData.isRehireable ?? true,
      exitInterviewScheduled: false,
      exitInterviewCompleted: false,
      clearanceItems: exitData.clearanceItems || [],
      status: 'initiated',
      initiatedBy: 'current-user',
      initiatedDate: new Date(),
      ...exitData,
    };

    exits.push(newExit);
    localStorage.setItem(STORAGE_KEYS.EXIT_PROCESSES, JSON.stringify(exits));
    return newExit;
  }

  static async updateExit(exitId: string, updates: Partial<ExitProcess>): Promise<ExitProcess> {
    const exits = await this.getAllExitProcesses();
    const index = exits.findIndex(e => e.exitId === exitId);
    if (index === -1) throw new Error('Exit process not found');

    exits[index] = { ...exits[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EXIT_PROCESSES, JSON.stringify(exits));
    return exits[index];
  }
}

// Anniversary Services
export class AnniversaryService {
  static async getAllAnniversaries(): Promise<Anniversary[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ANNIVERSARIES);
    return data ? JSON.parse(data) : [];
  }

  static async getUpcomingAnniversaries(days: number = 30): Promise<Anniversary[]> {
    const anniversaries = await this.getAllAnniversaries();
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return anniversaries.filter(a => new Date(a.anniversaryDate) <= cutoffDate && a.status === 'upcoming');
  }
}

// Auto-Numbering Services
export class AutoNumberService {
  static async getAllSequences(): Promise<AutoNumberSequence[]> {
    const data = localStorage.getItem(STORAGE_KEYS.AUTO_NUMBER_SEQUENCES);
    return data ? JSON.parse(data) : [];
  }

  static async generateNumber(entityType: string): Promise<string> {
    const sequences = await this.getAllSequences();
    let sequence = sequences.find(s => s.entityType === entityType && s.isActive);

    if (!sequence) {
      sequence = {
        sequenceId: `seq-${Date.now()}`,
        sequenceName: `${entityType} Sequence`,
        entityType,
        prefix: entityType.substring(0, 3).toUpperCase(),
        currentNumber: 1,
        incrementBy: 1,
        numberLength: 5,
        resetFrequency: 'never',
        format: '{prefix}{number}',
        isActive: true,
        createdDate: new Date(),
      };
      sequences.push(sequence);
    }

    const number = String(sequence.currentNumber).padStart(sequence.numberLength, '0');
    const generatedNumber = sequence.format
      .replace('{prefix}', sequence.prefix)
      .replace('{number}', number);

    sequence.currentNumber += sequence.incrementBy;
    localStorage.setItem(STORAGE_KEYS.AUTO_NUMBER_SEQUENCES, JSON.stringify(sequences));

    return generatedNumber;
  }
}

// Probation Tracking Services
export class ProbationService {
  static async getAllProbationRecords(): Promise<ProbationRecord[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PROBATION_RECORDS);
    return data ? JSON.parse(data) : [];
  }

  static async createProbationRecord(recordData: Partial<ProbationRecord>): Promise<ProbationRecord> {
    const records = await this.getAllProbationRecords();
    const newRecord: ProbationRecord = {
      recordId: `prob-${Date.now()}`,
      employeeId: recordData.employeeId || '',
      employeeName: recordData.employeeName || '',
      department: recordData.department || '',
      probationStartDate: recordData.probationStartDate || new Date(),
      probationEndDate: recordData.probationEndDate || new Date(),
      probationPeriod: recordData.probationPeriod || 90,
      reviews: recordData.reviews || [],
      status: 'ongoing',
      ...recordData,
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.PROBATION_RECORDS, JSON.stringify(records));
    return newRecord;
  }
}

// Confirmation Letter Services
export class ConfirmationLetterService {
  static async getAllConfirmationLetters(): Promise<ConfirmationLetter[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIRMATION_LETTERS);
    return data ? JSON.parse(data) : [];
  }

  static async generateConfirmationLetter(letterData: Partial<ConfirmationLetter>): Promise<ConfirmationLetter> {
    const letters = await this.getAllConfirmationLetters();
    const newLetter: ConfirmationLetter = {
      letterId: `conf-${Date.now()}`,
      employeeId: letterData.employeeId || '',
      employeeName: letterData.employeeName || '',
      confirmationDate: letterData.confirmationDate || new Date(),
      effectiveDate: letterData.effectiveDate || new Date(),
      probationStartDate: letterData.probationStartDate || new Date(),
      probationEndDate: letterData.probationEndDate || new Date(),
      content: letterData.content || '',
      templateId: letterData.templateId || '',
      generatedDate: new Date(),
      generatedBy: 'current-user',
      approvedBy: 'manager',
      approvalDate: new Date(),
      documentUrl: '',
      referenceNumber: await AutoNumberService.generateNumber('confirmation'),
      status: 'draft',
      ...letterData,
    };

    letters.push(newLetter);
    localStorage.setItem(STORAGE_KEYS.CONFIRMATION_LETTERS, JSON.stringify(letters));
    return newLetter;
  }
}

// Asset Management Services
export class AssetService {
  static async getAllAssets(): Promise<Asset[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return data ? JSON.parse(data) : [];
  }

  static async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const assets = await this.getAllAssets();
    const newAsset: Asset = {
      assetId: `asset-${Date.now()}`,
      assetTag: await AutoNumberService.generateNumber('asset'),
      assetName: assetData.assetName || '',
      assetType: assetData.assetType || 'other',
      category: assetData.category || '',
      manufacturer: assetData.manufacturer || '',
      model: assetData.model || '',
      serialNumber: assetData.serialNumber || '',
      purchaseDate: assetData.purchaseDate || new Date(),
      purchaseCost: assetData.purchaseCost || 0,
      currentValue: assetData.currentValue || assetData.purchaseCost || 0,
      location: assetData.location || '',
      status: 'available',
      condition: 'excellent',
      ...assetData,
    };

    assets.push(newAsset);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return newAsset;
  }

  static async assignAsset(assetId: string, employeeId: string, employeeName: string): Promise<AssetAssignment> {
    const assignments = await AssetAssignmentService.getAllAssignments();
    const newAssignment: AssetAssignment = {
      assignmentId: `assign-${Date.now()}`,
      assetId,
      assetTag: '',
      assetName: '',
      employeeId,
      employeeName,
      assignmentDate: new Date(),
      condition: 'good',
      assignedBy: 'current-user',
      status: 'active',
    };

    assignments.push(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSET_ASSIGNMENTS, JSON.stringify(assignments));

    const assets = await this.getAllAssets();
    const asset = assets.find(a => a.assetId === assetId);
    if (asset) {
      asset.assignedTo = employeeId;
      asset.assignedToName = employeeName;
      asset.assignedDate = new Date();
      asset.status = 'assigned';
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    }

    return newAssignment;
  }
}

export class AssetAssignmentService {
  static async getAllAssignments(): Promise<AssetAssignment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASSET_ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getAssignmentsByEmployee(employeeId: string): Promise<AssetAssignment[]> {
    const assignments = await this.getAllAssignments();
    return assignments.filter(a => a.employeeId === employeeId && a.status === 'active');
  }
}

// Settings Service
export class CoreHRSettingsService {
  static async getSettings(): Promise<CoreHRSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);

    const defaultSettings: CoreHRSettings = {
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

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<CoreHRSettings>): Promise<CoreHRSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
