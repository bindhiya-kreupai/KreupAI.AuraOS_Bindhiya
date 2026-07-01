import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * Toggle the current user's like on a social post. Social posts are backed by
 * the Recognition model; likes are tracked as a per-user list inside the
 * `reactions` JSON so they can be toggled idempotently.
 */
export const POST = withEnhancedAuth(
  async (_request: NextRequest, { user, permissions, params }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      const postId = (params as { id?: string })?.id;
      if (!postId) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Post id is required', messageAr: 'معرّف المنشور مطلوب' },
          },
          { status: 400 }
        );
      }

      const recognition = await prisma.recognition.findFirst({
        where: { id: postId, tenantId: user.tenantId },
      });
      if (!recognition) {
        return NextResponse.json(
          { success: false, error: { message: 'Post not found', messageAr: 'المنشور غير موجود' } },
          { status: 404 }
        );
      }

      const reactions = (recognition.reactions as Record<string, unknown> | null) || {};
      const likes: string[] = Array.isArray((reactions as { likes?: unknown }).likes)
        ? (reactions as { likes: string[] }).likes
        : [];
      const liked = likes.includes(user.userId);
      const nextLikes = liked ? likes.filter((u) => u !== user.userId) : [...likes, user.userId];

      const updated = await prisma.recognition.update({
        where: { id: postId },
        data: { reactions: { ...reactions, likes: nextLikes } },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          liked: !liked,
          likeCount: nextLikes.length,
        },
      });
    } catch (error: any) {
      logger.error('Error liking post:', error);
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Failed to like post', messageAr: 'فشل الإعجاب بالمنشور' },
        },
        { status: 500 }
      );
    }
  }
);
