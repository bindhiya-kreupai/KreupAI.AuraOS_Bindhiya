import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');

  const mockDocuments = [
    {
      id: 'doc-001',
      employeeId: id,
      name: 'Employment Contract',
      category: 'contracts',
      fileType: 'pdf',
      fileSize: 245890,
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'hr-admin-001',
      status: 'active',
      version: 2,
    },
    {
      id: 'doc-002',
      employeeId: id,
      name: 'NDA Agreement',
      category: 'legal',
      fileType: 'pdf',
      fileSize: 128450,
      uploadedAt: '2024-01-15T10:35:00Z',
      uploadedBy: 'hr-admin-001',
      status: 'active',
      version: 1,
    },
    {
      id: 'doc-003',
      employeeId: id,
      name: 'Performance Review 2024',
      category: 'reviews',
      fileType: 'pdf',
      fileSize: 98200,
      uploadedAt: '2024-06-20T14:00:00Z',
      uploadedBy: 'manager-001',
      status: 'active',
      version: 1,
    },
    {
      id: 'doc-004',
      employeeId: id,
      name: 'Benefits Enrollment Form',
      category: 'benefits',
      fileType: 'pdf',
      fileSize: 67800,
      uploadedAt: '2024-01-20T09:00:00Z',
      uploadedBy: id,
      status: 'active',
      version: 1,
    },
    {
      id: 'doc-005',
      employeeId: id,
      name: 'Direct Deposit Authorization',
      category: 'payroll',
      fileType: 'pdf',
      fileSize: 45300,
      uploadedAt: '2024-01-16T11:00:00Z',
      uploadedBy: id,
      status: 'active',
      version: 1,
    },
  ];

  const filtered = category
    ? mockDocuments.filter((doc) => doc.category === category)
    : mockDocuments;

  return NextResponse.json({
    data: filtered,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}
