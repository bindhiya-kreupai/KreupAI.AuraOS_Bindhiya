import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { careerService } from '@/lib/services/career/career.service';
import { buildCareerContext, careerError, serverError } from '../../../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const ctx = buildCareerContext(context);
    const id = context?.params?.id;
    if (!id) return careerError('Missing employee id.', 'معرّف الموظف مفقود.', 400);
    const item = await careerService.getByEmployee('mobility-preference', ctx, id);
    if (!item)
      return careerError('Mobility preference not found.', 'تفضيلات التنقل غير موجودة.', 404);
    return NextResponse.json(item);
  } catch (error) {
    return serverError('GET mobility-preference by employee', error);
  }
});
