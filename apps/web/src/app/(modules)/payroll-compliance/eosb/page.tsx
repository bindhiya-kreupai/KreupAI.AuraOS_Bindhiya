// Canonical surface consolidation (AURA-068 / AURA-071): this module workspace
// was a standalone mock UI. It now re-exports the API-wired EOSB compliance
// dashboard so there is a single live surface for end-of-service benefits.
export { default } from '../../../dashboard/eosb-compliance/page';
