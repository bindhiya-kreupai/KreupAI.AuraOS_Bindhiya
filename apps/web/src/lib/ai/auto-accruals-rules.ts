export function accrualStatus(
  current: number,
  accrued: number
): { status: 'Normal' | 'Warning'; reason?: string } {
  const projected = current + accrued;
  return projected > 30
    ? {
        status: 'Warning',
        reason: 'Projected balance exceeds the standard 30-day review threshold.',
      }
    : { status: 'Normal' };
}

export const ACCRUAL_RULES = [
  {
    id: 'monthly-policy',
    name: 'Policy-based monthly accrual',
    logic: 'Uses approved monthly leave-policy entitlements.',
  },
  {
    id: 'audit-preview',
    name: 'Preview is non-mutating',
    logic: 'Dry runs are recorded without creating leave accrual entries.',
  },
];
