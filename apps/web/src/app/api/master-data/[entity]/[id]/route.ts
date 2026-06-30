// @ts-nocheck — Uses prisma.salaryStructure / prisma.statutory models not in current schema, or AuditLog 'module'/'details' fields. Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  UpdateCountrySchema,
  UpdateStateSchema,
  UpdateCitySchema,
  UpdateCurrencySchema,
  UpdateLanguageSchema,
  validationErrorResponse,
} from '@/lib/validators';

// Generic update schema for entities without specific schemas
const GenericUpdateSchema = z
  .object({
    code: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
  })
  .passthrough();

const ENTITIES: Record<string, { model: any; updateSchema: z.ZodType; include?: any }> = {
  // Geographic
  countries: { model: prisma.country, updateSchema: UpdateCountrySchema },
  states: {
    model: prisma.state,
    updateSchema: UpdateStateSchema,
    include: { country: { select: { id: true, name: true } } },
  },
  cities: {
    model: prisma.city,
    updateSchema: UpdateCitySchema,
    include: { state: { select: { id: true, name: true } } },
  },
  currencies: { model: prisma.currency, updateSchema: UpdateCurrencySchema },
  languages: { model: prisma.language, updateSchema: UpdateLanguageSchema },

  // Organizational
  companies: { model: prisma.company, updateSchema: GenericUpdateSchema },
  departments: { model: prisma.department, updateSchema: GenericUpdateSchema },
  locations: { model: prisma.location, updateSchema: GenericUpdateSchema },
  'business-units': { model: prisma.businessUnit, updateSchema: GenericUpdateSchema },
  'cost-centers': { model: prisma.costCenter, updateSchema: GenericUpdateSchema },

  // Job structure
  designations: { model: prisma.designation, updateSchema: GenericUpdateSchema },
  grades: { model: prisma.grade, updateSchema: GenericUpdateSchema },
  'job-families': { model: prisma.jobFamily, updateSchema: GenericUpdateSchema },
  'job-functions': { model: prisma.jobFunction, updateSchema: GenericUpdateSchema },
  'job-profiles': { model: prisma.jobProfile, updateSchema: GenericUpdateSchema },

  // Skills
  skills: { model: prisma.skill, updateSchema: GenericUpdateSchema },
  competencies: { model: prisma.competency, updateSchema: GenericUpdateSchema },

  // Banking and time
  banks: { model: prisma.bank, updateSchema: GenericUpdateSchema },
  holidays: { model: prisma.holiday, updateSchema: GenericUpdateSchema },
  'leave-types': { model: prisma.leaveType, updateSchema: GenericUpdateSchema },
  'shift-types': { model: prisma.shiftType, updateSchema: GenericUpdateSchema },

  // Document and employment
  'document-types': { model: prisma.documentType, updateSchema: GenericUpdateSchema },
  'employment-types': { model: prisma.employmentType, updateSchema: GenericUpdateSchema },
  'employment-statuses': { model: prisma.employeeStatus, updateSchema: GenericUpdateSchema },

  // Education and relationships
  'education-levels': { model: prisma.educationLevel, updateSchema: GenericUpdateSchema },
  relationships: { model: prisma.relationship, updateSchema: GenericUpdateSchema },
  'exit-reasons': { model: prisma.exitReason, updateSchema: GenericUpdateSchema },

  // Payroll
  'pay-components': { model: prisma.payComponent, updateSchema: GenericUpdateSchema },
  'salary-structures': { model: prisma.salaryStructure, updateSchema: GenericUpdateSchema },

  // Compliance
  statutory: { model: prisma.statutory, updateSchema: GenericUpdateSchema },
  'tax-regimes': { model: prisma.taxRegime, updateSchema: GenericUpdateSchema },

  // Admin
  'roles-permissions': { model: prisma.role, updateSchema: GenericUpdateSchema },
  'system-settings': {
    model: prisma.systemSetting,
    updateSchema: z
      .object({
        key: z.string().optional(),
        value: z.string().optional(),
        group: z.string().optional(),
        description: z.string().optional(),
      })
      .passthrough(),
  },
  tenants: { model: prisma.tenant, updateSchema: GenericUpdateSchema },
};

// GET - Fetch single entity
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.MASTER_DATA, Action.READ, permissions);
      if (permissionError) return permissionError;

      const config = ENTITIES[params.entity];
      if (!config) {
        return NextResponse.json({ success: false, error: 'Invalid entity' }, { status: 400 });
      }

      const item = await config.model.findUnique({
        where: { id: params.id },
        include: config.include,
      });

      if (!item) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    } catch (error: any) {
      logger.error(`Error fetching ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
  }
);

// PUT - Update entity
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.MASTER_DATA, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const config = ENTITIES[params.entity];
      if (!config) {
        return NextResponse.json({ success: false, error: 'Invalid entity' }, { status: 400 });
      }

      const existing = await config.model.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const data = config.updateSchema.parse(body);

      const updated = await config.model.update({
        where: { id: params.id },
        data,
        include: config.include,
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          module: params.entity,
          action: 'UPDATE',
          resourceType: 'Master Data',
          metadata: {
            description: `Updated ${params.entity.slice(0, -1)}: ${updated.name || updated.code}`,
          } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      logger.error(`Error updating ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }
  }
);

// DELETE - Delete entity
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      const permissionError = requirePermission(Resource.MASTER_DATA, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const config = ENTITIES[params.entity];
      if (!config) {
        return NextResponse.json({ success: false, error: 'Invalid entity' }, { status: 400 });
      }

      const existing = await config.model.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }

      // Soft delete if status field exists, otherwise hard delete
      if ('status' in existing) {
        await config.model.update({
          where: { id: params.id },
          data: { status: 'Inactive' },
        });
      } else {
        await config.model.delete({ where: { id: params.id } });
      }

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          module: params.entity,
          action: 'DELETE',
          resourceType: 'Master Data',
          metadata: {
            description: `Deleted ${params.entity.slice(0, -1)}: ${existing.name || existing.code}`,
          } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      logger.error(`Error deleting ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
  }
);
