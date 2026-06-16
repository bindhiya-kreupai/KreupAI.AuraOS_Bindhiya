export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type Cadence = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'EVENT';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'OVERDUE';
