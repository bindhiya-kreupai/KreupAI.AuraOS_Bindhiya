import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createProviderSchema = z.object({
  providerCode: z.string().min(1, 'Provider code is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  providerType: z.enum([
    'PHYSICIAN',
    'HOSPITAL',
    'CLINIC',
    'PHARMACY',
    'DENTAL',
    'VISION',
    'MENTAL_HEALTH',
    'SPECIALIST',
    'LABORATORY',
    'OTHER',
  ]),
  specialty: z.string().optional(),
  npiNumber: z.string().optional(),
  taxId: z.string().optional(),
  address: z.any(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional(),
  website: z.string().optional(),
  networkStatus: z.string().optional(),
  acceptingNewPatients: z.boolean().optional(),
  languages: z.any().optional(),
  officeHours: z.any().optional(),
  rating: z.number().min(0).max(5).optional(),
});

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
      isActive: true,
    };

    const providerType = searchParams.get('providerType') || searchParams.get('type');
    if (providerType) {
      where.providerType = providerType;
    }

    const specialty = searchParams.get('specialty');
    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    const query = searchParams.get('q') || searchParams.get('query');
    if (query) {
      where.OR = [
        { providerName: { contains: query, mode: 'insensitive' } },
        { specialty: { contains: query, mode: 'insensitive' } },
      ];
    }

    const providers = await prisma.healthcareProvider.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { providerName: 'asc' }],
    });

    return NextResponse.json(
      { success: true, data: providers, total: providers.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch providers',
        messageAr: 'فشل في جلب مقدمي الخدمة',
      },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const data = createProviderSchema.parse(body);

    const existing = await prisma.healthcareProvider.findFirst({
      where: { tenantId: user.tenantId, providerCode: data.providerCode },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Provider code already exists',
          messageAr: 'رمز مقدم الخدمة موجود بالفعل',
        },
        { status: 400 }
      );
    }

    const provider = await prisma.healthcareProvider.create({
      data: {
        tenantId: user.tenantId,
        providerCode: data.providerCode,
        providerName: data.providerName,
        providerType: data.providerType,
        specialty: data.specialty,
        npiNumber: data.npiNumber,
        taxId: data.taxId,
        address: data.address as any,
        phone: data.phone,
        email: data.email,
        website: data.website,
        networkStatus: data.networkStatus,
        acceptingNewPatients: data.acceptingNewPatients ?? true,
        languages: data.languages as any,
        officeHours: data.officeHours as any,
        rating: data.rating,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          messageAr: 'خطأ في التحقق من صحة البيانات',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error creating provider:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create provider',
        messageAr: 'فشل في إنشاء مقدم الخدمة',
      },
      { status: 500 }
    );
  }
});
