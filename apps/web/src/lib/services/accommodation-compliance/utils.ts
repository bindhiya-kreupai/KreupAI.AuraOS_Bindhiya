/**
 * Pure helper functions for Accommodation Compliance module
 * safe to import in client-side Next.js components.
 */

export function isComplaintSlaBreached(complaint: {
  raisedAt: Date | string;
  slaHours: number;
  status: string;
}): boolean {
  if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') return false;
  const ageHours = (Date.now() - new Date(complaint.raisedAt).getTime()) / (3600 * 1000);
  return ageHours > complaint.slaHours;
}
