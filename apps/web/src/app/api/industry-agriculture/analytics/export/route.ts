import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: NextRequest) => {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'pdf';
  const supportedFormats = ['pdf', 'excel'];

  if (!supportedFormats.includes(format)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unsupported format',
        errorAr: 'تنسيق غير مدعوم',
      },
      { status: 400 }
    );
  }

  const contentType =
    format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';
  const buffer = Buffer.from(`Analytics export placeholder for format: ${format}`);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="agriculture-analytics.${format === 'excel' ? 'xlsx' : 'pdf'}"`,
    },
  });
});
