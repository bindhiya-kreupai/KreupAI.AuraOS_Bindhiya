/**
 * Employee Service - Entry Point
 * Proper Fastify microservice for employee management operations.
 *
 * Routes (all prefixed /api/v1):
 *   GET    /employees                   — paginated list with filters
 *   GET    /employees/:id               — single employee
 *   POST   /employees                   — create employee
 *   PUT    /employees/:id               — update employee
 *   DELETE /employees/:id               — soft-delete employee
 *   GET    /employees/:id/documents     — employee documents
 *   GET    /employees/:id/employment-history  — employment history
 *   POST   /employees/bulk              — bulk import
 *   GET    /departments                 — list departments
 *   GET    /positions                   — list positions
 *   GET    /org-chart                   — org chart
 *   GET    /health                      — health check
 */

import './instrumentation';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

// ── Prisma singleton ──────────────────────────────────────────────────────────

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ── App ───────────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) => {
    return (req.headers['x-request-id'] as string) || `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  },
});

// ── CORS / Helmet ─────────────────────────────────────────────────────────────

app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  if (request.method === 'OPTIONS') {
    reply.code(204).send();
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.setErrorHandler(async (error, request, reply) => {
  request.log.error({ err: error }, 'Unhandled error');
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
    statusCode,
    requestId: request.id,
  });
});

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', async (_request: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: 'ok',
    service: 'employee-service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// ── Kubernetes probe endpoints (Phase 3 #40) ──────────────────────────────────
// /healthz — liveness: returns 200 unconditionally if the process is up.
//           No external calls — depending on Postgres here would let a transient
//           DB outage trigger pod restarts and cause cascade failures.
// /readyz  — readiness: returns 200 by default. Override per service when there
//           are real dependency probes worth gating traffic on.
app.get('/healthz', async () => ({ status: 'alive', uptime: process.uptime() }));
app.get('/readyz', async () => ({ status: 'ready' }));

// ── LIST EMPLOYEES ────────────────────────────────────────────────────────────

interface ListEmployeesQuery {
  page?: string;
  limit?: string;
  search?: string;
  department?: string;
  status?: string;
  companyId?: string;
  locationId?: string;
}

app.get('/api/v1/employees', async (
  request: FastifyRequest<{ Querystring: ListEmployeesQuery }>,
  reply: FastifyReply
) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      department,
      status,
      companyId,
      locationId,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.departmentId = department;
    }

    if (status) {
      where.status = { code: status };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          department: { select: { id: true, name: true, code: true } },
          jobProfile: { select: { id: true, title: true, code: true } },
          grade: { select: { id: true, name: true, code: true } },
          location: { select: { id: true, name: true, code: true } },
          status: { select: { id: true, name: true, code: true } },
          type: { select: { id: true, name: true, code: true } },
          manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return reply.code(200).send({
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list employees');
    return reply.code(500).send({ error: 'Failed to retrieve employees' });
  }
});

// ── GET SINGLE EMPLOYEE ───────────────────────────────────────────────────────

app.get('/api/v1/employees/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const employee = await prisma.employee.findFirst({
      where: { id, isDeleted: false },
      include: {
        department: true,
        jobProfile: { include: { family: { include: { function: true } } } },
        grade: true,
        location: { include: { address: { include: { city: true, state: true, country: true } } } },
        status: true,
        type: true,
        manager: { select: { id: true, firstName: true, lastName: true, email: true, employeeCode: true } },
        reports: {
          where: { isDeleted: false },
          select: { id: true, firstName: true, lastName: true, email: true, employeeCode: true },
        },
        company: { select: { id: true, name: true, code: true } },
        address: { include: { city: true, state: true, country: true } },
      },
    });

    if (!employee) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    return reply.code(200).send({ data: employee });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get employee');
    return reply.code(500).send({ error: 'Failed to retrieve employee' });
  }
});

// ── CREATE EMPLOYEE ───────────────────────────────────────────────────────────

interface CreateEmployeeBody {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  departmentId: string;
  locationId: string;
  jobProfileId: string;
  gradeId: string;
  statusId: string;
  typeId: string;
  joiningDate: string;
  managerId?: string;
  positionId?: string;
  addressId?: string;
  userId?: string;
}

app.post('/api/v1/employees', async (
  request: FastifyRequest<{ Body: CreateEmployeeBody }>,
  reply: FastifyReply
) => {
  try {
    const body = request.body;

    // Required field validation
    const required = ['employeeCode', 'firstName', 'lastName', 'email', 'companyId', 'departmentId', 'locationId', 'jobProfileId', 'gradeId', 'statusId', 'typeId', 'joiningDate'];
    const missing = required.filter((f) => !body[f as keyof CreateEmployeeBody]);
    if (missing.length > 0) {
      return reply.code(400).send({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: body.employeeCode,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        companyId: body.companyId,
        departmentId: body.departmentId,
        locationId: body.locationId,
        jobProfileId: body.jobProfileId,
        gradeId: body.gradeId,
        statusId: body.statusId,
        typeId: body.typeId,
        joiningDate: new Date(body.joiningDate),
        managerId: body.managerId,
        positionId: body.positionId,
        addressId: body.addressId,
        userId: body.userId,
      },
      include: {
        department: { select: { id: true, name: true } },
        status: { select: { id: true, name: true, code: true } },
        type: { select: { id: true, name: true, code: true } },
      },
    });

    return reply.code(201).send({ data: employee });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2002') {
        return reply.code(409).send({ error: 'Employee with this code or email already exists' });
      }
      if (prismaError.code === 'P2003') {
        return reply.code(400).send({ error: 'Invalid foreign key reference (department, location, status, etc.)' });
      }
    }
    request.log.error({ err: error }, 'Failed to create employee');
    return reply.code(500).send({ error: 'Failed to create employee' });
  }
});

// ── UPDATE EMPLOYEE ───────────────────────────────────────────────────────────

app.put('/api/v1/employees/:id', async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateEmployeeBody> }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const body = request.body;

    const existing = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'firstName', 'lastName', 'email', 'companyId', 'departmentId',
      'locationId', 'jobProfileId', 'gradeId', 'statusId', 'typeId',
      'managerId', 'positionId', 'addressId',
    ];

    for (const field of allowedFields) {
      if (body[field as keyof typeof body] !== undefined) {
        updateData[field] = body[field as keyof typeof body];
      }
    }

    if (body.joiningDate) {
      updateData.joiningDate = new Date(body.joiningDate);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        department: { select: { id: true, name: true } },
        status: { select: { id: true, name: true, code: true } },
        type: { select: { id: true, name: true, code: true } },
      },
    });

    return reply.code(200).send({ data: employee });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to update employee');
    return reply.code(500).send({ error: 'Failed to update employee' });
  }
});

// ── SOFT DELETE EMPLOYEE ──────────────────────────────────────────────────────

app.delete('/api/v1/employees/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const existing = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    await prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return reply.code(200).send({ message: 'Employee deleted successfully', id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to delete employee');
    return reply.code(500).send({ error: 'Failed to delete employee' });
  }
});

// ── EMPLOYEE DOCUMENTS ────────────────────────────────────────────────────────

app.get('/api/v1/employees/:id/documents', async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { category?: string; status?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { category, status } = request.query;

    const employee = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
    if (!employee) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    const where: Record<string, unknown> = { employeeId: id };
    if (category) where.category = category;
    if (status) where.status = status;

    const documents = await prisma.employeeDocument.findMany({
      where,
      include: {
        documentType: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.code(200).send({ data: documents, total: documents.length });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get employee documents');
    return reply.code(500).send({ error: 'Failed to retrieve documents' });
  }
});

// ── EMPLOYMENT HISTORY ────────────────────────────────────────────────────────

app.get('/api/v1/employees/:id/employment-history', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const employee = await prisma.employee.findFirst({ where: { id, isDeleted: false } });
    if (!employee) {
      return reply.code(404).send({ error: 'Employee not found' });
    }

    const history = await prisma.employmentHistory.findMany({
      where: { employeeId: id, isDeleted: false },
      include: {
        previousDepartment: { select: { id: true, name: true } },
        newDepartment: { select: { id: true, name: true } },
        previousJobProfile: { select: { id: true, title: true } },
        newJobProfile: { select: { id: true, title: true } },
        previousGrade: { select: { id: true, name: true } },
        newGrade: { select: { id: true, name: true } },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return reply.code(200).send({ data: history, total: history.length });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get employment history');
    return reply.code(500).send({ error: 'Failed to retrieve employment history' });
  }
});

// ── BULK IMPORT ───────────────────────────────────────────────────────────────

app.post('/api/v1/employees/bulk', async (
  request: FastifyRequest<{ Body: { employees: CreateEmployeeBody[] } }>,
  reply: FastifyReply
) => {
  try {
    const { employees } = request.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return reply.code(400).send({ error: 'employees array is required and must not be empty' });
    }

    if (employees.length > 500) {
      return reply.code(400).send({ error: 'Bulk import limited to 500 employees per request' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { index: number; error: string }[],
      created: [] as string[],
    };

    for (let i = 0; i < employees.length; i++) {
      try {
        const emp = employees[i];
        const created = await prisma.employee.create({
          data: {
            employeeCode: emp.employeeCode,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            companyId: emp.companyId,
            departmentId: emp.departmentId,
            locationId: emp.locationId,
            jobProfileId: emp.jobProfileId,
            gradeId: emp.gradeId,
            statusId: emp.statusId,
            typeId: emp.typeId,
            joiningDate: new Date(emp.joiningDate),
            managerId: emp.managerId,
          },
        });
        results.success++;
        results.created.push(created.id);
      } catch (err) {
        results.failed++;
        results.errors.push({
          index: i,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return reply.code(207).send({
      message: 'Bulk import completed',
      ...results,
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed bulk import');
    return reply.code(500).send({ error: 'Bulk import failed' });
  }
});

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────

app.get('/api/v1/departments', async (
  request: FastifyRequest<{ Querystring: { companyId?: string; search?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { companyId, search, page = '1', limit = '50' } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { isDeleted: false };
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          company: { select: { id: true, name: true } },
          parent: { select: { id: true, name: true } },
          _count: { select: { employees: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({ where }),
    ]);

    return reply.code(200).send({
      data: departments,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list departments');
    return reply.code(500).send({ error: 'Failed to retrieve departments' });
  }
});

// ── POSITIONS ─────────────────────────────────────────────────────────────────

app.get('/api/v1/positions', async (
  request: FastifyRequest<{ Querystring: { tenantId?: string; status?: string; departmentId?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, status, departmentId, page = '1', limit = '50' } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          department: { select: { id: true, name: true } },
          jobProfile: { select: { id: true, title: true } },
          grade: { select: { id: true, name: true } },
        },
        orderBy: { positionCode: 'asc' },
      }),
      prisma.position.count({ where }),
    ]);

    return reply.code(200).send({
      data: positions,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list positions');
    return reply.code(500).send({ error: 'Failed to retrieve positions' });
  }
});

// ── ORG CHART ─────────────────────────────────────────────────────────────────

app.get('/api/v1/org-chart', async (
  request: FastifyRequest<{ Querystring: { companyId?: string; rootEmployeeId?: string; depth?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { companyId, rootEmployeeId, depth = '3' } = request.query;
    const maxDepth = Math.min(5, parseInt(depth, 10));

    const where: Record<string, unknown> = { isDeleted: false };
    if (companyId) where.companyId = companyId;
    if (rootEmployeeId) {
      where.id = rootEmployeeId;
    } else {
      // Top-level managers (no manager)
      where.managerId = null;
    }

    async function buildTree(parentId: string | null, currentDepth: number): Promise<unknown[]> {
      if (currentDepth >= maxDepth) return [];

      const employees = await prisma.employee.findMany({
        where: {
          managerId: parentId,
          isDeleted: false,
          ...(companyId ? { companyId } : {}),
        },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          department: { select: { name: true } },
          jobProfile: { select: { title: true } },
          location: { select: { name: true } },
          _count: { select: { reports: true } },
        },
      });

      const nodes = await Promise.all(
        employees.map(async (emp) => ({
          ...emp,
          children: await buildTree(emp.id, currentDepth + 1),
        }))
      );

      return nodes;
    }

    const roots = rootEmployeeId
      ? [await prisma.employee.findFirst({
          where: { id: rootEmployeeId, isDeleted: false },
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
            jobProfile: { select: { title: true } },
          },
        })]
      : await prisma.employee.findMany({
          where: { managerId: null, isDeleted: false, ...(companyId ? { companyId } : {}) },
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
            jobProfile: { select: { title: true } },
          },
        });

    const tree = await Promise.all(
      roots
        .filter(Boolean)
        .map(async (root) => ({
          ...root,
          children: await buildTree(root!.id, 1),
        }))
    );

    return reply.code(200).send({ data: tree });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get org chart');
    return reply.code(500).send({ error: 'Failed to retrieve org chart' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Employee service listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  app.log.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  app.log.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});

start();

export default app;
