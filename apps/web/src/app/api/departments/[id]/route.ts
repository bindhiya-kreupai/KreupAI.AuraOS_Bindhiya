/**
 * Department by ID API Routes
 *
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: includeRelations
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   patch:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               managerId:
 *                 type: string
 *                 format: uuid
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Circular reference or duplicate code
 *
 *   delete:
 *     summary: Delete department (soft delete)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: force
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Cannot delete - has employees or child departments
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import { updateDepartmentSchema } from '@/lib/validation/schemas';
import departmentService from '@/services/department.service';
import { NotFoundError, ConflictError, BusinessRuleError } from '@/lib/errors';

/**
 * GET /api/departments/[id]
 * Get department by ID
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { params }) => {
    const { id } = params;
    const url = new URL(request.url);
    const includeRelations = url.searchParams.get('includeRelations') === 'true';

    const department = await departmentService.getDepartmentById(
      id,
      (request as any).auth.tenantId,
      includeRelations
    );

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return department;
  },
  {
    requiredPermissions: ['departments:read'],
    rateLimit: 'API_USER',
  }
);

/**
 * PATCH /api/departments/[id]
 * Update department
 */
export const PATCH = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;
    const body = await request.json();

    const input = {
      id,
      ...body,
      tenantId: auth!.tenantId,
    };

    const result = await departmentService.updateDepartment(
      input,
      auth!.userId,
      getIpAddress(request)
    );

    if (!result.success) {
      if (result.error?.includes('not found')) {
        throw new NotFoundError(result.error);
      }
      if (result.error?.includes('already exists') || result.error?.includes('circular')) {
        throw new ConflictError(result.error!, result.details);
      }
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['departments:update'],
    rateLimit: 'API_USER',
    bodySchema: updateDepartmentSchema,
  }
);

/**
 * DELETE /api/departments/[id]
 * Delete department (soft delete)
 */
export const DELETE = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    const result = await departmentService.deleteDepartment(
      id,
      auth!.tenantId,
      auth!.userId,
      getIpAddress(request),
      force
    );

    if (!result.success) {
      if (result.error?.includes('not found')) {
        throw new NotFoundError(result.error);
      }
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['departments:delete'],
    rateLimit: 'API_USER',
  }
);
