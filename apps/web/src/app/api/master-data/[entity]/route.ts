import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  MasterDataQuerySchema,
  CreateCountrySchema,
  UpdateCountrySchema,
  CreateStateSchema,
  UpdateStateSchema,
  StateQuerySchema,
  CreateCitySchema,
  UpdateCitySchema,
  CityQuerySchema,
  CreateCurrencySchema,
  UpdateCurrencySchema,
  CreateLanguageSchema,
  UpdateLanguageSchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';

// Generic schema for entities without specific schemas
const GenericCreateSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
}).passthrough();

const GenericUpdateSchema = GenericCreateSchema.partial();

// Entity configuration
const ENTITIES: Record<string, {
  model: any;
  createSchema: z.ZodType;
  updateSchema: z.ZodType;
  querySchema?: z.ZodType;
  searchFields?: string[];
  include?: any;
  unique?: string;
}> = {
  // Geographic entities
  countries: {
    model: prisma.country,
    createSchema: CreateCountrySchema,
    updateSchema: UpdateCountrySchema,
    searchFields: ['name', 'isoCode'],
    unique: 'isoCode',
  },
  states: {
    model: prisma.state,
    createSchema: CreateStateSchema,
    updateSchema: UpdateStateSchema,
    querySchema: StateQuerySchema,
    searchFields: ['name', 'code'],
    include: { country: { select: { id: true, name: true, isoCode: true } } },
  },
  cities: {
    model: prisma.city,
    createSchema: CreateCitySchema,
    updateSchema: UpdateCitySchema,
    querySchema: CityQuerySchema,
    searchFields: ['name'],
    include: { state: { select: { id: true, name: true, country: { select: { id: true, name: true } } } } },
  },

  // Currency and language
  currencies: {
    model: prisma.currency,
    createSchema: CreateCurrencySchema,
    updateSchema: UpdateCurrencySchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  languages: {
    model: prisma.language,
    createSchema: CreateLanguageSchema,
    updateSchema: UpdateLanguageSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },

  // Organizational structure
  companies: {
    model: prisma.company,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  departments: {
    model: prisma.department,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  locations: {
    model: prisma.location,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },
  'business-units': {
    model: prisma.businessUnit,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  'cost-centers': {
    model: prisma.costCenter,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },

  // Job structure
  designations: {
    model: prisma.designation,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },
  grades: {
    model: prisma.grade,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  'job-families': {
    model: prisma.jobFamily,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },
  'job-functions': {
    model: prisma.jobFunction,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },
  'job-profiles': {
    model: prisma.jobProfile,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['title', 'code'],
  },

  // Skills and competencies
  skills: {
    model: prisma.skill,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },
  competencies: {
    model: prisma.competency,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Banking and finance
  banks: {
    model: prisma.bank,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Time and attendance
  holidays: {
    model: prisma.holiday,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },
  'leave-types': {
    model: prisma.leaveType,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  'shift-types': {
    model: prisma.shiftType,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Document types
  'document-types': {
    model: prisma.documentType,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Employment
  'employment-types': {
    model: prisma.employmentType,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },
  'employment-statuses': {
    model: prisma.employeeStatus,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },

  // Education and relationships
  'education-levels': {
    model: prisma.educationLevel,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },
  relationships: {
    model: prisma.relationship,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },

  // Exit reasons
  'exit-reasons': {
    model: prisma.exitReason,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name'],
  },

  // Payroll
  'pay-components': {
    model: prisma.payComponent,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
  'salary-structures': {
    model: prisma.salaryStructure,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Compliance
  statutory: {
    model: prisma.statutory,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },
  'tax-regimes': {
    model: prisma.taxRegime,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
  },

  // Admin
  'roles-permissions': {
    model: prisma.role,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'description'],
  },
  'system-settings': {
    model: prisma.systemSetting,
    createSchema: z.object({
      key: z.string().min(1),
      value: z.string(),
      group: z.string().optional(),
      description: z.string().optional(),
    }).passthrough(),
    updateSchema: z.object({
      key: z.string().optional(),
      value: z.string().optional(),
      group: z.string().optional(),
      description: z.string().optional(),
    }).passthrough(),
    searchFields: ['key', 'group'],
    unique: 'key',
  },
  tenants: {
    model: prisma.tenant,
    createSchema: GenericCreateSchema,
    updateSchema: GenericUpdateSchema,
    searchFields: ['name', 'code'],
    unique: 'code',
  },
};

// GET - List entities
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { entity: string } }) => {
    try {
      const permissionError = requirePermission(Resource.MASTER_DATA, Action.READ, permissions);
      if (permissionError) return permissionError;

      const config = ENTITIES[params.entity];
      if (!config) {
        return NextResponse.json({ success: false, error: 'Invalid entity' }, { status: 400 });
      }

      const { searchParams } = new URL(request.url);
      const querySchema = config.querySchema || MasterDataQuerySchema;
      const { search, status, page, limit, ...filters } = validateQueryParams(querySchema, searchParams);

      const where: any = { ...filters };
      if (search && config.searchFields) {
        where.OR = config.searchFields.map(f => ({ [f]: { contains: search, mode: 'insensitive' } }));
      }
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        config.model.findMany({
          where,
          include: config.include,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        config.model.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      logger.error(`Error fetching ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
  }
);

// POST - Create entity
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { entity: string } }) => {
    try {
      const permissionError = requirePermission(Resource.MASTER_DATA, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const config = ENTITIES[params.entity];
      if (!config) {
        return NextResponse.json({ success: false, error: 'Invalid entity' }, { status: 400 });
      }

      const body = await request.json();
      const data = config.createSchema.parse(body);

      if (config.unique) {
        const existing = await config.model.findUnique({ where: { [config.unique]: data[config.unique] } });
        if (existing) {
          return NextResponse.json({ success: false, error: `${config.unique} already exists` }, { status: 400 });
        }
      }

      const item = await config.model.create({ data, include: config.include });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Master Data',
          details: `Created ${params.entity.slice(0, -1)}: ${item.name || item.code}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      logger.error(`Error creating ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
    }
  }
);
