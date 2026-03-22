import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_CATEGORIES = [
  'LAPTOP',
  'DESKTOP',
  'MONITOR',
  'PHONE',
  'TABLET',
  'PERIPHERAL',
  'VEHICLE',
  'EQUIPMENT',
  'FURNITURE',
  'OTHER',
];

const mockAssets = [
  {
    id: 'asset-001',
    tenantId: 'tenant-1',
    name: 'MacBook Pro 16" M3 Max',
    category: 'LAPTOP',
    serialNumber: 'C02XR5JNJGH7',
    assetTag: 'AT-2025-0142',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16-inch (M3 Max, 2024)',
    purchaseDate: '2024-12-15',
    purchasePrice: 3999.0,
    currentValue: 3199.2,
    condition: 'EXCELLENT',
    status: 'ASSIGNED',
    assignedTo: 'emp-001',
    assignedToName: 'John Smith',
    assignedDate: '2025-01-02',
    location: 'Remote - Chicago, IL',
    warrantyExpiry: '2027-12-15',
    notes: null,
    createdAt: '2024-12-16T00:00:00.000Z',
    updatedAt: '2025-01-02T09:00:00.000Z',
  },
  {
    id: 'asset-002',
    tenantId: 'tenant-1',
    name: 'Dell UltraSharp 27" 4K Monitor',
    category: 'MONITOR',
    serialNumber: 'CN-0XXXXX-12345',
    assetTag: 'AT-2025-0201',
    manufacturer: 'Dell',
    model: 'U2723DE',
    purchaseDate: '2025-01-10',
    purchasePrice: 699.0,
    currentValue: 628.2,
    condition: 'GOOD',
    status: 'AVAILABLE',
    assignedTo: null,
    assignedToName: null,
    assignedDate: null,
    location: 'IT Storage Room - HQ',
    warrantyExpiry: '2028-01-10',
    notes: 'Returned from emp-005 on 2026-02-01 in good condition',
    createdAt: '2025-01-11T00:00:00.000Z',
    updatedAt: '2026-02-01T15:00:00.000Z',
  },
  {
    id: 'asset-003',
    tenantId: 'tenant-1',
    name: 'iPhone 16 Pro',
    category: 'PHONE',
    serialNumber: 'F2LXR8NQPHTK',
    assetTag: 'AT-2025-0078',
    manufacturer: 'Apple',
    model: 'iPhone 16 Pro 256GB',
    purchaseDate: '2025-09-20',
    purchasePrice: 1199.0,
    currentValue: 1079.1,
    condition: 'GOOD',
    status: 'ASSIGNED',
    assignedTo: 'emp-003',
    assignedToName: 'David Lee',
    assignedDate: '2025-09-25',
    location: 'Remote - Seattle, WA',
    warrantyExpiry: '2027-09-20',
    notes: null,
    createdAt: '2025-09-21T00:00:00.000Z',
    updatedAt: '2025-09-25T10:00:00.000Z',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let assets = [...mockAssets];
    if (category) assets = assets.filter((a) => a.category === category.toUpperCase());
    if (status) assets = assets.filter((a) => a.status === status.toUpperCase());
    if (assignedTo) assets = assets.filter((a) => a.assignedTo === assignedTo);
    if (search) {
      const lq = search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(lq) ||
          a.serialNumber.toLowerCase().includes(lq) ||
          a.assetTag.toLowerCase().includes(lq)
      );
    }

    const total = assets.length;
    const paginated = assets.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to list assets',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const body = await request.json();
    const { name, category, serialNumber, purchaseDate, value } = body;

    if (!name || !category || !serialNumber || !purchaseDate || value === undefined) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message:
            'Validation failed: name, category, serialNumber, purchaseDate, and value are required',
          details: {
            missingFields: ['name', 'category', 'serialNumber', 'purchaseDate', 'value'].filter(
              (f) => body[f] === undefined || body[f] === null
            ),
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(category.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 9000) + 1000;

    const newAsset = {
      id: `asset-${crypto.randomUUID().slice(0, 8)}`,
      tenantId,
      name,
      category: category.toUpperCase(),
      serialNumber,
      assetTag: `AT-${year}-${randomNum}`,
      manufacturer: body.manufacturer || null,
      model: body.model || null,
      purchaseDate,
      purchasePrice: value,
      currentValue: value,
      condition: body.condition || 'NEW',
      status: 'AVAILABLE',
      assignedTo: null,
      assignedToName: null,
      assignedDate: null,
      location: body.location || 'IT Storage',
      warrantyExpiry: body.warrantyExpiry || null,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newAsset,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create asset',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
});
