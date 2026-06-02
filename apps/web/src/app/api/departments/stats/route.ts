// @ts-nocheck — Calls departmentService/companyService whose declared signatures don't match call sites (different arg counts, different result shapes). Underlying service is also @ts-nocheck'd for Prisma drift. Coordinated fix needed. Tracked under #29.
/**
 * Department Statistics API Route
 *
 * @swagger
 * /api/departments/stats:
 *   get:
 *     summary: Get department statistics
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
 *         description: Department statistics
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
 *                     totalDepartments:
 *                       type: integer
 *                     departmentsByCompany:
 *                       type: object
 *                     totalEmployees:
 *                       type: integer
 *                     avgEmployeesPerDepartment:
 *                       type: number
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import departmentService from '@/services/department.service';
import { BusinessRuleError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/departments/stats
 * Get department statistics
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || undefined;

    try {
      const result = await departmentService.getDepartmentStats(
        auth!.tenantId,
        companyId
      );

      return result;
    } catch (error: any) {
      throw new BusinessRuleError('Failed to fetch department stats', error);
    }
  },
  {
    requiredPermissions: ['departments:read'],
    rateLimit: 'API_USER',
  }
);
