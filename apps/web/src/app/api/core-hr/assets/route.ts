import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createAssetSchema = z.object({
  assetCode: z.string().min(1),
  assetName: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  assetType: z.string().optional(),
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  brand: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  locationId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED', 'DISPOSED']).optional().default('AVAILABLE'),
  condition: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { assetName: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        location: true,
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createAssetSchema.parse(body);

    const data: any = {
      ...validated,
      tenantId: user.tenantId,
    };

    if (validated.purchaseDate) {
      data.purchaseDate = new Date(validated.purchaseDate);
    }

    const asset = await prisma.asset.create({
      data,
      include: {
        location: true,
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const existing = await prisma.asset.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (data.purchaseDate) {
      data.purchaseDate = new Date(data.purchaseDate);
    }

    const asset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        location: true,
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json({ asset }, { status: 200 });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
