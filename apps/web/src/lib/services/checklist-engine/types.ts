export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type ItemStatus = 'PENDING' | 'COMPLIANT' | 'NON_COMPLIANT' | 'NA';
export type RunStatus = 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
