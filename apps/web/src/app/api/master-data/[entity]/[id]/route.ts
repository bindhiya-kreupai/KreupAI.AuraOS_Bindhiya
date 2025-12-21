import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import {
  UpdateCountrySchema,
  UpdateStateSchema,
  UpdateCitySchema,
  UpdateCurrencySchema,
  UpdateLanguageSchema,
  validationErrorResponse,
} from '@/lib/validators';

const ENTITIES: Record<string, { model: any; updateSchema: z.ZodType; include?: any }> = {
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
};

// GET - Fetch single entity
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { entity: string; id: string } }) => {
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
    } catch (error) {
      console.error(`Error fetching ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
  }
);

// PUT - Update entity
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { entity: string; id: string } }) => {
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
          userId: user.userId,
          action: 'UPDATE',
          module: 'Master Data',
          details: `Updated ${params.entity.slice(0, -1)}: ${updated.name || updated.code}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      if (error instanceof z.ZodError) return validationErrorResponse(error);
      console.error(`Error updating ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }
  }
);

// DELETE - Delete entity
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { entity: string; id: string } }) => {
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
          userId: user.userId,
          action: 'DELETE',
          module: 'Master Data',
          details: `Deleted ${params.entity.slice(0, -1)}: ${existing.name || existing.code}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      console.error(`Error deleting ${params.entity}:`, error);
      return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
  }
);
