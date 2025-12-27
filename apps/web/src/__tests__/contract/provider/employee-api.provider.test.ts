/**
 * Employee API Provider Contract Tests
 * Week 15-16: Contract Testing & API Testing
 *
 * Provider verification tests for Employee API
 * Verifies that the provider meets consumer expectations
 */

import { Verifier, VerifierOptions } from '@pact-foundation/pact';
import path from 'path';

describe('Employee API Provider Contract Verification', () => {
  const API_PORT = process.env.API_PORT || 3006;
  const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'http://localhost:9292';
  const PACT_BROKER_TOKEN = process.env.PACT_BROKER_TOKEN || '';

  /**
   * Provider state handlers
   * These setup the database/system state for each consumer expectation
   */
  const stateHandlers = {
    'employees exist in the system': async () => {
      // Setup: Ensure test database has employees
      console.log('State: Setting up employees in system');
      // This would typically seed the database with test data
      return Promise.resolve({
        description: 'Employees exist in the system',
      });
    },

    'employees in Engineering department exist': async () => {
      console.log('State: Setting up Engineering department employees');
      return Promise.resolve({
        description: 'Engineering employees exist',
      });
    },

    'employee named John Doe exists': async () => {
      console.log('State: Setting up employee John Doe');
      return Promise.resolve({
        description: 'Employee John Doe exists',
      });
    },

    'employee with ID 1 exists': async () => {
      console.log('State: Setting up employee with ID 1');
      return Promise.resolve({
        description: 'Employee with ID 1 exists',
        employeeId: 1,
      });
    },

    'employee with ID 999999 does not exist': async () => {
      console.log('State: Ensuring employee 999999 does not exist');
      return Promise.resolve({
        description: 'Employee 999999 does not exist',
      });
    },

    'user has permission to create employees': async () => {
      console.log('State: Setting up user with create permission');
      return Promise.resolve({
        description: 'User has create permission',
        permissions: ['employee:create'],
      });
    },

    'user does not have permission to create employees': async () => {
      console.log('State: Setting up user without create permission');
      return Promise.resolve({
        description: 'User lacks create permission',
        permissions: [],
      });
    },

    'user is not authenticated': async () => {
      console.log('State: No authentication setup');
      return Promise.resolve({
        description: 'User not authenticated',
      });
    },

    'employee with ID 1 exists and user has permission to update': async () => {
      console.log('State: Setting up employee 1 and update permission');
      return Promise.resolve({
        description: 'Employee 1 exists with update permission',
        employeeId: 1,
        permissions: ['employee:update'],
      });
    },

    'employee with ID 1 exists and user has permission to delete': async () => {
      console.log('State: Setting up employee 1 and delete permission');
      return Promise.resolve({
        description: 'Employee 1 exists with delete permission',
        employeeId: 1,
        permissions: ['employee:delete'],
      });
    },
  };

  /**
   * Request filter to add authentication
   */
  const requestFilter = (req: any, res: any, next: any) => {
    // Add authorization header if not present
    if (!req.headers.authorization) {
      req.headers.authorization = 'Bearer test-token';
    }
    next();
  };

  /**
   * Verify contracts from Pact Broker
   */
  it('should verify contracts from Pact Broker', async () => {
    const opts: VerifierOptions = {
      provider: 'employee-service',
      providerBaseUrl: `http://localhost:${API_PORT}`,

      // Pact Broker configuration
      pactBrokerUrl: PACT_BROKER_URL,
      pactBrokerToken: PACT_BROKER_TOKEN,

      // Consumer version selectors
      consumerVersionSelectors: [
        {
          mainBranch: true, // Verify against main branch
        },
        {
          deployedOrReleased: true, // Verify against deployed versions
        },
        {
          matchingBranch: true, // Verify against matching branch
        },
      ],

      // Enable pending pacts
      enablePending: true,
      includeWipPactsSince: '2024-01-01',

      // Provider version
      providerVersion: process.env.GIT_COMMIT || '1.0.0',
      providerVersionTags: process.env.GIT_BRANCH?.split(',') || ['main'],

      // Publish verification results
      publishVerificationResult: process.env.CI === 'true',

      // State handlers
      stateHandlers: stateHandlers,

      // Request filter
      requestFilter: requestFilter,

      // Logging
      logLevel: 'info',

      // Timeout
      timeout: 30000,
    };

    const verifier = new Verifier(opts);
    const output = await verifier.verifyProvider();

    console.log('Pact Verification Complete!');
    console.log(output);
  }, 60000); // 60 second timeout

  /**
   * Verify contracts from local pact files
   * Useful for local development before publishing to broker
   */
  it('should verify contracts from local pact files', async () => {
    const opts: VerifierOptions = {
      provider: 'employee-service',
      providerBaseUrl: `http://localhost:${API_PORT}`,

      // Local pact files
      pactUrls: [
        path.resolve(
          process.cwd(),
          'pacts',
          'web-client-employee-service.json'
        ),
      ],

      // Provider version
      providerVersion: '1.0.0-local',

      // State handlers
      stateHandlers: stateHandlers,

      // Request filter
      requestFilter: requestFilter,

      // Logging
      logLevel: 'debug',

      // Don't publish results for local verification
      publishVerificationResult: false,

      // Timeout
      timeout: 30000,
    };

    const verifier = new Verifier(opts);

    try {
      const output = await verifier.verifyProvider();
      console.log('Local Pact Verification Complete!');
      console.log(output);
    } catch (error: any) {
      console.error('Pact verification failed:', error.message);
      throw error;
    }
  }, 60000);

  /**
   * Verify specific consumer version
   */
  it('should verify specific consumer version', async () => {
    const consumerVersion = process.env.CONSUMER_VERSION || 'latest';

    const opts: VerifierOptions = {
      provider: 'employee-service',
      providerBaseUrl: `http://localhost:${API_PORT}`,

      // Pact Broker with specific consumer version
      pactBrokerUrl: PACT_BROKER_URL,
      pactBrokerToken: PACT_BROKER_TOKEN,

      consumerVersionSelectors: [
        {
          latest: true,
          consumer: 'web-client',
        },
      ],

      // Provider details
      providerVersion: process.env.GIT_COMMIT || '1.0.0',
      providerVersionTags: ['main', 'develop'],

      // State handlers
      stateHandlers: stateHandlers,

      // Request filter
      requestFilter: requestFilter,

      // Publish results
      publishVerificationResult: true,

      // Logging
      logLevel: 'info',
    };

    const verifier = new Verifier(opts);
    const output = await verifier.verifyProvider();

    console.log(`Verified against consumer version: ${consumerVersion}`);
    console.log(output);
  }, 60000);
});

/**
 * Provider State Setup Endpoint
 * This would be implemented in your actual API server
 */
export const providerStateSetupHandler = async (req: any, res: any) => {
  const { state, params } = req.body;

  console.log(`Setting up provider state: ${state}`, params);

  // Handle state setup based on state name
  switch (state) {
    case 'employees exist in the system':
      // Seed database with employees
      // await seedEmployees();
      break;

    case 'employee with ID 1 exists':
      // Ensure employee with ID 1 exists
      // await ensureEmployeeExists(1);
      break;

    case 'employee with ID 999999 does not exist':
      // Ensure employee 999999 does not exist
      // await ensureEmployeeNotExists(999999);
      break;

    // Add more state handlers as needed
  }

  res.status(200).json({
    success: true,
    state: state,
    params: params,
  });
};

/**
 * Provider State Teardown Endpoint
 * Cleanup after state setup
 */
export const providerStateTeardownHandler = async (req: any, res: any) => {
  const { state } = req.body;

  console.log(`Tearing down provider state: ${state}`);

  // Cleanup state
  // await cleanupTestData();

  res.status(200).json({
    success: true,
    message: 'State cleaned up',
  });
};
