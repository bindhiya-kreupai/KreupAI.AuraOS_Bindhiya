import type { NextRequest } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shift-swaps:update')) return forbidden('shift-swaps:update');
    const result = await ShiftManagementService.managerApproveSwap(
      params.id,
      user.tenantId,
      user.userId
    );
    return successItem(result);
  } catch (error: any) {
    return serverError(error, 'approve swap');
  }
});
