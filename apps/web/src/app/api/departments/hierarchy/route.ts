// @ts-nocheck — Calls departmentService/companyService whose declared signatures don't match call sites (different arg counts, different result shapes). Underlying service is also @ts-nocheck'd for Prisma drift. Coordinated fix needed. Tracked under #29.
/**
 * Department Hierarchy API Route
 *
 * @swagger
 * /api/departments/hierarchy:
 *   get:
 *     summary: Get department hierarchy (tree structure)
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: companyId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *     responses:
 *       200:
 *         description: Department hierarchy tree
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import departmentService from '@/services/department.service';
import { BusinessRuleError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/departments/hierarchy
 * Get department hierarchy
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || undefined;

    const result = await departmentService.getDepartmentHierarchy(
      auth!.tenantId,
      companyId
    );

    if (!result.success) {
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['departments:read'],
    rateLimit: 'API_USER',
  }
);
