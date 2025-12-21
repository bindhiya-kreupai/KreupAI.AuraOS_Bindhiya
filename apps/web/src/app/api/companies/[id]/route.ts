/**
 * Company by ID API Routes
 *
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company by ID
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
 *       - name: includeRelations
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   patch:
 *     summary: Update company
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
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended]
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Duplicate code
 *
 *   delete:
 *     summary: Delete company (soft delete)
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
 *       - name: force
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       400:
 *         description: Cannot delete - has employees or departments
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import { updateCompanySchema } from '@/lib/validation/schemas';
import companyService from '@/services/company.service';
import { NotFoundError, ConflictError, BusinessRuleError } from '@/lib/errors';

/**
 * GET /api/companies/[id]
 * Get company by ID
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;
    const url = new URL(request.url);
    const includeRelations = url.searchParams.get('includeRelations') === 'true';

    const company = await companyService.getCompanyById(
      id,
      auth!.tenantId,
      includeRelations
    );

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  },
  {
    requiredPermissions: ['companies:read'],
    rateLimit: 'API_USER',
  }
);

/**
 * PATCH /api/companies/[id]
 * Update company
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

    const result = await companyService.updateCompany(
      input,
      auth!.userId,
      getIpAddress(request)
    );

    if (!result.success) {
      if (result.error?.includes('not found')) {
        throw new NotFoundError(result.error);
      }
      if (result.error?.includes('already exists')) {
        throw new ConflictError(result.error!, result.details);
      }
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['companies:update'],
    rateLimit: 'API_USER',
    bodySchema: updateCompanySchema,
  }
);

/**
 * DELETE /api/companies/[id]
 * Delete company (soft delete)
 */
export const DELETE = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const { id } = params;
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    const result = await companyService.deleteCompany(
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
    requiredPermissions: ['companies:delete'],
    rateLimit: 'API_USER',
  }
);
