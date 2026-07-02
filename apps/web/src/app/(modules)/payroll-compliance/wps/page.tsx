// Canonical surface consolidation (AURA-068 / AURA-071): this module workspace
// was a standalone mock UI. It now re-exports the API-wired WPS compliance
// dashboard so there is a single live surface for UAE WPS.
export { default } from '../../../dashboard/wps-compliance/page';
