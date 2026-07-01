// Canonical surface consolidation (AURA-068 / AURA-071): this module workspace
// was a standalone mock UI. It now re-exports the API-wired India Statutory
// calculators dashboard so there is a single live surface.
export { default } from '../../../dashboard/payroll-compliance/india-statutory/page';
