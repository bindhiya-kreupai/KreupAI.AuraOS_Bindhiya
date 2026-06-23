export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type WpsStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'VALIDATED'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'RECONCILED'
  | 'REJECTED';
