import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/forms:submit')) return forbidden('admin/forms:submit');
    const body = await safeJson(request);
    if (!body || !body.answers) return validationError({ message: 'answers required' });
    const form = await prisma.adminForm.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!form) return notFound('Form');
    const submission = await prisma.formSubmission.create({
      data: {
        tenantId: user.tenantId,
        formId: params.id,
        employeeId: body.employeeId || user.userId,
        answers: body.answers,
      },
    });
    return successItem(submission, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'submit form');
  }
});
