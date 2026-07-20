// Canonical surface consolidation (AURA-068 / AURA-071): this module workspace
// was a standalone mock UI. It now re-exports the API-wired GOSI compliance
// dashboard so there is a single live surface for KSA GOSI.
export { default } from '../../../dashboard/gosi-compliance/page';
