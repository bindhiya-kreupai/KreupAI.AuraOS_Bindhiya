/**
 * Pure, UI-side helpers shared by the payroll-compliance risk views. These
 * mirror the server-side `riskBand` derivation in
 * `@/lib/services/payroll-compliance` so the heat map and register views band
 * consistently without a round-trip. Kept side-effect-free for unit testing.
 */

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Band a likelihood×impact score exactly as the service does. */
export function bandForScore(score: number): RiskBand {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

/** Governance review cadence (days) before a control is considered overdue. */
export function reviewCadenceDays(frequency: string): number {
  if (frequency === 'WEEKLY') return 7;
  if (frequency === 'QUARTERLY') return 95;
  if (frequency === 'ANNUAL') return 370;
  return 35; // MONTHLY / default
}

/** True when a control's last review is older than its cadence allows. */
export function isControlOverdue(
  lastReviewedAt: string | null,
  frequency: string,
  now: number = Date.now()
): boolean {
  const last = lastReviewedAt ? new Date(lastReviewedAt).getTime() : 0;
  const ageDays = (now - last) / 86_400_000;
  return ageDays > reviewCadenceDays(frequency);
}
