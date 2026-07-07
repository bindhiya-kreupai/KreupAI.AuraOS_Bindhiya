/**
 * Shared helpers for /api/career/* routes.
 *
 * All career routes use `withEnhancedAuth`, derive tenant/user/employee from the
 * auth context (never from the client), and return raw arrays/objects so the
 * dashboard/career service layer (which returns the fetch body directly) works
 * unchanged. Errors follow the bilingual `{ message, messageAr }` convention.
 */

import { NextResponse } from 'next/server';
import type { CareerContext } from '@/lib/services/career/career.service';

export function buildCareerContext(context: any): CareerContext {
  const user = context?.user ?? {};
  return {
    tenantId: user.tenantId,
    userId: user.userId,
    employeeId: context?.employeeId ?? user.employeeId,
  };
}

export function careerError(message: string, messageAr: string, status: number): NextResponse {
  return NextResponse.json({ success: false, message, messageAr }, { status });
}

export function serverError(prefix: string, error: unknown): NextResponse {
  console.error(`[Career API] ${prefix}:`, error);
  return careerError(
    'An unexpected error occurred while processing the request.',
    'حدث خطأ غير متوقع أثناء معالجة الطلب.',
    500
  );
}
