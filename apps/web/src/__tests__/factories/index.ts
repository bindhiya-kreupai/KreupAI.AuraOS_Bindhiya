/**
 * Test Data Factories Index
 * Central export for all test factories
 */

export { EmployeeFactory } from './employee.factory';
export { UserFactory } from './user.factory';
export { LeaveFactory } from './leave.factory';

/**
 * Reset all factories
 * Call this in beforeEach/afterEach to ensure test isolation
 */
export function resetAllFactories() {
  EmployeeFactory.reset();
  UserFactory.reset();
  LeaveFactory.reset();
}
