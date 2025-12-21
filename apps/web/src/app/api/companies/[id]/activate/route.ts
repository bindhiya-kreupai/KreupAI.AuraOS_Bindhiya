/**
 * Company Activate API Route
 *
 * @swagger
 * /api/companies/{id}/activate:
 *   post:
 *     summary: Activate a company
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Company activated successfully
 *       400:
 *         description: Company is already active
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import companyService from '@/services/company.service';
import { NotFoundError, BusinessRuleError } from '@/lib/errors';

/**
 * POST /api/companies/[id]/activate
 * Activate a company
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;

    const result = await companyService.activateCompany(
      id,
      auth!.tenantId,
      auth!.userId,
      getIpAddress(request)
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
    requiredPermissions: ['companies:update'],
    rateLimit: 'API_USER',
  }
);
