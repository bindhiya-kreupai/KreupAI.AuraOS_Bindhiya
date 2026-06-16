export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type KpiDirection = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'EXACT';
export type KpiStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'RETIRED';
export type RagStatus = 'GREEN' | 'AMBER' | 'RED';
