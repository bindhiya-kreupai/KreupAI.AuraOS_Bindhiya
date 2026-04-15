import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { id } = context.params;

  // Mock file content (in production, this would fetch from storage)
  const mockFileContent = Buffer.from(`Mock document content for document ID: ${id}`);

  return new NextResponse(mockFileContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="document-${id}.pdf"`,
      'Content-Length': mockFileContent.length.toString(),
      'X-Document-Id': id,
      'X-Document-Name': `Document ${id}`,
    },
  });
});
