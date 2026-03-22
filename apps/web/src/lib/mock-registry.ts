/**
 * @deprecated DEPRECATED — DO NOT USE
 *
 * This file is retained as a reference for which API endpoints were planned
 * but never implemented with real backends. Use this as a roadmap for
 * the feature-completion program.
 *
 * The catch-all route no longer serves this data. All unmatched API paths
 * now return 501 Not Implemented.
 *
 * See: docs/implementation/MOCK-INVENTORY.md
 * See: docs/implementation/MOCK-REGISTRY-REMEDIATION-PLAN.md
 */

// Type definitions for the registry (retained for reference)
type MockDataGenerator = () => unknown;
type MockRegistry = Record<string, MockDataGenerator | unknown>;

/**
 * REFERENCE ONLY — This data is no longer served to any API consumer.
 * Each key represents an API path that needs a real implementation.
 *
 * @deprecated Use the mock inventory document for tracking planned APIs.
 */
export const mockRegistryReference: MockRegistry = {
  // ==========================================================================
  // AGRICULTURE MODULE (No real API handlers exist)
  // ==========================================================================
  'industry-agriculture/seasonal-labor/workers': [],
  'industry-agriculture/housing/facilities': [],
  'industry-agriculture/crop-cycles': [],
  'industry-agriculture/analytics': {},
  'industry-agriculture/settings': {},

  // ==========================================================================
  // COLLABORATION MODULE (No real API handlers exist)
  // ==========================================================================
  'collaboration/whiteboards': [],
  'collaboration/kanban': [],
  'collaboration/standups': [],

  // ==========================================================================
  // MOBILE APP MODULE (notifications has a real handler)
  // ==========================================================================
  'mobile-app/config': {},
  'mobile-app/notifications': [], // Real handler exists at api/mobile-app/notifications
  'mobile-app/analytics': {},

  // ==========================================================================
  // ENERGY MODULE (No real API handlers exist)
  // ==========================================================================
  'energy/smart-grid/meters': [],
  'energy/water/meters': [],
  'energy/renewable-assets': [],
  'energy/settings': {},

  // ==========================================================================
  // ADMIN / MASTER DATA MODULE (Real handlers exist at api/master-data/[entity])
  // ==========================================================================
  'master-data/banks': [],
  'master-data/companies': [],
  'master-data/locations': [],
  'master-data/departments': [],

  // ==========================================================================
  // CONSTRUCTION MODULE (No real API handlers exist)
  // ==========================================================================
  'industry-construction/projects': [],
  'industry-construction/sites': [],

  // ==========================================================================
  // EDUCATION MODULE (No real API handlers exist)
  // ==========================================================================
  'industry-education/students': [],
  'industry-education/courses': [],

  // ==========================================================================
  // AUTOMOTIVE MODULE (No real API handlers exist)
  // ==========================================================================
  'industry-automotive/vehicles': [],
};

// getMockData is intentionally removed. The catch-all route now returns 501 Not Implemented.
// If you need mock data for testing, use the @aura/testing package's Prisma mock utilities.
