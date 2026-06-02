// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * Benefits Management Module - Service Layer
 *
 * API-integrated service layer using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
    BenefitPlan,
    BenefitEnrollment,
    EnrollmentWindow,
    Dependent,
    BenefitClaim,
    HealthcareProvider,
    QualifyingEvent,
    PremiumDeduction,
    EmployeeEligibility,
    BenefitSettings,
    BenefitStats,
    EnrollmentStatus,
    ClaimStatus,
    DependentStatus,
} from './types';

export class BenefitPlanService {
    static async getPlans(filters?: { category?: string; planYear?: string; status?: string }): Promise<{ success: boolean; data: BenefitPlan[]; pagination?: any }> {
        try {
            const response = await APIClient.get<{ success: boolean; data: BenefitPlan[]; pagination?: any }>('/benefits/plans', filters);
            return response || { success: false, data: [] };
        } catch (error: any) {
            return { success: false, data: [] };
        }
    }

    static async getPlan(id: string): Promise<{ success: boolean; data?: BenefitPlan }> {
        return APIClient.get<{ success: boolean; data?: BenefitPlan }>(`/benefits/plans?id=${id}`);
    }

    static async createPlan(plan: Omit<BenefitPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: BenefitPlan }> {
        return APIClient.post<{ success: boolean; data?: BenefitPlan }>('/benefits/plans', plan);
    }

    static async updatePlan(id: string, updates: Partial<BenefitPlan>): Promise<{ success: boolean; data?: BenefitPlan }> {
        return APIClient.put<{ success: boolean; data?: BenefitPlan }>('/benefits/plans', { id, ...updates });
    }

    static async deletePlan(id: string): Promise<{ success: boolean; message?: string }> {
        return APIClient.delete<{ success: boolean; message?: string }>(`/benefits/plans?id=${id}`);
    }
}

export class EnrollmentService {
    static async getEnrollments(filters?: {
        employeeId?: string;
        enrollmentWindowId?: string;
        status?: EnrollmentStatus;
    }): Promise<{ success: boolean; data: BenefitEnrollment[]; pagination?: any }> {
        try {
            const response = await APIClient.get<{ success: boolean; data: BenefitEnrollment[]; pagination?: any }>('/benefits/enrollments', filters);
            return response || { success: false, data: [] };
        } catch (error: any) {
            return { success: false, data: [] };
        }
    }

    static async getEnrollment(id: string): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return APIClient.get<{ success: boolean; data?: BenefitEnrollment }>(`/benefits/enrollments?id=${id}`);
    }

    static async createEnrollment(enrollment: Omit<BenefitEnrollment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return APIClient.post<{ success: boolean; data?: BenefitEnrollment }>('/benefits/enrollments', enrollment);
    }

    static async updateEnrollment(id: string, updates: Partial<BenefitEnrollment>): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return APIClient.put<{ success: boolean; data?: BenefitEnrollment }>('/benefits/enrollments', { id, ...updates });
    }

    static async submitEnrollment(id: string): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return this.updateEnrollment(id, { status: 'PENDING_APPROVAL' });
    }

    static async confirmEnrollment(id: string, approvedBy: string): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return this.updateEnrollment(id, { status: 'APPROVED', approvedBy });
    }

    static async cancelEnrollment(id: string, reason?: string): Promise<{ success: boolean; data?: BenefitEnrollment }> {
        return this.updateEnrollment(id, { status: 'CANCELLED', cancellationReason: reason });
    }
}

export class EnrollmentWindowService {
    static async getWindows(filters?: { type?: string; isActive?: boolean }): Promise<EnrollmentWindow[]> {
        return APIClient.get<EnrollmentWindow[]>('/benefits/enrollment-windows', filters);
    }

    static async getCurrentWindow(): Promise<EnrollmentWindow | null> {
        return APIClient.get<EnrollmentWindow>('/benefits/enrollment-windows/current');
    }

    static async createWindow(window: EnrollmentWindow): Promise<EnrollmentWindow> {
        return APIClient.post<EnrollmentWindow>('/benefits/enrollment-windows', window);
    }

    static async updateWindow(id: string, updates: Partial<EnrollmentWindow>): Promise<EnrollmentWindow> {
        return APIClient.put<EnrollmentWindow>(`/benefits/enrollment-windows/${id}`, updates);
    }
}

export class DependentService {
    static async getDependents(filters?: { employeeId?: string; status?: DependentStatus }): Promise<{ success: boolean; data: Dependent[]; pagination?: any }> {
        try {
            const response = await APIClient.get<{ success: boolean; data: Dependent[]; pagination?: any }>('/benefits/dependents', filters);
            return response || { success: false, data: [] };
        } catch (error: any) {
            return { success: false, data: [] };
        }
    }

    static async createDependent(dependent: Omit<Dependent, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Dependent }> {
        return APIClient.post<{ success: boolean; data?: Dependent }>('/benefits/dependents', dependent);
    }

    static async updateDependent(id: string, updates: Partial<Dependent>): Promise<{ success: boolean; data?: Dependent }> {
        return APIClient.put<{ success: boolean; data?: Dependent }>('/benefits/dependents', { id, ...updates });
    }

    static async verifyDependent(id: string, verifiedBy: string): Promise<{ success: boolean; data?: Dependent }> {
        return this.updateDependent(id, { status: 'VERIFIED', verifiedBy });
    }

    static async deleteDependent(id: string): Promise<{ success: boolean; message?: string }> {
        return APIClient.delete<{ success: boolean; message?: string }>(`/benefits/dependents?id=${id}`);
    }
}

export class ClaimService {
    static async getClaims(filters?: { employeeId?: string; status?: ClaimStatus }): Promise<{ success: boolean; data: BenefitClaim[]; pagination?: any }> {
        try {
            const response = await APIClient.get<{ success: boolean; data: BenefitClaim[]; pagination?: any }>('/benefits/claims', filters);
            return response || { success: false, data: [] };
        } catch (error: any) {
            return { success: false, data: [] };
        }
    }

    static async createClaim(claim: Omit<BenefitClaim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: BenefitClaim }> {
        return APIClient.post<{ success: boolean; data?: BenefitClaim }>('/benefits/claims', claim);
    }

    static async updateClaim(id: string, updates: Partial<BenefitClaim>): Promise<{ success: boolean; data?: BenefitClaim }> {
        return APIClient.put<{ success: boolean; data?: BenefitClaim }>('/benefits/claims', { id, ...updates });
    }

    static async approveClaim(id: string, approvedBy: string, approvedAmount: number): Promise<{ success: boolean; data?: BenefitClaim }> {
        return this.updateClaim(id, { status: 'APPROVED', approvedBy, approvedAmount });
    }

    static async denyClaim(id: string, processedBy: string, reason: string): Promise<{ success: boolean; data?: BenefitClaim }> {
        return this.updateClaim(id, { status: 'REJECTED', rejectionReason: reason });
    }
}

export class ProviderService {
    static async getProviders(filters?: { type?: string; providerType?: string }): Promise<HealthcareProvider[]> {
        return APIClient.get<HealthcareProvider[]>('/benefits/providers', filters);
    }

    static async searchProviders(query: string, location?: { latitude: number; longitude: number; radius: number }): Promise<HealthcareProvider[]> {
        return APIClient.post<HealthcareProvider[]>('/benefits/providers/search', { query, location });
    }
}

export class QualifyingEventService {
    static async getEvents(filters?: { employeeId?: string; status?: string }): Promise<QualifyingEvent[]> {
        return APIClient.get<QualifyingEvent[]>('/benefits/qualifying-events', filters);
    }

    static async createEvent(event: QualifyingEvent): Promise<QualifyingEvent> {
        return APIClient.post<QualifyingEvent>('/benefits/qualifying-events', event);
    }

    static async verifyEvent(id: string, verifiedBy: string): Promise<QualifyingEvent> {
        return APIClient.post<QualifyingEvent>(`/benefits/qualifying-events/${id}/verify`, { verifiedBy });
    }
}

export class PremiumService {
    static async getDeductions(filters?: { employeeId?: string; payrollPeriodStart?: string }): Promise<PremiumDeduction[]> {
        return APIClient.get<PremiumDeduction[]>('/benefits/premiums', filters);
    }

    static async calculatePremium(enrollmentId: string): Promise<{
        employeeContribution: number;
        employerContribution: number;
        totalPremium: number;
    }> {
        return APIClient.post('/benefits/premiums/calculate', { enrollmentId });
    }
}

export class EligibilityService {
    static async checkEligibility(employeeId: string, benefitPlanId: string): Promise<EmployeeEligibility> {
        return APIClient.post<EmployeeEligibility>('/benefits/eligibility/check', { employeeId, benefitPlanId });
    }

    static async getEmployeeEligibility(employeeId: string): Promise<EmployeeEligibility[]> {
        return APIClient.get<EmployeeEligibility[]>(`/benefits/eligibility/employee/${employeeId}`);
    }
}

export class BenefitSettingsService {
    static async getSettings(): Promise<BenefitSettings | null> {
        return APIClient.get<BenefitSettings>('/benefits/settings');
    }

    static async updateSettings(updates: Partial<BenefitSettings>): Promise<BenefitSettings> {
        return APIClient.put<BenefitSettings>('/benefits/settings', updates);
    }
}

export class BenefitAnalyticsService {
    static async getStats(): Promise<BenefitStats> {
        return APIClient.get<BenefitStats>('/benefits/analytics');
    }
}
