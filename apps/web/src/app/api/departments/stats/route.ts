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

/**
 * GET /api/departments/stats
 * Get department statistics
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || undefined;

    const result = await departmentService.getDepartmentStats(
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
