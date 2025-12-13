import {
  Equipment,
  MaintenanceSchedule,
  WorkOrder,
  ProductionLine,
  ProductionRun,
  OEEMetrics,
  SafetyIncident,
  SafetyInspection,
  PPEInventory,
  SafetyTraining,
  ManufacturingSettings,
  ManufacturingAlert
} from './types';

const STORAGE_KEYS = {
  EQUIPMENT: 'manufacturing_equipment',
  MAINTENANCE_SCHEDULES: 'manufacturing_maintenance_schedules',
  WORK_ORDERS: 'manufacturing_work_orders',
  PRODUCTION_LINES: 'manufacturing_production_lines',
  PRODUCTION_RUNS: 'manufacturing_production_runs',
  OEE_METRICS: 'manufacturing_oee_metrics',
  SAFETY_INCIDENTS: 'manufacturing_safety_incidents',
  SAFETY_INSPECTIONS: 'manufacturing_safety_inspections',
  PPE_INVENTORY: 'manufacturing_ppe_inventory',
  SAFETY_TRAINING: 'manufacturing_safety_training',
  SETTINGS: 'manufacturing_settings',
  ALERTS: 'manufacturing_alerts'
};

export class PlantMaintenanceService {
  static async getAllEquipment(): Promise<Equipment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : [];
  }

  static async createEquipment(equipmentData: Partial<Equipment>): Promise<Equipment> {
    const equipment = await this.getAllEquipment();
    const newEquipment: Equipment = {
      equipmentId: 'equip-' + Date.now(),
      equipmentNumber: equipmentData.equipmentNumber || 'EQ-' + Date.now(),
      equipmentName: equipmentData.equipmentName || '',
      equipmentType: equipmentData.equipmentType || '',
      manufacturer: equipmentData.manufacturer || '',
      model: equipmentData.model || '',
      serialNumber: equipmentData.serialNumber || '',
      location: equipmentData.location || {} as any,
      installationDate: equipmentData.installationDate || new Date().toISOString().split('T')[0],
      status: equipmentData.status || 'operational',
      specifications: equipmentData.specifications || {} as any,
      maintenanceHistory: equipmentData.maintenanceHistory || [],
      currentCondition: equipmentData.currentCondition || {} as any,
      criticality: equipmentData.criticality || 'medium',
      createdAt: new Date().toISOString(),
      ...equipmentData
    };
    equipment.push(newEquipment);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    return newEquipment;
  }

  static async updateEquipment(equipmentId: string, updates: Partial<Equipment>): Promise<Equipment> {
    const equipment = await this.getAllEquipment();
    const index = equipment.findIndex(e => e.equipmentId === equipmentId);
    if (index === -1) throw new Error('Equipment not found');
    equipment[index] = { ...equipment[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    return equipment[index];
  }

  static async getAllSchedules(): Promise<MaintenanceSchedule[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_SCHEDULES);
    return data ? JSON.parse(data) : [];
  }

  static async createSchedule(scheduleData: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const schedules = await this.getAllSchedules();
    const newSchedule: MaintenanceSchedule = {
      scheduleId: 'sched-' + Date.now(),
      equipmentId: scheduleData.equipmentId || '',
      equipmentName: scheduleData.equipmentName || '',
      maintenanceType: scheduleData.maintenanceType || 'preventive',
      frequency: scheduleData.frequency || { value: 30, unit: 'days' },
      nextDue: scheduleData.nextDue || new Date().toISOString().split('T')[0],
      estimatedDuration: scheduleData.estimatedDuration || 0,
      priority: scheduleData.priority || 'medium',
      checklist: scheduleData.checklist || [],
      status: scheduleData.status || 'active',
      createdAt: new Date().toISOString(),
      ...scheduleData
    };
    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_SCHEDULES, JSON.stringify(schedules));
    return newSchedule;
  }

  static async getAllWorkOrders(): Promise<WorkOrder[]> {
    const data = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return data ? JSON.parse(data) : [];
  }

  static async createWorkOrder(orderData: Partial<WorkOrder>): Promise<WorkOrder> {
    const orders = await this.getAllWorkOrders();
    const newOrder: WorkOrder = {
      workOrderId: 'wo-' + Date.now(),
      workOrderNumber: orderData.workOrderNumber || 'WO-' + Date.now(),
      equipmentId: orderData.equipmentId || '',
      equipmentName: orderData.equipmentName || '',
      maintenanceType: orderData.maintenanceType || 'corrective',
      priority: orderData.priority || 'medium',
      description: orderData.description || '',
      requestedBy: orderData.requestedBy || '',
      requestedDate: orderData.requestedDate || new Date().toISOString().split('T')[0],
      status: orderData.status || 'scheduled',
      estimatedCost: orderData.estimatedCost || 0,
      estimatedHours: orderData.estimatedHours || 0,
      parts: orderData.parts || [],
      createdAt: new Date().toISOString(),
      ...orderData
    };
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  static async updateWorkOrder(workOrderId: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    const orders = await this.getAllWorkOrders();
    const index = orders.findIndex(o => o.workOrderId === workOrderId);
    if (index === -1) throw new Error('Work order not found');
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
    return orders[index];
  }
}

export class ProductionEfficiencyService {
  static async getAllLines(): Promise<ProductionLine[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION_LINES);
    return data ? JSON.parse(data) : [];
  }

  static async createLine(lineData: Partial<ProductionLine>): Promise<ProductionLine> {
    const lines = await this.getAllLines();
    const newLine: ProductionLine = {
      lineId: 'line-' + Date.now(),
      lineName: lineData.lineName || '',
      lineNumber: lineData.lineNumber || 'L-' + Date.now(),
      plant: lineData.plant || '',
      department: lineData.department || '',
      productType: lineData.productType || '',
      capacity: lineData.capacity || {} as any,
      equipment: lineData.equipment || [],
      staffing: lineData.staffing || {} as any,
      status: lineData.status || 'idle',
      currentShift: lineData.currentShift || {} as any,
      performance: lineData.performance || {} as any,
      createdAt: new Date().toISOString(),
      ...lineData
    };
    lines.push(newLine);
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_LINES, JSON.stringify(lines));
    return newLine;
  }

  static async updateLine(lineId: string, updates: Partial<ProductionLine>): Promise<ProductionLine> {
    const lines = await this.getAllLines();
    const index = lines.findIndex(l => l.lineId === lineId);
    if (index === -1) throw new Error('Production line not found');
    lines[index] = { ...lines[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_LINES, JSON.stringify(lines));
    return lines[index];
  }

  static async getAllRuns(): Promise<ProductionRun[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION_RUNS);
    return data ? JSON.parse(data) : [];
  }

  static async createRun(runData: Partial<ProductionRun>): Promise<ProductionRun> {
    const runs = await this.getAllRuns();
    const newRun: ProductionRun = {
      runId: 'run-' + Date.now(),
      lineId: runData.lineId || '',
      lineName: runData.lineName || '',
      productId: runData.productId || '',
      productName: runData.productName || '',
      batchNumber: runData.batchNumber || 'BATCH-' + Date.now(),
      startTime: runData.startTime || new Date().toISOString(),
      plannedQuantity: runData.plannedQuantity || 0,
      actualQuantity: runData.actualQuantity || 0,
      goodUnits: runData.goodUnits || 0,
      defectiveUnits: runData.defectiveUnits || 0,
      scrapUnits: runData.scrapUnits || 0,
      status: runData.status || 'planned',
      operators: runData.operators || [],
      qualityChecks: runData.qualityChecks || [],
      downtimeEvents: runData.downtimeEvents || [],
      createdAt: new Date().toISOString(),
      ...runData
    };
    runs.push(newRun);
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_RUNS, JSON.stringify(runs));
    return newRun;
  }

  static async updateRun(runId: string, updates: Partial<ProductionRun>): Promise<ProductionRun> {
    const runs = await this.getAllRuns();
    const index = runs.findIndex(r => r.runId === runId);
    if (index === -1) throw new Error('Production run not found');
    runs[index] = { ...runs[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_RUNS, JSON.stringify(runs));
    return runs[index];
  }

  static async getAllOEEMetrics(): Promise<OEEMetrics[]> {
    const data = localStorage.getItem(STORAGE_KEYS.OEE_METRICS);
    return data ? JSON.parse(data) : [];
  }

  static async createOEEMetrics(metricsData: Partial<OEEMetrics>): Promise<OEEMetrics> {
    const metrics = await this.getAllOEEMetrics();
    const newMetrics: OEEMetrics = {
      metricId: 'metric-' + Date.now(),
      lineId: metricsData.lineId || '',
      lineName: metricsData.lineName || '',
      period: metricsData.period || {} as any,
      availability: metricsData.availability || {} as any,
      performanceMetrics: metricsData.performanceMetrics || {} as any,
      qualityMetrics: metricsData.qualityMetrics || {} as any,
      overallOEE: metricsData.overallOEE || 0,
      worldClassOEE: 85,
      trend: metricsData.trend || 'stable',
      createdAt: new Date().toISOString(),
      ...metricsData
    };
    metrics.push(newMetrics);
    localStorage.setItem(STORAGE_KEYS.OEE_METRICS, JSON.stringify(metrics));
    return newMetrics;
  }
}

export class SafetyComplianceService {
  static async getAllIncidents(): Promise<SafetyIncident[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INCIDENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const incidents = await this.getAllIncidents();
    const newIncident: SafetyIncident = {
      incidentId: 'incident-' + Date.now(),
      incidentNumber: incidentData.incidentNumber || 'INC-' + Date.now(),
      incidentType: incidentData.incidentType || {} as any,
      severity: incidentData.severity || 'minor',
      reportedDate: incidentData.reportedDate || new Date().toISOString().split('T')[0],
      incidentDate: incidentData.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: incidentData.incidentTime || new Date().toTimeString().split(' ')[0],
      location: incidentData.location || {} as any,
      affectedPerson: incidentData.affectedPerson || {} as any,
      description: incidentData.description || '',
      immediateAction: incidentData.immediateAction || '',
      witnesses: incidentData.witnesses || [],
      investigation: incidentData.investigation || {} as any,
      correctiveActions: incidentData.correctiveActions || [],
      status: incidentData.status || 'reported',
      reportedBy: incidentData.reportedBy || '',
      createdAt: new Date().toISOString(),
      ...incidentData
    };
    incidents.push(newIncident);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(incidents));
    return newIncident;
  }

  static async updateIncident(incidentId: string, updates: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const incidents = await this.getAllIncidents();
    const index = incidents.findIndex(i => i.incidentId === incidentId);
    if (index === -1) throw new Error('Incident not found');
    incidents[index] = { ...incidents[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(incidents));
    return incidents[index];
  }

  static async getAllInspections(): Promise<SafetyInspection[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INSPECTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createInspection(inspectionData: Partial<SafetyInspection>): Promise<SafetyInspection> {
    const inspections = await this.getAllInspections();
    const newInspection: SafetyInspection = {
      inspectionId: 'insp-' + Date.now(),
      inspectionType: inspectionData.inspectionType || 'routine',
      scheduledDate: inspectionData.scheduledDate || new Date().toISOString().split('T')[0],
      inspector: inspectionData.inspector || '',
      location: inspectionData.location || {} as any,
      checklist: inspectionData.checklist || [],
      findings: inspectionData.findings || [],
      overallScore: inspectionData.overallScore || 0,
      status: inspectionData.status || 'scheduled',
      followUpRequired: inspectionData.followUpRequired || false,
      createdAt: new Date().toISOString(),
      ...inspectionData
    };
    inspections.push(newInspection);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INSPECTIONS, JSON.stringify(inspections));
    return newInspection;
  }

  static async updateInspection(inspectionId: string, updates: Partial<SafetyInspection>): Promise<SafetyInspection> {
    const inspections = await this.getAllInspections();
    const index = inspections.findIndex(i => i.inspectionId === inspectionId);
    if (index === -1) throw new Error('Inspection not found');
    inspections[index] = { ...inspections[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_INSPECTIONS, JSON.stringify(inspections));
    return inspections[index];
  }

  static async getAllPPEInventory(): Promise<PPEInventory[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PPE_INVENTORY);
    return data ? JSON.parse(data) : [];
  }

  static async createPPEItem(itemData: Partial<PPEInventory>): Promise<PPEInventory> {
    const inventory = await this.getAllPPEInventory();
    const newItem: PPEInventory = {
      inventoryId: 'ppe-' + Date.now(),
      itemCode: itemData.itemCode || 'PPE-' + Date.now(),
      itemName: itemData.itemName || '',
      category: itemData.category || {} as any,
      certifications: itemData.certifications || [],
      supplier: itemData.supplier || '',
      unitCost: itemData.unitCost || 0,
      quantity: itemData.quantity || {} as any,
      reorderPoint: itemData.reorderPoint || 0,
      location: itemData.location || '',
      status: itemData.status || 'active',
      createdAt: new Date().toISOString(),
      ...itemData
    };
    inventory.push(newItem);
    localStorage.setItem(STORAGE_KEYS.PPE_INVENTORY, JSON.stringify(inventory));
    return newItem;
  }

  static async updatePPEItem(inventoryId: string, updates: Partial<PPEInventory>): Promise<PPEInventory> {
    const inventory = await this.getAllPPEInventory();
    const index = inventory.findIndex(i => i.inventoryId === inventoryId);
    if (index === -1) throw new Error('PPE item not found');
    inventory[index] = { ...inventory[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PPE_INVENTORY, JSON.stringify(inventory));
    return inventory[index];
  }

  static async getAllTraining(): Promise<SafetyTraining[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_TRAINING);
    return data ? JSON.parse(data) : [];
  }

  static async createTraining(trainingData: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const training = await this.getAllTraining();
    const newTraining: SafetyTraining = {
      trainingId: 'train-' + Date.now(),
      trainingName: trainingData.trainingName || '',
      trainingType: trainingData.trainingType || 'orientation',
      requiredFor: trainingData.requiredFor || [],
      duration: trainingData.duration || 0,
      validityPeriod: trainingData.validityPeriod || 0,
      instructor: trainingData.instructor || '',
      scheduledDate: trainingData.scheduledDate || new Date().toISOString().split('T')[0],
      location: trainingData.location || '',
      maxParticipants: trainingData.maxParticipants || 0,
      enrolledParticipants: trainingData.enrolledParticipants || [],
      completionCriteria: trainingData.completionCriteria || [],
      certificationIssued: trainingData.certificationIssued || false,
      status: trainingData.status || 'scheduled',
      createdAt: new Date().toISOString(),
      ...trainingData
    };
    training.push(newTraining);
    localStorage.setItem(STORAGE_KEYS.SAFETY_TRAINING, JSON.stringify(training));
    return newTraining;
  }

  static async updateTraining(trainingId: string, updates: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const training = await this.getAllTraining();
    const index = training.findIndex(t => t.trainingId === trainingId);
    if (index === -1) throw new Error('Training not found');
    training[index] = { ...training[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_TRAINING, JSON.stringify(training));
    return training[index];
  }
}

export class ManufacturingSettingsService {
  static async getSettings(): Promise<ManufacturingSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<ManufacturingSettings>): Promise<ManufacturingSettings> {
    const current = await this.getSettings();
    const updated: ManufacturingSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    } as ManufacturingSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<ManufacturingAlert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<ManufacturingAlert>): Promise<ManufacturingAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: ManufacturingAlert = {
      alertId: 'alert-' + Date.now(),
      alertType: alertData.alertType || 'equipment',
      severity: alertData.severity || 'low',
      title: alertData.title || '',
      message: alertData.message || '',
      relatedEntity: alertData.relatedEntity || {} as any,
      status: alertData.status || 'active',
      createdAt: new Date().toISOString(),
      ...alertData
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return newAlert;
  }
}
