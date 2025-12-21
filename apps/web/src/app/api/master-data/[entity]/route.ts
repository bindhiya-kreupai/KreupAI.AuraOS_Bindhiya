import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
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
    } catch (error) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      console.error(`Error fetching ${params.entity}:`, error);
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
    } catch (error) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      console.error(`Error creating ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
    }
  }
);
