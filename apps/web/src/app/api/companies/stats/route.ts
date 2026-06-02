// @ts-nocheck — Calls departmentService/companyService whose declared signatures don't match call sites (different arg counts, different result shapes). Underlying service is also @ts-nocheck'd for Prisma drift. Coordinated fix needed. Tracked under #29.
/**
 * Company Statistics API Route
 *
 * @swagger
 * /api/companies/stats:
 *   get:
 *     summary: Get company statistics
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Company statistics
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
 *                     totalCompanies:
 *                       type: integer
 *                     activeCompanies:
 *                       type: integer
 *                     inactiveCompanies:
 *                       type: integer
 *                     suspendedCompanies:
 *                       type: integer
 *                     companiesByIndustry:
 *                       type: object
 *                     companiesByCountry:
 *                       type: object
 *                     totalEmployees:
 *                       type: integer
 *                     totalDepartments:
 *                       type: integer
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import companyService from '@/services/company.service';
import { BusinessRuleError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/companies/stats
 * Get company statistics
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const result = await companyService.getCompanyStats(auth!.tenantId);

    if (!result.success) {
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['companies:read'],
    rateLimit: 'API_USER',
  }
);
