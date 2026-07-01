// Consolidated (AURA-021): equity-management is the single canonical equity /
// stock-grants page. This route re-exports it so both URLs render one
// implementation backed by /api/compensation/stock-grants.
export { default } from '../equity-management/page';
