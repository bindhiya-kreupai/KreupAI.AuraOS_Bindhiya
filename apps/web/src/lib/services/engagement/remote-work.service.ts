// @ts-nocheck — Has Prisma schema drift (select/where fields don't match current schema). Tracked under #29.
import { BaseService, ServiceResponse } from '../base.service';

/**
 * Remote Work Service - Remote work policies, equipment tracking, and productivity analytics
 */

export interface RemoteWorkPolicy {
    id: string;
    name: string;
    description: string;
    type: 'full-remote' | 'hybrid' | 'flexible' | 'office-first';
    eligibilityCriteria: string[];
    approvalRequired: boolean;
    maxRemoteDays?: number;
    coreHours?: { start: string; end: string };
    communicationRequirements: string[];
    equipmentProvided: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface RemoteWorkAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    policyId: string;
    policyName: string;
    workLocation: 'home' | 'coworking' | 'hybrid' | 'office';
    startDate: Date;
    endDate?: Date;
    remoteDays: string[];
    status: 'pending' | 'approved' | 'active' | 'expired' | 'revoked';
    approvedBy?: string;
    equipment: EquipmentItem[];
    createdAt: Date;
}

export interface EquipmentItem {
    id: string;
    name: string;
    type: 'laptop' | 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'webcam' | 'chair' | 'desk' | 'other';
    serialNumber?: string;
    assignedDate: Date;
    returnDate?: Date;
    condition: 'new' | 'good' | 'fair' | 'poor';
    value: number;
    status: 'assigned' | 'returned' | 'lost' | 'damaged';
}

export interface ProductivityMetrics {
    employeeId: string;
    period: string;
    tasksCompleted: number;
    meetingsAttended: number;
    responseTime: number; // hours
    collaborationScore: number;
    availabilityScore: number;
    overallProductivity: number;
}

export interface TeamCollaborationMetrics {
    departmentId: string;
    departmentName: string;
    totalMembers: number;
    remoteWorkers: number;
    hybridWorkers: number;
    officeWorkers: number;
    avgResponseTime: number;
    meetingsPerWeek: number;
    collaborationTools: string[];
    engagementScore: number;
}

export interface RemoteWorkRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    requestType: 'permanent' | 'temporary' | 'extension';
    policyId: string;
    proposedDays: string[];
    reason: string;
    startDate: Date;
    endDate?: Date;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    comments?: string;
}

export class RemoteWorkService extends BaseService {
    /**
     * Get all remote work policies
     */
    async getPolicies(tenantId: string): Promise<ServiceResponse<RemoteWorkPolicy[]>> {
        try {
            const policies: RemoteWorkPolicy[] = [
                {
                    id: 'pol-1',
                    name: 'Full Remote',
                    description: 'Work entirely from home or approved location',
                    type: 'full-remote',
                    eligibilityCriteria: ['6+ months tenure', 'Role suitable for remote work', 'Manager approval'],
                    approvalRequired: true,
                    communicationRequirements: ['Available during core hours', 'Daily check-ins', 'Weekly team meetings'],
                    equipmentProvided: ['Laptop', 'Monitor', 'Headset'],
                    isActive: true,
                    createdAt: new Date(),
                },
                {
                    id: 'pol-2',
                    name: 'Hybrid Work',
                    description: 'Mix of office and remote work',
                    type: 'hybrid',
                    eligibilityCriteria: ['3+ months tenure', 'Manager approval'],
                    approvalRequired: false,
                    maxRemoteDays: 3,
                    coreHours: { start: '10:00', end: '16:00' },
                    communicationRequirements: ['Team sync meetings', 'Calendar blocked for availability'],
                    equipmentProvided: ['Laptop'],
                    isActive: true,
                    createdAt: new Date(),
                },
                {
                    id: 'pol-3',
                    name: 'Flexible Work',
                    description: 'Flexible hours and location with some requirements',
                    type: 'flexible',
                    eligibilityCriteria: ['Probation completed', 'Performance metrics met'],
                    approvalRequired: false,
                    maxRemoteDays: 2,
                    communicationRequirements: ['Respond within 4 hours during work hours'],
                    equipmentProvided: ['Laptop'],
                    isActive: true,
                    createdAt: new Date(),
                },
            ];

            return { success: true, data: policies };
        } catch (error: any) {
            console.error('Error fetching remote work policies:', error);
            return { success: false, error: 'Failed to fetch policies' };
        }
    }

    /**
     * Get remote work assignments
     */
    async getAssignments(
        tenantId: string,
        departmentId?: string
    ): Promise<ServiceResponse<RemoteWorkAssignment[]>> {
        try {
            let assignments: RemoteWorkAssignment[] = [
                {
                    id: 'assign-1',
                    employeeId: 'emp-1',
                    employeeName: 'John Smith',
                    department: 'Engineering',
                    policyId: 'pol-1',
                    policyName: 'Full Remote',
                    workLocation: 'home',
                    startDate: new Date('2025-01-01'),
                    remoteDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    status: 'active',
                    approvedBy: 'manager-1',
                    equipment: [
                        { id: 'eq-1', name: 'MacBook Pro', type: 'laptop', serialNumber: 'MBP-12345', assignedDate: new Date('2025-01-01'), condition: 'new', value: 2500, status: 'assigned' },
                        { id: 'eq-2', name: 'Dell Monitor', type: 'monitor', assignedDate: new Date('2025-01-01'), condition: 'new', value: 400, status: 'assigned' },
                    ],
                    createdAt: new Date(),
                },
                {
                    id: 'assign-2',
                    employeeId: 'emp-2',
                    employeeName: 'Sarah Johnson',
                    department: 'Marketing',
                    policyId: 'pol-2',
                    policyName: 'Hybrid Work',
                    workLocation: 'hybrid',
                    startDate: new Date('2025-02-01'),
                    remoteDays: ['Monday', 'Wednesday', 'Friday'],
                    status: 'active',
                    equipment: [
                        { id: 'eq-3', name: 'ThinkPad', type: 'laptop', serialNumber: 'TP-67890', assignedDate: new Date('2025-02-01'), condition: 'good', value: 1800, status: 'assigned' },
                    ],
                    createdAt: new Date(),
                },
            ];

            return { success: true, data: assignments };
        } catch (error: any) {
            console.error('Error fetching remote work assignments:', error);
            return { success: false, error: 'Failed to fetch assignments' };
        }
    }

    /**
     * Get equipment inventory
     */
    async getEquipmentInventory(tenantId: string): Promise<ServiceResponse<EquipmentItem[]>> {
        try {
            const inventory: EquipmentItem[] = [
                { id: 'eq-1', name: 'MacBook Pro 16"', type: 'laptop', serialNumber: 'MBP-12345', assignedDate: new Date(), condition: 'new', value: 2500, status: 'assigned' },
                { id: 'eq-2', name: 'Dell UltraSharp 27"', type: 'monitor', serialNumber: 'DU-54321', assignedDate: new Date(), condition: 'new', value: 400, status: 'assigned' },
                { id: 'eq-3', name: 'ThinkPad X1 Carbon', type: 'laptop', serialNumber: 'TP-67890', assignedDate: new Date(), condition: 'good', value: 1800, status: 'assigned' },
                { id: 'eq-4', name: 'Jabra Evolve2 85', type: 'headset', condition: 'new', value: 350, status: 'assigned', assignedDate: new Date() },
                { id: 'eq-5', name: 'Logitech MX Keys', type: 'keyboard', condition: 'good', value: 100, status: 'assigned', assignedDate: new Date() },
                { id: 'eq-6', name: 'Herman Miller Chair', type: 'chair', condition: 'new', value: 1200, status: 'assigned', assignedDate: new Date() },
            ];

            return { success: true, data: inventory };
        } catch (error: any) {
            console.error('Error fetching equipment inventory:', error);
            return { success: false, error: 'Failed to fetch inventory' };
        }
    }

    /**
     * Get team collaboration metrics
     */
    async getTeamMetrics(tenantId: string): Promise<ServiceResponse<TeamCollaborationMetrics[]>> {
        try {
            const metrics: TeamCollaborationMetrics[] = [
                {
                    departmentId: 'dept-1',
                    departmentName: 'Engineering',
                    totalMembers: 25,
                    remoteWorkers: 10,
                    hybridWorkers: 12,
                    officeWorkers: 3,
                    avgResponseTime: 1.5,
                    meetingsPerWeek: 8,
                    collaborationTools: ['Slack', 'GitHub', 'Jira', 'Zoom'],
                    engagementScore: 85,
                },
                {
                    departmentId: 'dept-2',
                    departmentName: 'Marketing',
                    totalMembers: 15,
                    remoteWorkers: 5,
                    hybridWorkers: 8,
                    officeWorkers: 2,
                    avgResponseTime: 2.0,
                    meetingsPerWeek: 12,
                    collaborationTools: ['Slack', 'Figma', 'Asana', 'Zoom'],
                    engagementScore: 82,
                },
                {
                    departmentId: 'dept-3',
                    departmentName: 'Sales',
                    totalMembers: 20,
                    remoteWorkers: 15,
                    hybridWorkers: 3,
                    officeWorkers: 2,
                    avgResponseTime: 0.5,
                    meetingsPerWeek: 15,
                    collaborationTools: ['Slack', 'Salesforce', 'Zoom', 'Gong'],
                    engagementScore: 88,
                },
            ];

            return { success: true, data: metrics };
        } catch (error: any) {
            console.error('Error fetching team metrics:', error);
            return { success: false, error: 'Failed to fetch team metrics' };
        }
    }

    /**
     * Get remote work requests
     */
    async getRequests(
        tenantId: string,
        status?: 'pending' | 'approved' | 'rejected'
    ): Promise<ServiceResponse<RemoteWorkRequest[]>> {
        try {
            let requests: RemoteWorkRequest[] = [
                {
                    id: 'req-1',
                    employeeId: 'emp-3',
                    employeeName: 'Mike Williams',
                    requestType: 'permanent',
                    policyId: 'pol-1',
                    proposedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    reason: 'Relocating to another city',
                    startDate: new Date('2026-02-01'),
                    status: 'pending',
                    submittedAt: new Date(),
                },
                {
                    id: 'req-2',
                    employeeId: 'emp-4',
                    employeeName: 'Emily Brown',
                    requestType: 'temporary',
                    policyId: 'pol-2',
                    proposedDays: ['Monday', 'Friday'],
                    reason: 'Child care arrangements',
                    startDate: new Date('2026-01-15'),
                    endDate: new Date('2026-03-15'),
                    status: 'approved',
                    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    reviewedBy: 'manager-2',
                },
            ];

            if (status) {
                requests = requests.filter(r => r.status === status);
            }

            return { success: true, data: requests };
        } catch (error: any) {
            console.error('Error fetching remote work requests:', error);
            return { success: false, error: 'Failed to fetch requests' };
        }
    }

    /**
     * Submit remote work request
     */
    async submitRequest(
        tenantId: string,
        request: Omit<RemoteWorkRequest, 'id' | 'status' | 'submittedAt'>,
        userId: string,
        ipAddress: string
    ): Promise<ServiceResponse<RemoteWorkRequest>> {
        try {
            const newRequest: RemoteWorkRequest = {
                ...request,
                id: `req-${Date.now()}`,
                status: 'pending',
                submittedAt: new Date(),
            };

            await this.createAuditLog({
                userId,
                action: 'REMOTE_WORK_REQUEST_SUBMITTED',
                module: 'Remote Work',
                details: `Submitted ${request.requestType} remote work request`,
                ipAddress,
            });

            return { success: true, data: newRequest };
        } catch (error: any) {
            console.error('Error submitting remote work request:', error);
            return { success: false, error: 'Failed to submit request' };
        }
    }

    /**
     * Approve/Reject remote work request
     */
    async reviewRequest(
        tenantId: string,
        requestId: string,
        decision: 'approved' | 'rejected',
        comments: string,
        reviewerId: string,
        ipAddress: string
    ): Promise<ServiceResponse<RemoteWorkRequest>> {
        try {
            const request: RemoteWorkRequest = {
                id: requestId,
                employeeId: 'emp-3',
                employeeName: 'Mike Williams',
                requestType: 'permanent',
                policyId: 'pol-1',
                proposedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                reason: 'Relocating to another city',
                startDate: new Date('2026-02-01'),
                status: decision,
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                reviewedAt: new Date(),
                reviewedBy: reviewerId,
                comments,
            };

            await this.createAuditLog({
                userId: reviewerId,
                action: `REMOTE_WORK_REQUEST_${decision.toUpperCase()}`,
                module: 'Remote Work',
                details: `${decision} remote work request ${requestId}`,
                ipAddress,
            });

            return { success: true, data: request };
        } catch (error: any) {
            console.error('Error reviewing remote work request:', error);
            return { success: false, error: 'Failed to review request' };
        }
    }

    /**
     * Assign equipment to employee
     */
    async assignEquipment(
        tenantId: string,
        employeeId: string,
        equipment: Omit<EquipmentItem, 'id' | 'assignedDate' | 'status'>,
        assignedBy: string,
        ipAddress: string
    ): Promise<ServiceResponse<EquipmentItem>> {
        try {
            const newEquipment: EquipmentItem = {
                ...equipment,
                id: `eq-${Date.now()}`,
                assignedDate: new Date(),
                status: 'assigned',
            };

            await this.createAuditLog({
                userId: assignedBy,
                action: 'EQUIPMENT_ASSIGNED',
                module: 'Remote Work',
                details: `Assigned ${equipment.name} to employee ${employeeId}`,
                ipAddress,
            });

            return { success: true, data: newEquipment };
        } catch (error: any) {
            console.error('Error assigning equipment:', error);
            return { success: false, error: 'Failed to assign equipment' };
        }
    }

    /**
     * Get remote work statistics
     */
    async getStatistics(tenantId: string): Promise<ServiceResponse<{
        totalRemoteWorkers: number;
        totalHybridWorkers: number;
        totalOfficeWorkers: number;
        pendingRequests: number;
        equipmentValue: number;
        avgProductivity: number;
    }>> {
        try {
            return {
                success: true,
                data: {
                    totalRemoteWorkers: 45,
                    totalHybridWorkers: 120,
                    totalOfficeWorkers: 35,
                    pendingRequests: 8,
                    equipmentValue: 185000,
                    avgProductivity: 87,
                },
            };
        } catch (error: any) {
            console.error('Error fetching remote work statistics:', error);
            return { success: false, error: 'Failed to fetch statistics' };
        }
    }
}

export const remoteWorkService = new RemoteWorkService();
