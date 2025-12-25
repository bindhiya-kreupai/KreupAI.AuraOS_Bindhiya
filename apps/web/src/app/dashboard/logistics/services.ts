import { APIClient } from '@/lib/api-client';
import { Driver, FleetVehicle, VehicleInspection, SafetyIncident, WarehouseWorker, LogisticsSettings, LogisticsAlert } from './types';

export class DriverManagementService {
  private static endpoint = '/industry-logistics/drivers';

  static async getAllDrivers(): Promise<Driver[]> {
    try {
      const response = await APIClient.get<{ drivers?: Driver[] }>(this.endpoint);
      return response.drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  static async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    const response = await APIClient.post<{ driver: Driver }>(this.endpoint, driverData);
    return response.driver;
  }

  static async updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver> {
    const response = await APIClient.put<{ driver: Driver }>(`${this.endpoint}/${driverId}`, updates);
    return response.driver;
  }

  static async getDriverByEmployeeId(employeeId: string): Promise<Driver | null> {
    try {
      const response = await APIClient.get<{ driver?: Driver }>(`${this.endpoint}/employee/${employeeId}`);
      return response.driver || null;
    } catch (error) {
      console.error('Error fetching driver:', error);
      return null;
    }
  }
}

export class FleetManagementService {
  private static endpoint = '/industry-logistics/fleet';

  static async getAllVehicles(): Promise<FleetVehicle[]> {
    try {
      const response = await APIClient.get<{ vehicles?: FleetVehicle[] }>(this.endpoint);
      return response.vehicles || [];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  }

  static async createVehicle(vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle> {
    const response = await APIClient.post<{ vehicle: FleetVehicle }>(this.endpoint, vehicleData);
    return response.vehicle;
  }

  static async updateVehicle(vehicleId: string, updates: Partial<FleetVehicle>): Promise<FleetVehicle> {
    const response = await APIClient.put<{ vehicle: FleetVehicle }>(`${this.endpoint}/${vehicleId}`, updates);
    return response.vehicle;
  }

  static async getAllInspections(): Promise<VehicleInspection[]> {
    try {
      const response = await APIClient.get<{ inspections?: VehicleInspection[] }>(`${this.endpoint}/inspections`);
      return response.inspections || [];
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return [];
    }
  }

  static async createInspection(inspectionData: Partial<VehicleInspection>): Promise<VehicleInspection> {
    const response = await APIClient.post<{ inspection: VehicleInspection }>(`${this.endpoint}/inspections`, inspectionData);
    return response.inspection;
  }
}

export class SafetyManagementService {
  private static endpoint = '/industry-logistics/safety';

  static async getAllIncidents(): Promise<SafetyIncident[]> {
    try {
      const response = await APIClient.get<{ incidents?: SafetyIncident[] }>(this.endpoint);
      return response.incidents || [];
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const response = await APIClient.post<{ incident: SafetyIncident }>(this.endpoint, incidentData);
    return response.incident;
  }

  static async updateIncident(incidentId: string, updates: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const response = await APIClient.put<{ incident: SafetyIncident }>(`${this.endpoint}/${incidentId}`, updates);
    return response.incident;
  }
}

export class WarehouseStaffingService {
  private static endpoint = '/industry-logistics/warehouse-staff';

  static async getAllWorkers(): Promise<WarehouseWorker[]> {
    try {
      const response = await APIClient.get<{ workers?: WarehouseWorker[] }>(this.endpoint);
      return response.workers || [];
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  }

  static async createWorker(workerData: Partial<WarehouseWorker>): Promise<WarehouseWorker> {
    const response = await APIClient.post<{ worker: WarehouseWorker }>(this.endpoint, workerData);
    return response.worker;
  }

  static async updateWorker(workerId: string, updates: Partial<WarehouseWorker>): Promise<WarehouseWorker> {
    const response = await APIClient.put<{ worker: WarehouseWorker }>(`${this.endpoint}/${workerId}`, updates);
    return response.worker;
  }
}

export class LogisticsSettingsService {
  private static endpoint = '/industry-logistics/settings';

  static async getSettings(): Promise<LogisticsSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: LogisticsSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  static async updateSettings(settings: Partial<LogisticsSettings>): Promise<LogisticsSettings> {
    const response = await APIClient.put<{ settings: LogisticsSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-logistics/alerts';

  static async getAllAlerts(): Promise<LogisticsAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: LogisticsAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async createAlert(alertData: Partial<LogisticsAlert>): Promise<LogisticsAlert> {
    const response = await APIClient.post<{ alert: LogisticsAlert }>(this.endpoint, alertData);
    return response.alert;
  }
}
