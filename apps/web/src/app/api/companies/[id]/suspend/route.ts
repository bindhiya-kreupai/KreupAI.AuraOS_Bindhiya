/**
 * Company Suspend API Route
 *
 * @swagger
 * /api/companies/{id}/suspend:
 *   post:
 *     summary: Suspend a company
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *     responses:
 *       200:
 *         description: Company suspended successfully
 *       400:
 *         description: Company is already suspended
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import companyService from '@/services/company.service';
import { NotFoundError, BusinessRuleError } from '@/lib/errors';

/**
 * POST /api/companies/[id]/suspend
 * Suspend a company
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason;

    const result = await companyService.suspendCompany(
      id,
      auth!.tenantId,
      auth!.userId,
      getIpAddress(request),
      reason
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
