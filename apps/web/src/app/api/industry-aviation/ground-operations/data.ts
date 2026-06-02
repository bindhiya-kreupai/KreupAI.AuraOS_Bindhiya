// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.

import type {
    GroundStaffMember,
    TurnaroundAssignment,
    GroundEquipment,
    RampHandlingProcedure,
    SafetyCompliance
} from '@/app/dashboard/aviation/types';

export const mockGroundStaff: GroundStaffMember[] = [
    {
        staffId: 'STAFF-001',
        employeeId: 'EMP-001',
        personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            dateOfBirth: '1990-01-01',
        },
        role: 'ramp_agent',
        station: 'JFK',
        shift: {
            shiftId: 'SHIFT-001',
            shiftType: 'morning',
            startTime: '06:00',
            endTime: '14:00',
            breakSchedule: [],
        },
        certifications: [],
        equipmentQualifications: [],
        safetyRecords: [],
        performanceMetrics: {
            turnaroundsCompleted: 100,
            averageTurnaroundTime: 45,
            onTimePerformance: 95,
            safetyScore: 98,
            qualityScore: 90,
            equipmentDamageIncidents: 0,
            commendations: 5,
            monthlyMetrics: [],
        },
        status: 'active',
        createdAt: new Date().toISOString(),
    },
    {
        staffId: 'STAFF-002',
        employeeId: 'EMP-002',
        personalInfo: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1987654321',
            dateOfBirth: '1992-05-15',
        },
        role: 'baggage_handler',
        station: 'JFK',
        shift: {
            shiftId: 'SHIFT-002',
            shiftType: 'afternoon',
            startTime: '14:00',
            endTime: '22:00',
            breakSchedule: [],
        },
        certifications: [],
        equipmentQualifications: [],
        safetyRecords: [],
        performanceMetrics: {
            turnaroundsCompleted: 80,
            averageTurnaroundTime: 40,
            onTimePerformance: 92,
            safetyScore: 99,
            qualityScore: 95,
            equipmentDamageIncidents: 0,
            commendations: 3,
            monthlyMetrics: [],
        },
        status: 'active',
        createdAt: new Date().toISOString(),
    }
];

export const mockTurnarounds: TurnaroundAssignment[] = [
    {
        assignmentId: 'TA-001',
        flightNumber: 'AA123',
        aircraftRegistration: 'N123AA',
        aircraftType: 'B737',
        gate: 'A1',
        scheduledArrival: '2023-10-27T10:00:00Z',
        scheduledDeparture: '2023-10-27T11:00:00Z',
        turnaroundTime: 60,
        role: 'ramp_agent',
        tasks: [],
        status: 'scheduled',
    },
    {
        assignmentId: 'TA-002',
        flightNumber: 'DL456',
        aircraftRegistration: 'N456DL',
        aircraftType: 'A320',
        gate: 'B2',
        scheduledArrival: '2023-10-27T12:00:00Z',
        scheduledDeparture: '2023-10-27T13:00:00Z',
        turnaroundTime: 60,
        role: 'baggage_handler',
        tasks: [],
        status: 'in_progress',
    }
];

export const mockEquipment: GroundEquipment[] = [
    {
        equipmentId: 'EQ-001',
        equipmentType: 'tug',
        equipmentName: 'Tug 1',
        manufacturer: 'TugMaster',
        model: 'TM-500',
        serialNumber: 'SN-001',
        registrationNumber: 'REG-001',
        station: 'JFK',
        operationalStatus: 'operational',
        specifications: {},
        maintenanceSchedule: {
            lastMaintenance: '2023-10-01',
            nextMaintenanceDue: '2023-11-01',
            maintenanceInterval: 30,
            maintenanceType: 'calendar_based',
            maintenanceProvider: 'Internal',
            maintenanceHistory: [],
        },
        usageLog: [],
        location: {
            latitude: 40.6413,
            longitude: -73.7781,
            zone: 'Ramp A',
            lastUpdated: new Date().toISOString(),
        },
        inspections: [],
        createdAt: new Date().toISOString(),
    }
];

export const mockProcedures: RampHandlingProcedure[] = [];
export const mockSafetyCompliance: SafetyCompliance[] = [];
