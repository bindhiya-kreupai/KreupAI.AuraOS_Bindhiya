/**
 * GraphQL API Endpoint
 * Single endpoint for all GraphQL queries and mutations
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { graphql, parse, validate } from 'graphql';
import { schema } from '@/lib/graphql/schema';
import { logger } from '@/lib/logger';
import { withAuth } from '@/lib/auth';

/**
 * GraphQL context - provides services to resolvers
 */
interface GraphQLContext {
  services: {
    employee: any;
    department: any;
    leave: any;
    attendance: any;
    payroll: any;
  };
  user: {
    id: string;
    email: string;
    tenantId: string;
    companyId: string;
  };
  request: NextRequest;
}

/**
 * Create GraphQL context from request
 */
function createContext(request: NextRequest, user: any): GraphQLContext {
  // TODO: Import actual services
  const services = {
    employee: {
      getById: async (id: string) => {
        // Mock implementation
        return {
          id,
          employeeCode: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
      list: async (args: any) => {
        // Mock implementation
        return {
          employees: [
            {
              id: '1',
              employeeCode: 'EMP001',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@company.com',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          pageInfo: {
            page: args.page || 1,
            limit: args.limit || 20,
            total: 1,
            totalPages: 1,
          },
        };
      },
      create: async (input: any) => ({
        id: crypto.randomUUID(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      update: async (id: string, input: any) => ({
        id,
        ...input,
        updatedAt: new Date().toISOString(),
      }),
      delete: async (_id: string) => true,
    },
    department: {
      getById: async (id: string) => ({
        id,
        code: 'DEPT001',
        name: 'Engineering',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      list: async () => [
        {
          id: '1',
          code: 'DEPT001',
          name: 'Engineering',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    leave: {
      getRequestById: async (id: string) => ({
        id,
        employeeId: '1',
        leaveTypeId: '1',
        startDate: '2024-12-26',
        endDate: '2024-12-27',
        numberOfDays: 2,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }),
      listRequests: async (args: any) => ({
        leaveRequests: [],
        pageInfo: {
          page: args.page || 1,
          limit: args.limit || 20,
          total: 0,
          totalPages: 0,
        },
      }),
      createRequest: async (input: any) => ({
        id: crypto.randomUUID(),
        ...input,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }),
      approveRequest: async (id: string, approverId: string) => ({
        id,
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
      }),
      rejectRequest: async (id: string, approverId: string, reason: string) => ({
        id,
        status: 'REJECTED',
        approvedBy: approverId,
        rejectionReason: reason,
        approvedAt: new Date().toISOString(),
      }),
    },
    attendance: {
      getForEmployee: async (_args: any) => [],
      clockIn: async (input: any) => ({
        id: crypto.randomUUID(),
        ...input,
        date: new Date().toISOString().split('T')[0],
        clockIn: new Date().toISOString(),
        status: 'PRESENT',
      }),
      clockOut: async (input: any) => ({
        id: crypto.randomUUID(),
        ...input,
        clockOut: new Date().toISOString(),
      }),
    },
    payroll: {
      getPayslip: async (args: any) => ({
        id: crypto.randomUUID(),
        employeeId: args.employeeId,
        month: args.month,
        basicSalary: 5000,
        grossPay: 7000,
        totalDeductions: 1000,
        netPay: 6000,
        generatedAt: new Date().toISOString(),
      }),
    },
  };

  return {
    services,
    user,
    request,
  };
}

/**
 * POST /api/v1/graphql
 * Execute GraphQL queries and mutations
 */
async function handlePOST(request: NextRequest, _context: any): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const { query, variables, operationName } = body;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'GraphQL query is required',
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate query
    let document;
    try {
      document = parse(query);
    } catch (error) {
      logger.error({ error, query }, 'GraphQL parse error');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Invalid GraphQL query syntax',
            details: { error: error instanceof Error ? error.message : 'Parse error' },
          },
        },
        { status: 400 }
      );
    }

    // Validate query against schema
    const validationErrors = validate(schema, document);
    if (validationErrors.length > 0) {
      logger.error({ validationErrors, query }, 'GraphQL validation error');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'GraphQL query validation failed',
            details: { errors: validationErrors.map((e) => e.message) },
          },
        },
        { status: 400 }
      );
    }

    // Create context with user info from auth middleware
    const user = (request as any).user || {
      id: 'system',
      email: 'system@auraos.com',
      tenantId: 'default',
      companyId: 'default',
    };

    const graphqlContext = createContext(request, user);

    // Execute GraphQL query
    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      operationName,
      contextValue: graphqlContext,
    });

    const duration = Math.round(performance.now() - startTime);

    // Log execution
    logger.info(
      {
        operationName,
        duration,
        hasErrors: !!result.errors,
        userId: user.id,
      },
      'GraphQL query executed'
    );

    // Return GraphQL response
    if (result.errors) {
      logger.error({ errors: result.errors, query }, 'GraphQL execution errors');
      return NextResponse.json(
        {
          success: false,
          data: result.data,
          errors: result.errors,
          meta: {
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            apiVersion: 'v1',
          },
        },
        { status: 200 } // GraphQL always returns 200, errors in response body
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    logger.error({ error, duration }, 'GraphQL endpoint error');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/graphql
 * GraphQL playground (development only)
 */
async function handleGET(_request: NextRequest): Promise<NextResponse> {
  // Return GraphiQL playground HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>AuraOS GraphQL Playground</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3.0.0/graphiql.min.css" />
  <style>
    body {
      height: 100vh;
      margin: 0;
      overflow: hidden;
    }
    #graphiql {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="graphiql">Loading...</div>
  <script
    crossorigin
    src="https://unpkg.com/react@18/umd/react.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/graphiql@3.0.0/graphiql.min.js"
  ></script>
  <script>
    const fetcher = GraphiQL.createFetcher({
      url: '/api/v1/graphql',
    });

    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    root.render(
      React.createElement(GraphiQL, {
        fetcher,
        defaultQuery: \`# Welcome to AuraOS GraphQL API
#
# Example queries:

# Get employee by ID
query GetEmployee {
  employee(id: "1") {
    id
    employeeCode
    fullName
    email
    status
    department {
      name
    }
    position {
      title
    }
  }
}

# List employees with pagination
query ListEmployees {
  employees(page: 1, limit: 10, status: ACTIVE) {
    employees {
      id
      employeeCode
      fullName
      email
      department {
        name
      }
    }
    pageInfo {
      page
      total
      totalPages
    }
  }
}

# Create employee
mutation CreateEmployee {
  createEmployee(input: {
    employeeCode: "EMP002"
    firstName: "Jane"
    lastName: "Smith"
    email: "jane.smith@company.com"
    employmentType: PERMANENT
  }) {
    id
    fullName
    email
  }
}
\`,
      })
    );
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

// Export handlers with auth middleware
export const POST = withAuth(handlePOST);
export const GET = handleGET; // Playground doesn't require auth
