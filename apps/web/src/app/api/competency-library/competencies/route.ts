import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { CreateCompetencySchema, validateBody } from '@/lib/validators/competency-library-api';

// GET - Fetch all competencies with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [competencies, total] = await Promise.all([
      prisma.competencyCatalog.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          proficiencyDescriptors: {
            include: { level: true },
          },
          applicableRoles: true,
          developmentResources: true,
          assessmentCriteria: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.competencyCatalog.count({ where }),
    ]);

    // Transform applicableRoles to string array
    const transformed = competencies.map((comp) => ({
      ...comp,
      applicableRoles: comp.applicableRoles.map((r) => r.roleName),
    }));

    return NextResponse.json({
      success: true,
      data: transformed,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    logger.error('Error fetching competencies:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch competencies',
        messageAr: 'فشل في جلب الكفاءات',
        error: 'Failed to fetch competencies',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new competency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(CreateCompetencySchema, body);
    if (validation.response) return validation.response;
    const {
      code,
      name,
      categoryId,
      subcategoryId,
      description,
      status = 'Draft',
      version = '1.0',
      owner,
      applicableRoles = [],
      proficiencyDescriptors = [],
      developmentResources = [],
      assessmentCriteria = [],
    } = validation.data;

    // Generate code if not provided
    const finalCode = code || `COMP-${Date.now()}`;

    const competency = await prisma.competencyCatalog.create({
      data: {
        code: finalCode,
        name,
        categoryId,
        subcategoryId,
        description,
        status,
        version,
        owner,
        applicableRoles: {
          create: applicableRoles.map((role: string) => ({ roleName: role })),
        },
        proficiencyDescriptors: {
          create: proficiencyDescriptors.map((desc: any) => ({
            levelId: desc.levelId,
            description: desc.description,
            behaviors: desc.behaviors,
          })),
        },
        developmentResources: {
          create: developmentResources.map((res: any) => ({
            title: res.title,
            type: res.type,
            url: res.url,
            provider: res.provider,
            duration: res.duration,
            cost: res.cost,
          })),
        },
        assessmentCriteria: {
          create: assessmentCriteria.map((crit: any, idx: number) => ({
            criteria: crit.criteria || crit,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        subcategory: true,
        proficiencyDescriptors: { include: { level: true } },
        applicableRoles: true,
        developmentResources: true,
        assessmentCriteria: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...competency,
        applicableRoles: competency.applicableRoles.map((r) => r.roleName),
      },
      message: 'Competency created successfully',
    });
  } catch (error: any) {
    logger.error('Error creating competency:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'A competency with this code already exists',
          messageAr: 'توجد كفاءة بهذا الرمز بالفعل',
          error: 'A competency with this code already exists',
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create competency',
        messageAr: 'فشل في إنشاء الكفاءة',
        error: 'Failed to create competency',
      },
      { status: 500 }
    );
  }
}
