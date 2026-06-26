// @ts-nocheck — Calls departmentService/companyService whose declared signatures don't match call sites (different arg counts, different result shapes). Underlying service is also @ts-nocheck'd for Prisma drift. Coordinated fix needed. Tracked under #29.
/**
 * Companies API Routes
 *
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corporation
 *               code:
 *                 type: string
 *                 example: ACME
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               taxId:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended]
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Company code already exists
 *
 *   get:
 *     summary: List companies with filters and pagination
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Suspended]
 *       - name: industry
 *         in: query
 *         schema:
 *           type: string
 *       - name: country
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of companies
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute, getIpAddress } from '@/lib/api/route-wrapper';
import { createCompanySchema, listCompaniesQuerySchema } from '@/lib/validation/schemas';
import companyService from '@/services/company.service';
import { ConflictError, BusinessRuleError } from '@/lib/errors';

/**
 * POST /api/companies
 * Create a new company
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, body }) => {
    const input = {
      ...body,
      tenantId: auth!.tenantId,
    };

    const result = await companyService.createCompany(input, auth!.userId, getIpAddress(request));

    if (!result.success) {
      if (result.error?.includes('already exists')) {
        throw new ConflictError(result.error!, result.details);
      }
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['companies:create'],
    rateLimit: 'API_USER',
    bodySchema: createCompanySchema,
  }
);

/**
 * GET /api/companies
 * List companies with filters and pagination
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    const input = {
      ...query,
      tenantId: auth!.tenantId,
    };

    const result = await companyService.listCompanies(input);

    if (!result.success) {
      throw new BusinessRuleError(result.error!, result.details);
    }

    return result.data;
  },
  {
    requiredPermissions: ['companies:read'],
    rateLimit: 'API_USER',
    querySchema: listCompaniesQuerySchema,
  }
);
