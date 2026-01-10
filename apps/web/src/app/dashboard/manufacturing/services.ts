import { APIClient } from '@/lib/api-client';
import type {
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
  ManufacturingAlert,
} from './types';

export class PlantMaintenanceService {
  private static equipmentEndpoint = '/manufacturing/equipment';
  private static schedulesEndpoint = '/manufacturing/maintenance/schedules';
  private static workOrdersEndpoint = '/manufacturing/maintenance/work-orders';

  static async getAllEquipment(): Promise<Equipment[]> {
    return APIClient.get<Equipment[]>(this.equipmentEndpoint);
  }

  static async createEquipment(equipmentData: Partial<Equipment>): Promise<Equipment> {
    return APIClient.post<Equipment>(this.equipmentEndpoint, equipmentData);
  }

  static async updateEquipment(
    equipmentId: string,
    updates: Partial<Equipment>
  ): Promise<Equipment> {
    return APIClient.put<Equipment>(`${this.equipmentEndpoint}/${equipmentId}`, updates);
  }

  static async getAllSchedules(): Promise<MaintenanceSchedule[]> {
    return APIClient.get<MaintenanceSchedule[]>(this.schedulesEndpoint);
  }

  static async createSchedule(
    scheduleData: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    return APIClient.post<MaintenanceSchedule>(this.schedulesEndpoint, scheduleData);
  }

  static async getAllWorkOrders(): Promise<WorkOrder[]> {
    return APIClient.get<WorkOrder[]>(this.workOrdersEndpoint);
  }

  static async createWorkOrder(orderData: Partial<WorkOrder>): Promise<WorkOrder> {
    return APIClient.post<WorkOrder>(this.workOrdersEndpoint, orderData);
  }

  static async updateWorkOrder(
    workOrderId: string,
    updates: Partial<WorkOrder>
  ): Promise<WorkOrder> {
    return APIClient.put<WorkOrder>(`${this.workOrdersEndpoint}/${workOrderId}`, updates);
  }
}

export class ProductionEfficiencyService {
  private static linesEndpoint = '/manufacturing/production/lines';
  private static runsEndpoint = '/manufacturing/production/runs';
  private static oeeEndpoint = '/manufacturing/production/oee-metrics';

  static async getAllLines(): Promise<ProductionLine[]> {
    return APIClient.get<ProductionLine[]>(this.linesEndpoint);
  }

  static async createLine(lineData: Partial<ProductionLine>): Promise<ProductionLine> {
    return APIClient.post<ProductionLine>(this.linesEndpoint, lineData);
  }

  static async updateLine(
    lineId: string,
    updates: Partial<ProductionLine>
  ): Promise<ProductionLine> {
    return APIClient.put<ProductionLine>(`${this.linesEndpoint}/${lineId}`, updates);
  }

  static async getAllRuns(): Promise<ProductionRun[]> {
    return APIClient.get<ProductionRun[]>(this.runsEndpoint);
  }

  static async createRun(runData: Partial<ProductionRun>): Promise<ProductionRun> {
    return APIClient.post<ProductionRun>(this.runsEndpoint, runData);
  }

  static async updateRun(runId: string, updates: Partial<ProductionRun>): Promise<ProductionRun> {
    return APIClient.put<ProductionRun>(`${this.runsEndpoint}/${runId}`, updates);
  }

  static async getAllOEEMetrics(): Promise<OEEMetrics[]> {
    return APIClient.get<OEEMetrics[]>(this.oeeEndpoint);
  }

  static async createOEEMetrics(metricsData: Partial<OEEMetrics>): Promise<OEEMetrics> {
    return APIClient.post<OEEMetrics>(this.oeeEndpoint, metricsData);
  }
}

export class SafetyComplianceService {
  private static incidentsEndpoint = '/manufacturing/safety/incidents';
  private static inspectionsEndpoint = '/manufacturing/safety/inspections';
  private static ppeEndpoint = '/manufacturing/safety/ppe-inventory';
  private static trainingEndpoint = '/manufacturing/safety/training';

  static async getAllIncidents(): Promise<SafetyIncident[]> {
    return APIClient.get<SafetyIncident[]>(this.incidentsEndpoint);
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    return APIClient.post<SafetyIncident>(this.incidentsEndpoint, incidentData);
  }

  static async updateIncident(
    incidentId: string,
    updates: Partial<SafetyIncident>
  ): Promise<SafetyIncident> {
    return APIClient.put<SafetyIncident>(`${this.incidentsEndpoint}/${incidentId}`, updates);
  }

  static async getAllInspections(): Promise<SafetyInspection[]> {
    return APIClient.get<SafetyInspection[]>(this.inspectionsEndpoint);
  }

  static async createInspection(
    inspectionData: Partial<SafetyInspection>
  ): Promise<SafetyInspection> {
    return APIClient.post<SafetyInspection>(this.inspectionsEndpoint, inspectionData);
  }

  static async updateInspection(
    inspectionId: string,
    updates: Partial<SafetyInspection>
  ): Promise<SafetyInspection> {
    return APIClient.put<SafetyInspection>(`${this.inspectionsEndpoint}/${inspectionId}`, updates);
  }

  static async getAllPPEInventory(): Promise<PPEInventory[]> {
    return APIClient.get<PPEInventory[]>(this.ppeEndpoint);
  }

  static async createPPEItem(itemData: Partial<PPEInventory>): Promise<PPEInventory> {
    return APIClient.post<PPEInventory>(this.ppeEndpoint, itemData);
  }

  static async updatePPEItem(
    inventoryId: string,
    updates: Partial<PPEInventory>
  ): Promise<PPEInventory> {
    return APIClient.put<PPEInventory>(`${this.ppeEndpoint}/${inventoryId}`, updates);
  }

  static async getAllTraining(): Promise<SafetyTraining[]> {
    return APIClient.get<SafetyTraining[]>(this.trainingEndpoint);
  }

  static async createTraining(trainingData: Partial<SafetyTraining>): Promise<SafetyTraining> {
    return APIClient.post<SafetyTraining>(this.trainingEndpoint, trainingData);
  }

  static async updateTraining(
    trainingId: string,
    updates: Partial<SafetyTraining>
  ): Promise<SafetyTraining> {
    return APIClient.put<SafetyTraining>(`${this.trainingEndpoint}/${trainingId}`, updates);
  }
}

export class ManufacturingSettingsService {
  private static endpoint = '/manufacturing/settings';

  static async getSettings(): Promise<ManufacturingSettings | null> {
    return APIClient.get<ManufacturingSettings>(this.endpoint);
  }

  static async updateSettings(
    settings: Partial<ManufacturingSettings>
  ): Promise<ManufacturingSettings> {
    return APIClient.put<ManufacturingSettings>(this.endpoint, settings);
  }
}

export class AlertsService {
  private static endpoint = '/manufacturing/alerts';

  static async getAll(): Promise<ManufacturingAlert[]> {
    return APIClient.get<ManufacturingAlert[]>(this.endpoint);
  }

  static async createAlert(alertData: Partial<ManufacturingAlert>): Promise<ManufacturingAlert> {
    return APIClient.post<ManufacturingAlert>(this.endpoint, alertData);
  }
}
