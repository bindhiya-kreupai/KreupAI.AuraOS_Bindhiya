import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
}
