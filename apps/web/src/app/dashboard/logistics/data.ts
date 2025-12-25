import type { Driver, FleetVehicle, SafetyIncident, WarehouseWorker, LogisticsSettings } from './types';

export const sampleDrivers: Driver[] = [{
  driverId: 'driver-001', employeeId: 'emp-001', employeeName: 'John Smith', email: 'john.smith@company.com', phone: '+1-555-0123',
  address: { street: '123 Main St', city: 'Dallas', state: 'TX', zipCode: '75001', country: 'USA' },
  license: { licenseNumber: 'TX12345678', licenseClass: 'A', issueDate: '2020-01-15', expiryDate: '2028-01-15', issuingState: 'TX', restrictions: [], verified: true, verificationDate: '2024-01-01' },
  endorsements: [{ endorsementId: 'end-001', endorsementType: 'H', endorsementName: 'Hazardous Materials', issueDate: '2020-01-15', verified: true }],
  certifications: [], medicalCertificate: { certificateId: 'med-001', examDate: '2024-06-01', expiryDate: '2026-06-01', examiner: 'Dr. Johnson', examinerNumber: 'MED123', certificateType: 'dot_long_form', restrictions: [], status: 'valid' },
  hoursOfService: { currentDutyStatus: 'off_duty', hoursAvailable: { drive: 11, shift: 14, cycle: 70, break: 8 }, violations: [], lastStatusChange: '2024-12-13T06:00:00Z', dailyLogs: [] },
  drivingRecord: { recordId: 'record-001', totalMiles: 500000, totalHours: 10000, safetyScore: 95, accidents: [], violations: [], inspections: 24, cleanInspections: 23, lastUpdated: '2024-12-01' },
  homeTerminal: 'Dallas Terminal', status: 'active', createdAt: '2020-01-15T00:00:00Z'
}];

export const sampleFleetVehicles: FleetVehicle[] = [{
  vehicleId: 'vehicle-001', vehicleNumber: 'TRK-001', vin: '1HGBH41JXMN109186', make: 'Freightliner', model: 'Cascadia', year: 2022, vehicleType: 'tractor',
  licensePlate: 'TX-ABC123', registrationState: 'TX', registrationExpiry: '2025-12-31',
  insurancePolicy: { policyNumber: 'POL-123456', provider: 'Commercial Insurance Co', coverageType: ['liability', 'collision', 'comprehensive'], effectiveDate: '2024-01-01', expiryDate: '2025-01-01', premium: 12000, deductible: 5000, liabilityLimit: 1000000 },
  maintenance: { lastServiceDate: '2024-11-01', nextServiceDue: '2025-02-01', serviceInterval: 90, maintenanceHistory: [], openWorkOrders: [] },
  inspections: [], homeTerminal: 'Dallas Terminal', odometer: 125000, status: 'available', createdAt: '2022-06-01T00:00:00Z'
}];

export const sampleSafetyIncidents: SafetyIncident[] = [{
  incidentId: 'incident-001', incidentNumber: 'INC-2024-001', incidentType: 'near_miss', incidentDate: '2024-12-10', incidentTime: '14:30:00',
  location: { address: 'Interstate 35 Mile Marker 85', city: 'Waco', state: 'TX', weatherConditions: 'Clear', roadConditions: 'Dry' },
  involvedPersonnel: [{ personId: 'p-001', role: 'driver', name: 'John Smith', employeeId: 'emp-001', injured: false }],
  involvedVehicles: [{ vehicleId: 'vehicle-001', vehicleType: 'tractor', licensePlate: 'TX-ABC123', damage: 'None' }],
  description: 'Vehicle in adjacent lane swerved suddenly, driver took evasive action.', severity: 'minor', injuries: [], propertyDamage: [],
  investigation: { investigatorId: 'inv-001', investigatorName: 'Safety Manager', startDate: '2024-12-10', findings: 'Driver reacted appropriately', rootCause: 'Other driver error', contributingFactors: [], evidenceCollected: [], recommendations: ['Continue defensive driving training'] },
  correctiveActions: [], dotReportable: false, oshaRecordable: false, status: 'resolved', reportedBy: 'John Smith', createdAt: '2024-12-10T15:00:00Z'
}];

export const sampleWarehouseWorkers: WarehouseWorker[] = [{
  workerId: 'worker-001', employeeId: 'emp-101', employeeName: 'Maria Garcia', email: 'maria.garcia@company.com', phone: '+1-555-0234',
  position: { positionId: 'pos-001', positionTitle: 'Forklift Operator', department: 'shipping', payGrade: 'W-3', hourlyRate: 22.50, startDate: '2021-03-01' },
  certifications: [{ certificationId: 'cert-001', certificationType: 'forklift', certificationName: 'Forklift Operation Certification', issueDate: '2024-01-15', expiryDate: '2027-01-15', certifyingOrganization: 'OSHA Certified Training', certificationNumber: 'FL-2024-001', status: 'valid' }],
  shift: { assignmentId: 'shift-001', shiftType: 'day', schedule: { daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '07:00', endTime: '15:30', breakTimes: [{ breakType: 'meal', startTime: '11:30', duration: 30 }] }, overtime: { weeklyHours: 40, overtimeHours: 0, yearToDateOT: 25, approved: true }, coverage: { requiredStaff: 10, actualStaff: 10, coveragePercentage: 100, shortages: [] } },
  performance: { performanceId: 'perf-001', period: { startDate: '2024-11-01', endDate: '2024-11-30' }, productivity: { unitsProcessed: 5200, unitsPerHour: 65, targetRate: 60, efficiencyRate: 108.3 }, quality: { accuracy: 99.2, errorRate: 0.8, reworkRequired: 3, customerComplaints: 0 }, safety: { incidentsReported: 0, nearMisses: 0, safetyViolations: 0, daysWithoutIncident: 365 }, overallRating: 4.5, lastReviewDate: '2024-12-01' },
  attendance: { totalDaysScheduled: 22, daysPresent: 22, daysAbsent: 0, tardyOccurrences: 0, attendanceRate: 100, occurrences: [] },
  safetyRecord: { totalIncidents: 0, recordableIncidents: 0, lostTimeIncidents: 0, restrictedDutyIncidents: 0, safetyCertifications: ['Forklift Safety'], lastSafetyTraining: '2024-06-15', nextSafetyTrainingDue: '2025-06-15' },
  status: 'active', createdAt: '2021-03-01T00:00:00Z'
}];

export const sampleLogisticsSettings: LogisticsSettings = {
  settingsId: 'settings-001', organizationId: 'org-001',
  driverSettings: { hosComplianceRequired: true, eldMandatory: true, medicalCertificateRenewalDays: 30, licenseExpiryWarningDays: 60 },
  fleetSettings: { inspectionFrequency: 90, maintenanceIntervalMiles: 15000, insuranceRenewalWarningDays: 30, safetyScoreThreshold: 80 },
  warehouseSettings: { certificationRenewalDays: 30, maxOvertimeHoursWeekly: 10, minimumStaffingLevel: 8, attendanceOccurrenceLimit: 6 },
  notifications: { licenseExpiring: true, medicalExpiring: true, hosViolation: true, safetyIncident: true, certificationExpiring: true },
  updatedAt: '2024-01-01T00:00:00Z'
};
