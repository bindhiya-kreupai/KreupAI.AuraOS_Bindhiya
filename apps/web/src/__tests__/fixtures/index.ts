/**
 * Test Fixtures Index
 * Central export for all test data fixtures
 */

export * from './users';
export * from './licenses';
export * from './master-data';

// Re-export commonly used fixtures for convenience
export { mockUsers, mockUsersList } from './users';
export { mockLicenses, mockLicensesList } from './licenses';
export {
  mockCountries,
  mockStates,
  mockCities,
  mockCurrencies,
  mockLanguages,
  mockMasterData,
} from './master-data';
