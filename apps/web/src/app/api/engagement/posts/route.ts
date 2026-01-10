import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockPosts = [
        {
          id: 'post-1',
          authorId: 'user-1',
          authorName: 'John Doe',
          content: 'Excited to share our team achievements this quarter!',
          type: 'announcement',
          status: 'published',
          likes: [],
          comments: [],
          createdDate: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockPosts });
    } catch (error) {
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
      const newPost = {
        ...body,
        id: `post-${Date.now()}`,
        authorId: user.userId,
        authorName: user.name,
        createdDate: new Date().toISOString(),
        status: 'published',
      };

      return NextResponse.json({ success: true, data: newPost }, { status: 201 });
    } catch (error) {
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
      return NextResponse.json({ success: true, data: { ...body, lastModified: new Date().toISOString() } });
    } catch (error) {
      logger.error('Error updating post:', error);
      return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
    }
  }
);
