
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
    ManufacturingAlert,
} from '@/app/dashboard/manufacturing/types';

export const mockEquipment: Equipment[] = [
    {
        equipmentId: 'EQ-001',
        equipmentNumber: 'EQ-1001',
        equipmentName: 'CNC Milling Machine - 01',
        equipmentType: 'Milling Machine',
        manufacturer: 'Haas',
        model: 'VF-2',
        serialNumber: 'SN-123456',
        location: {
            plant: 'Plant A',
            building: 'B1',
            floor: 'F1',
            area: 'Machining',
            line: 'Line 1',
        },
        installationDate: '2020-01-15',
        status: 'operational',
        specifications: {
            capacity: 100,
            capacityUnit: 'items/hr',
            powerRequirement: 220,
            voltage: 220,
            dimensions: {
                length: 2,
                width: 1.5,
                height: 2,
                unit: 'm',
            },
            weight: 1500,
            weightUnit: 'kg',
        },
        maintenanceHistory: [],
        currentCondition: {
            overallHealth: 95,
            vibrationLevel: 2.5,
            temperature: 45,
            lastInspectionDate: '2023-10-01',
            nextInspectionDate: '2023-11-01',
        },
        criticality: 'high',
        createdAt: new Date().toISOString(),
    },
    {
        equipmentId: 'EQ-002',
        equipmentNumber: 'EQ-1002',
        equipmentName: 'Robot Arm - Assembly',
        equipmentType: 'Robot',
        manufacturer: 'KUKA',
        model: 'KR-10',
        serialNumber: 'SN-789012',
        location: {
            plant: 'Plant A',
            building: 'B1',
            floor: 'F1',
            area: 'Assembly',
            line: 'Line 2',
        },
        installationDate: '2021-03-20',
        status: 'maintenance',
        specifications: {
            capacity: 500,
            capacityUnit: 'welds/hr',
            powerRequirement: 480,
            voltage: 480,
            dimensions: {
                length: 1,
                width: 1,
                height: 1.8,
                unit: 'm',
            },
            weight: 600,
            weightUnit: 'kg',
        },
        maintenanceHistory: [],
        currentCondition: {
            overallHealth: 80,
            vibrationLevel: 1.2,
            temperature: 38,
            lastInspectionDate: '2023-09-15',
            nextInspectionDate: '2023-10-15',
        },
        criticality: 'critical',
        createdAt: new Date().toISOString(),
    }
];

export const mockSchedules: MaintenanceSchedule[] = [
    {
        scheduleId: 'SCH-001',
        equipmentId: 'EQ-001',
        equipmentName: 'CNC Milling Machine - 01',
        maintenanceType: 'preventive',
        frequency: { value: 1, unit: 'months' },
        nextDue: '2023-11-01T08:00:00Z',
        estimatedDuration: 4,
        priority: 'high',
        checklist: [],
        status: 'active',
        createdAt: new Date().toISOString(),
    }
];

export const mockWorkOrders: WorkOrder[] = [
    {
        workOrderId: 'WO-001',
        workOrderNumber: 'WO-2023-001',
        equipmentId: 'EQ-002',
        equipmentName: 'Robot Arm - Assembly',
        maintenanceType: 'corrective',
        priority: 'high',
        description: 'Joint 3 calibration error',
        requestedBy: 'John Doe',
        requestedDate: '2023-10-25T10:00:00Z',
        status: 'in_progress',
        estimatedCost: 500,
        estimatedHours: 2,
        parts: [],
        createdAt: new Date().toISOString(),
    }
];

export const mockProductionLines: ProductionLine[] = [
    {
        lineId: 'LINE-001',
        lineName: 'Assembly Line 1',
        lineNumber: 'L1',
        plant: 'Plant A',
        department: 'Assembly',
        productType: 'Electronics',
        capacity: {
            ratedCapacity: 1000,
            capacityUnit: 'units/day',
            cycleTime: 60,
            shiftsPerDay: 2,
            daysPerWeek: 5,
        },
        equipment: ['EQ-002'],
        staffing: {
            operators: 5,
            technicians: 1,
            supervisor: 'Sarah Connor',
            currentStaffCount: 5,
            requiredStaffCount: 6,
        },
        status: 'running',
        currentShift: {
            shiftId: 'SHIFT-A',
            shiftName: 'Morning Shift',
            startTime: '06:00',
            endTime: '14:00',
            supervisor: 'Sarah Connor',
        },
        performance: {
            oee: 85,
            availability: 90,
            performance: 95,
            quality: 99,
            unitsProduced: 450,
            targetUnits: 500,
            defectRate: 1,
            downtime: 30,
            lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
    }
];

export const mockRuns: ProductionRun[] = [
    {
        runId: 'RUN-001',
        lineId: 'LINE-001',
        lineName: 'Assembly Line 1',
        productId: 'PROD-101',
        productName: 'Widget X',
        batchNumber: 'BATCH-2023-101',
        startTime: '2023-10-27T06:00:00Z',
        plannedQuantity: 1000,
        actualQuantity: 450,
        goodUnits: 445,
        defectiveUnits: 5,
        scrapUnits: 0,
        status: 'running',
        operators: [],
        qualityChecks: [],
        downtimeEvents: [],
        createdAt: new Date().toISOString(),
    }
];

export const mockOEEMetrics: OEEMetrics[] = [];

export const mockSafetyIncidents: SafetyIncident[] = [
    {
        incidentId: 'INC-001',
        incidentNumber: 'INC-2023-001',
        incidentType: { typeCode: 'INJ', typeName: 'Injury', category: 'injury' },
        severity: 'minor',
        reportedDate: '2023-10-20T14:30:00Z',
        incidentDate: '2023-10-20T14:00:00Z',
        incidentTime: '14:00',
        location: {
            plant: 'Plant A',
            building: 'B1',
            area: 'Warehouse',
            specificLocation: 'Aisle 3',
        },
        affectedPerson: {
            employeeId: 'EMP-050',
            employeeName: 'Mike Ross',
            department: 'Logistics',
            jobTitle: 'Forklift Driver',
        },
        description: 'Minor cut on finger while handling boxes',
        immediateAction: 'First aid applied',
        witnesses: [],
        investigation: {
            investigatorId: 'INV-001',
            investigatorName: 'Harvey Specter',
            investigationStartDate: '2023-10-21',
            findings: 'Gloves were not worn',
            evidenceCollected: [],
            interviewsConducted: [],
        },
        correctiveActions: [],
        status: 'closed',
        reportedBy: 'Mike Ross',
        createdAt: new Date().toISOString(),
    }
];

export const mockSafetyInspections: SafetyInspection[] = [];
export const mockPPE: PPEInventory[] = [];
export const mockSafetyTraining: SafetyTraining[] = [];

export const mockSettings: ManufacturingSettings = {
    settingsId: 'SET-MFG-001',
    organizationId: 'ORG-001',
    plantSettings: {
        targetOEE: 85,
        minimumAvailability: 90,
        maximumDowntime: 5,
        qualityTarget: 98,
    },
    maintenanceSettings: {
        preventiveMaintenanceFrequency: 30,
        criticalEquipmentInspectionDays: 7,
        workOrderAutoAssignment: true,
        maintenanceBudgetLimit: 50000,
    },
    safetySettings: {
        incidentReportingDeadline: 24,
        inspectionFrequency: 30,
        mandatoryTrainingRefresh: 365,
        ppeReorderThreshold: 10,
    },
    notifications: {
        equipmentDown: true,
        maintenanceOverdue: true,
        safetyIncident: true,
        lowOEE: true,
    },
    updatedAt: new Date().toISOString(),
};

export const mockAlerts: ManufacturingAlert[] = [];
