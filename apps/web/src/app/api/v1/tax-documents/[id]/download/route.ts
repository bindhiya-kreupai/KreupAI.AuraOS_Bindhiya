import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('tax-documents:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing tax-documents:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { id } = context.params;

  // Mock PDF content for tax document
  const mockPdfContent = Buffer.from(
    `Mock tax document PDF content for ID: ${id}\nForm W-2 - Wage and Tax Statement\nTax Year: 2024`
  );

  return new NextResponse(mockPdfContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tax-document-${id}.pdf"`,
      'Content-Length': mockPdfContent.length.toString(),
      'X-Document-Id': id,
      'X-Document-Type': 'W-2',
      'X-Tax-Year': '2024',
      'Cache-Control': 'private, no-cache',
    },
  });
});
