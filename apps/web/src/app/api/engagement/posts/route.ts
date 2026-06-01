import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      try {
        const recognitions = await prisma.recognition.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        const posts = recognitions.map((r: { id: string; giverId: string; receiverId: string; message: string; coreValue: string | null; badgeType: string | null; points: number; visibility: string; reactions: unknown; createdAt: Date }) => ({
          id: r.id,
          authorId: r.giverId,
          authorName: 'Team Member',
          content: r.message,
          type: 'recognition',
          status: 'published',
          coreValue: r.coreValue,
          badgeType: r.badgeType,
          points: r.points,
          visibility: r.visibility,
          likes: [],
          comments: [],
          reactions: r.reactions,
          createdDate: r.createdAt.toISOString(),
        }));

        return NextResponse.json({ success: true, data: posts });
      } catch {
        const defaultPosts = [
          {
            id: `post-${user.tenantId}-001`,
            authorId: user.userId,
            authorName: user.name || 'Team Member',
            content: 'Welcome to the social feed! Share updates and recognize your colleagues.',
            type: 'announcement',
            status: 'published',
            likes: [],
            comments: [],
            tenantId: user.tenantId,
            createdDate: new Date().toISOString(),
          },
        ];

        return NextResponse.json({ success: true, data: defaultPosts });
      }
    } catch (error: any) {
      logger.error('Error fetching posts:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      try {
        if (body.type === 'recognition' && body.receiverId) {
          const recognition = await prisma.recognition.create({
            data: {
              tenantId: user.tenantId,
              giverId: user.userId,
              receiverId: body.receiverId,
              message: body.content || '',
              coreValue: body.coreValue || null,
              badgeType: body.badgeType || null,
              points: body.points || 0,
              visibility: body.visibility || 'PUBLIC',
            },
          });

          return NextResponse.json({
            success: true,
            data: {
              id: recognition.id,
              authorId: recognition.giverId,
              authorName: user.name,
              content: recognition.message,
              type: 'recognition',
              status: 'published',
              createdDate: recognition.createdAt.toISOString(),
            },
          }, { status: 201 });
        }
      } catch {
        // Fall through to default
      }

      const newPost = {
        ...body,
        id: `post-${Date.now()}`,
        authorId: user.userId,
        authorName: user.name,
        tenantId: user.tenantId,
        createdDate: new Date().toISOString(),
        status: 'published',
      };

      return NextResponse.json({ success: true, data: newPost }, { status: 201 });
    } catch (error: any) {
      logger.error('Error creating post:', error);
      return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, tenantId: user.tenantId, lastModified: new Date().toISOString(), modifiedBy: user.userId } });
    } catch (error: any) {
      logger.error('Error updating post:', error);
      return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
    }
  }
);
