/**
 * Departments API Routes
 *
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - companyId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Engineering
 *               code:
 *                 type: string
 *                 example: ENG
 *               description:
 *                 type: string
 *               companyId:
 *                 type: string
 *                 format: uuid
 *               managerId:
 *                 type: string
 *                 format: uuid
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Department code already exists
 *
 *   get:
 *     summary: List departments with filters and pagination
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: companyId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: parentId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     departments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import {
  createDepartmentSchema,
  listDepartmentsQuerySchema,
} from '@/lib/validation/schemas';
import departmentService from '@/services/department.service';
import { ConflictError, BusinessRuleError } from '@/lib/errors';

/**
 * POST /api/departments
 * Create a new department
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();

    // Add tenant ID from auth context
    const input = {
      ...body,
      tenantId: auth!.tenantId,
    };

    const result = await departmentService.createDepartment(
      input,
      auth!.userId,
      getIpAddress(request)
    );

    if (!result.success) {
      if (result.error?.includes('already exists')) {
        throw new ConflictError(result.error!, result.details);
      }
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['departments:create'],
    rateLimit: 'API_USER',
    bodySchema: createDepartmentSchema,
  }
);

/**
 * GET /api/departments
 * List departments with filters and pagination
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    // Add tenant ID from auth context
    const input = {
      ...query,
      tenantId: auth!.tenantId,
    };

    const result = await departmentService.listDepartments(input);

    if (!result.success) {
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['departments:read'],
    rateLimit: 'API_USER',
    querySchema: listDepartmentsQuerySchema,
  }
);
