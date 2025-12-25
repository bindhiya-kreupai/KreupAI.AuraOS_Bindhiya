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
    static async getPlans(filters?: { category?: string; planYear?: string; status?: string }): Promise<BenefitPlan[]> {
        return APIClient.get<BenefitPlan[]>('/benefits/plans', filters);
    }

    static async getPlan(id: string): Promise<BenefitPlan | null> {
        return APIClient.get<BenefitPlan>(`/benefits/plans/${id}`);
    }

    static async createPlan(plan: BenefitPlan): Promise<BenefitPlan> {
        return APIClient.post<BenefitPlan>('/benefits/plans', plan);
    }

    static async updatePlan(id: string, updates: Partial<BenefitPlan>): Promise<BenefitPlan> {
        return APIClient.put<BenefitPlan>(`/benefits/plans/${id}`, updates);
    }

    static async deletePlan(id: string): Promise<void> {
        return APIClient.delete(`/benefits/plans/${id}`);
    }
}

export class EnrollmentService {
    static async getEnrollments(filters?: {
        employeeId?: string;
        enrollmentWindowId?: string;
        status?: EnrollmentStatus;
    }): Promise<BenefitEnrollment[]> {
        return APIClient.get<BenefitEnrollment[]>('/benefits/enrollments', filters);
    }

    static async getEnrollment(id: string): Promise<BenefitEnrollment | null> {
        return APIClient.get<BenefitEnrollment>(`/benefits/enrollments/${id}`);
    }

    static async createEnrollment(enrollment: BenefitEnrollment): Promise<BenefitEnrollment> {
        return APIClient.post<BenefitEnrollment>('/benefits/enrollments', enrollment);
    }

    static async updateEnrollment(id: string, updates: Partial<BenefitEnrollment>): Promise<BenefitEnrollment> {
        return APIClient.put<BenefitEnrollment>(`/benefits/enrollments/${id}`, updates);
    }

    static async submitEnrollment(id: string): Promise<BenefitEnrollment> {
        return APIClient.post<BenefitEnrollment>(`/benefits/enrollments/${id}/submit`, {});
    }

    static async confirmEnrollment(id: string, approvedBy: string): Promise<BenefitEnrollment> {
        return APIClient.post<BenefitEnrollment>(`/benefits/enrollments/${id}/confirm`, { approvedBy });
    }

    static async cancelEnrollment(id: string, reason?: string): Promise<BenefitEnrollment> {
        return APIClient.post<BenefitEnrollment>(`/benefits/enrollments/${id}/cancel`, { reason });
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
    static async getDependents(filters?: { employeeId?: string; status?: DependentStatus }): Promise<Dependent[]> {
        return APIClient.get<Dependent[]>('/benefits/dependents', filters);
    }

    static async createDependent(dependent: Dependent): Promise<Dependent> {
        return APIClient.post<Dependent>('/benefits/dependents', dependent);
    }

    static async updateDependent(id: string, updates: Partial<Dependent>): Promise<Dependent> {
        return APIClient.put<Dependent>(`/benefits/dependents/${id}`, updates);
    }

    static async verifyDependent(id: string, verifiedBy: string): Promise<Dependent> {
        return APIClient.post<Dependent>(`/benefits/dependents/${id}/verify`, { verifiedBy });
    }

    static async deleteDependent(id: string): Promise<void> {
        return APIClient.delete(`/benefits/dependents/${id}`);
    }
}

export class ClaimService {
    static async getClaims(filters?: { employeeId?: string; status?: ClaimStatus }): Promise<BenefitClaim[]> {
        return APIClient.get<BenefitClaim[]>('/benefits/claims', filters);
    }

    static async createClaim(claim: BenefitClaim): Promise<BenefitClaim> {
        return APIClient.post<BenefitClaim>('/benefits/claims', claim);
    }

    static async updateClaim(id: string, updates: Partial<BenefitClaim>): Promise<BenefitClaim> {
        return APIClient.put<BenefitClaim>(`/benefits/claims/${id}`, updates);
    }

    static async approveClaim(id: string, processedBy: string, approvedAmount: number): Promise<BenefitClaim> {
        return APIClient.post<BenefitClaim>(`/benefits/claims/${id}/approve`, { processedBy, approvedAmount });
    }

    static async denyClaim(id: string, processedBy: string, reason: string): Promise<BenefitClaim> {
        return APIClient.post<BenefitClaim>(`/benefits/claims/${id}/deny`, { processedBy, reason });
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
        return APIClient.get<BenefitStats>('/benefits/analytics/stats');
    }
}
