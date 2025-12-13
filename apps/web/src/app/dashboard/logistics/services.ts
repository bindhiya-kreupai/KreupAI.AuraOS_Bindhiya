import { Driver, FleetVehicle, VehicleInspection, SafetyIncident, WarehouseWorker, LogisticsSettings, LogisticsAlert } from './types';

const STORAGE_KEYS = {
  DRIVERS: 'logistics_drivers',
  FLEET_VEHICLES: 'logistics_fleet_vehicles',
  VEHICLE_INSPECTIONS: 'logistics_vehicle_inspections',
  SAFETY_INCIDENTS: 'logistics_safety_incidents',
  WAREHOUSE_WORKERS: 'logistics_warehouse_workers',
  SETTINGS: 'logistics_settings',
  ALERTS: 'logistics_alerts'
};

export class DriverManagementService {
  static async getAllDrivers(): Promise<Driver[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : [];
  }

  static async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    const drivers = await this.getAllDrivers();
    const newDriver: Driver = {
      driverId: 'driver-' + Date.now(),
      employeeId: driverData.employeeId || '',
      employeeName: driverData.employeeName || '',
      email: driverData.email || '',
      phone: driverData.phone || '',
      address: driverData.address || {} as any,
      license: driverData.license || {} as any,
      endorsements: driverData.endorsements || [],
      certifications: driverData.certifications || [],
      medicalCertificate: driverData.medicalCertificate || {} as any,
      hoursOfService: driverData.hoursOfService || {} as any,
      drivingRecord: driverData.drivingRecord || {} as any,
      homeTerminal: driverData.homeTerminal || '',
      status: driverData.status || 'active',
      createdAt: new Date().toISOString(),
      ...driverData
    };
    drivers.push(newDriver);
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    return newDriver;
  }

  static async updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver> {
    const drivers = await this.getAllDrivers();
    const index = drivers.findIndex(d => d.driverId === driverId);
    if (index === -1) throw new Error('Driver not found');
    drivers[index] = { ...drivers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    return drivers[index];
  }

  static async getDriverByEmployeeId(employeeId: string): Promise<Driver | null> {
    const drivers = await this.getAllDrivers();
    return drivers.find(d => d.employeeId === employeeId) || null;
  }
}

export class FleetManagementService {
  static async getAllVehicles(): Promise<FleetVehicle[]> {
    const data = localStorage.getItem(STORAGE_KEYS.FLEET_VEHICLES);
    return data ? JSON.parse(data) : [];
  }

  static async createVehicle(vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle> {
    const vehicles = await this.getAllVehicles();
    const newVehicle: FleetVehicle = {
      vehicleId: 'vehicle-' + Date.now(),
      vehicleNumber: vehicleData.vehicleNumber || 'VEH-' + Date.now(),
      vin: vehicleData.vin || '',
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      year: vehicleData.year || new Date().getFullYear(),
      vehicleType: vehicleData.vehicleType || 'tractor',
      licensePlate: vehicleData.licensePlate || '',
      registrationState: vehicleData.registrationState || '',
      registrationExpiry: vehicleData.registrationExpiry || '',
      insurancePolicy: vehicleData.insurancePolicy || {} as any,
      maintenance: vehicleData.maintenance || {} as any,
      inspections: vehicleData.inspections || [],
      homeTerminal: vehicleData.homeTerminal || '',
      odometer: vehicleData.odometer || 0,
      status: vehicleData.status || 'available',
      createdAt: new Date().toISOString(),
      ...vehicleData
    };
    vehicles.push(newVehicle);
    localStorage.setItem(STORAGE_KEYS.FLEET_VEHICLES, JSON.stringify(vehicles));
    return newVehicle;
  }

  static async updateVehicle(vehicleId: string, updates: Partial<FleetVehicle>): Promise<FleetVehicle> {
    const vehicles = await this.getAllVehicles();
    const index = vehicles.findIndex(v => v.vehicleId === vehicleId);
    if (index === -1) throw new Error('Vehicle not found');
    vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FLEET_VEHICLES, JSON.stringify(vehicles));
    return vehicles[index];
  }

  static async getAllInspections(): Promise<VehicleInspection[]> {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_INSPECTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createInspection(inspectionData: Partial<VehicleInspection>): Promise<VehicleInspection> {
    const inspections = await this.getAllInspections();
    const newInspection: VehicleInspection = {
      inspectionId: 'insp-' + Date.now(),
      inspectionType: inspectionData.inspectionType || 'pre_trip',
      inspectionDate: inspectionData.inspectionDate || new Date().toISOString().split('T')[0],
      inspector: inspectionData.inspector || '',
      vehicleId: inspectionData.vehicleId || '',
      odometer: inspectionData.odometer || 0,
      status: inspectionData.status || 'passed',
      checklist: inspectionData.checklist || [],
      defectsFound: inspectionData.defectsFound || [],
      ...inspectionData
    };
    inspections.push(newInspection);
    localStorage.setItem(STORAGE_KEYS.VEHICLE_INSPECTIONS, JSON.stringify(inspections));
    return newInspection;
  }
}

export class SafetyManagementService {
  static async getAllIncidents(): Promise<SafetyIncident[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INCIDENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const incidents = await this.getAllIncidents();
    const newIncident: SafetyIncident = {
      incidentId: 'incident-' + Date.now(),
      incidentNumber: incidentData.incidentNumber || 'INC-' + Date.now(),
      incidentType: incidentData.incidentType || 'accident',
      incidentDate: incidentData.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: incidentData.incidentTime || new Date().toTimeString().split(' ')[0],
      location: incidentData.location || {} as any,
      involvedPersonnel: incidentData.involvedPersonnel || [],
      involvedVehicles: incidentData.involvedVehicles || [],
      description: incidentData.description || '',
      severity: incidentData.severity || 'minor',
      injuries: incidentData.injuries || [],
      propertyDamage: incidentData.propertyDamage || [],
      investigation: incidentData.investigation || {} as any,
      correctiveActions: incidentData.correctiveActions || [],
      dotReportable: incidentData.dotReportable || false,
      oshaRecordable: incidentData.oshaRecordable || false,
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
}

export class WarehouseStaffingService {
  static async getAllWorkers(): Promise<WarehouseWorker[]> {
    const data = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_WORKERS);
    return data ? JSON.parse(data) : [];
  }

  static async createWorker(workerData: Partial<WarehouseWorker>): Promise<WarehouseWorker> {
    const workers = await this.getAllWorkers();
    const newWorker: WarehouseWorker = {
      workerId: 'worker-' + Date.now(),
      employeeId: workerData.employeeId || '',
      employeeName: workerData.employeeName || '',
      email: workerData.email || '',
      phone: workerData.phone || '',
      position: workerData.position || {} as any,
      certifications: workerData.certifications || [],
      shift: workerData.shift || {} as any,
      performance: workerData.performance || {} as any,
      attendance: workerData.attendance || {} as any,
      safetyRecord: workerData.safetyRecord || {} as any,
      status: workerData.status || 'active',
      createdAt: new Date().toISOString(),
      ...workerData
    };
    workers.push(newWorker);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_WORKERS, JSON.stringify(workers));
    return newWorker;
  }

  static async updateWorker(workerId: string, updates: Partial<WarehouseWorker>): Promise<WarehouseWorker> {
    const workers = await this.getAllWorkers();
    const index = workers.findIndex(w => w.workerId === workerId);
    if (index === -1) throw new Error('Worker not found');
    workers[index] = { ...workers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_WORKERS, JSON.stringify(workers));
    return workers[index];
  }
}

export class LogisticsSettingsService {
  static async getSettings(): Promise<LogisticsSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<LogisticsSettings>): Promise<LogisticsSettings> {
    const current = await this.getSettings();
    const updated: LogisticsSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    } as LogisticsSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<LogisticsAlert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<LogisticsAlert>): Promise<LogisticsAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: LogisticsAlert = {
      alertId: 'alert-' + Date.now(),
      alertType: alertData.alertType || 'driver',
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
