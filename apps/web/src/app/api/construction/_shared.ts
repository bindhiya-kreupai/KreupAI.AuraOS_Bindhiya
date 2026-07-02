/**
 * Shared helpers for /api/construction/* routes.
 *
 * All construction routes use `withEnhancedAuth`, derive tenant/user/employee
 * from the auth context (never from the client), and return raw arrays/objects
 * so the dashboard/construction service layer (which returns the fetch body
 * directly) works unchanged. Errors follow the bilingual
 * `{ message, messageAr }` convention.
 */

import { NextResponse } from 'next/server';
import type { ConstructionContext } from '@/lib/services/construction/construction.service';

export function buildConstructionContext(context: any): ConstructionContext {
  const user = context?.user ?? {};
  return {
    tenantId: user.tenantId,
    userId: user.userId,
    employeeId: context?.employeeId ?? user.employeeId,
  };
}

export function constructionError(
  message: string,
  messageAr: string,
  status: number
): NextResponse {
  return NextResponse.json({ success: false, message, messageAr }, { status });
}

export function serverError(prefix: string, error: unknown): NextResponse {
  console.error(`[Construction API] ${prefix}:`, error);
  return constructionError(
    'An unexpected error occurred while processing the request.',
    'حدث خطأ غير متوقع أثناء معالجة الطلب.',
    500
  );
}
