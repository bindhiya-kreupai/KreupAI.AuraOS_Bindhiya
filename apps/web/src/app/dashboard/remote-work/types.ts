export type EquipmentStatus = 'assigned' | 'available' | 'maintenance' | 'retired';

export interface RemotePolicy {
    id: string;
    name: string;
    description: string;
    type: string;
    version: string;
    updatedAt: string;
}

export interface RemoteEmployee {
    employeeId: string;
    employeeName: string;
    position: string;
    location: string;
    timezone: string;
    workSchedule: WorkSchedule;
    equipment: Equipment[];
    productivity: ProductivityMetrics;
    wellbeing: WellbeingMetrics;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface WorkSchedule {
    scheduleType: 'fixed' | 'flexible';
    coreHours?: { start: string; end: string; };
    preferredHours?: { start: string; end: string; };
}

export interface Equipment {
    equipmentId: string;
    equipmentType: string;
    serialNumber: string;
    assignedDate: string;
    returnDate?: string;
    status: EquipmentStatus;
}

export interface ProductivityMetrics {
    tasksCompleted: number;
    averageResponseTime: number;
    meetingAttendance: number;
    performanceRating: number;
}

export interface WellbeingMetrics {
    burnoutRisk: 'low' | 'medium' | 'high';
    lastCheckIn: string;
    supportNeeded: boolean;
}

export interface RemoteWorkSettings {
    settingsId: string;
    organizationId: string;
    policySettings: {
        allowedLocations: string[];
        equipmentProvided: boolean;
    };
    productivitySettings: {
        trackingEnabled: boolean;
        reportingFrequency: string;
    };
    wellbeingSettings: {
        checkInFrequency: number;
        supportProgramsEnabled: boolean;
    };
    notifications: {
        equipmentAssignment: boolean;
        wellbeingAlert: boolean;
        productivityReport: boolean;
    };
    updatedAt: string;
}

export interface RemoteWorkAlert {
    alertId: string;
    alertType: 'equipment' | 'productivity' | 'wellbeing';
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    relatedEntity: {
        entityType: string;
        entityId: string;
    };
    status: 'active' | 'resolved';
    createdAt: string;
}
