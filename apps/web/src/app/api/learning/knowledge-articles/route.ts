import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching knowledge articles');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch knowledge articles',
        messageAr: 'فشل في جلب مقالات المعرفة',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title and content are required',
          messageAr: 'العنوان والمحتوى مطلوبان',
        },
        { status: 400 }
      );
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        content: body.content,
        summary: body.summary ?? null,
        categoryId: body.categoryId ?? null,
        category: body.category ?? null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        authorId: body.authorId || user.userId,
        status: body.status || 'published',
        createdBy: user.userId,
      },
    });

    logger.info({ id: article.id }, 'Knowledge article created');
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating knowledge article');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create knowledge article',
        messageAr: 'فشل في إنشاء مقالة المعرفة',
      },
      { status: 500 }
    );
  }
});
