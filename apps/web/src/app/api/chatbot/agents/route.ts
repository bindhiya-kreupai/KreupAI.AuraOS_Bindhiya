import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    return successList([], 1, 20, 0);
  } catch (error: any) {
    return serverError(error, 'list agents');
  }
});
