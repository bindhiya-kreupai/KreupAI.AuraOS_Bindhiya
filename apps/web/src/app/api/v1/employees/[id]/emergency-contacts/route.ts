import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const mockContacts = [
    {
      id: 'ec-001',
      employeeId: id,
      name: 'Emily Smith',
      relationship: 'spouse',
      isPrimary: true,
      phone: '+1-555-0101',
      alternatePhone: '+1-555-0102',
      email: 'emily.smith@email.com',
      address: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'ec-002',
      employeeId: id,
      name: 'Robert Smith',
      relationship: 'parent',
      isPrimary: false,
      phone: '+1-555-0201',
      alternatePhone: null,
      email: 'robert.smith@email.com',
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
      },
      createdAt: '2024-01-15T10:05:00Z',
      updatedAt: '2024-01-15T10:05:00Z',
    },
  ];

  return NextResponse.json({
    data: mockContacts,
    pagination: {
      page,
      limit,
      total: mockContacts.length,
      totalPages: 1,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  if (!body.name || !body.relationship || !body.phone) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Fields name, relationship, and phone are required',
      },
      { status: 400 }
    );
  }

  const newContact = {
    id: 'ec-' + Date.now(),
    employeeId: id,
    name: body.name,
    relationship: body.relationship,
    isPrimary: body.isPrimary || false,
    phone: body.phone,
    alternatePhone: body.alternatePhone || null,
    email: body.email || null,
    address: body.address || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newContact }, { status: 201 });
}
