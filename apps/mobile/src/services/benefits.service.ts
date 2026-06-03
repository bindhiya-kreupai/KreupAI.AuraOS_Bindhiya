/**
 * Benefits Service (mobile)
 * Bridges the React Native client to the AuraOS /api/v1/benefits surface
 * built in #108. Surfaces enrollments, claims, and the transition endpoint.
 */

import { apiService } from './api.service';

export type BenefitsClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'PENDING_INFO';

export type BenefitCategory =
  | 'MEDICAL'
  | 'DENTAL'
  | 'VISION'
  | 'LIFE'
  | 'DISABILITY'
  | 'RETIREMENT'
  | 'WELLNESS'
  | 'OTHER';

export interface BenefitsClaim {
  id: string;
  claimNumber: string;
  claimType: BenefitCategory;
  claimDate: string;
  serviceDate: string;
  providerName?: string;
  claimAmount: number;
  approvedAmount?: number;
  paidAmount?: number;
  status: BenefitsClaimStatus;
  rejectionReason?: string;
}

export interface BenefitsClaimsListResponse {
  items: BenefitsClaim[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

class BenefitsService {
  async getClaims(params?: {
    status?: BenefitsClaimStatus;
    page?: number;
    limit?: number;
  }): Promise<BenefitsClaimsListResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const response = await apiService.get<BenefitsClaimsListResponse>(
      `/v1/benefits/claims?${query.toString()}`
    );
    return response;
  }

  async submitClaim(input: {
    enrollmentId: string;
    claimType: BenefitCategory;
    claimDate: string;
    serviceDate: string;
    claimAmount: number;
    providerName?: string;
    notes?: string;
    diagnosisCodes?: string[];
    procedureCodes?: string[];
  }): Promise<BenefitsClaim> {
    const response = await apiService.post<{ data: BenefitsClaim }>(
      '/v1/benefits/claims',
      {
        claimNumber: `MOB-${Date.now()}`,
        ...input,
      }
    );
    return response.data;
  }

  /**
   * Manager-side action — surfaces the transition endpoint built in PR #119.
   * Mobile UI uses this for: approve, reject, request-info, mark-paid.
   */
  async transitionClaim(
    claimId: string,
    action: 'startReview' | 'requestInfo' | 'approve' | 'markPaid' | 'reject',
    payload?: Record<string, unknown>
  ): Promise<BenefitsClaim> {
    const response = await apiService.post<{ data: BenefitsClaim }>(
      `/v1/benefits/claims/${claimId}/transition`,
      { action, ...payload }
    );
    return response.data;
  }
}

export const benefitsService = new BenefitsService();
