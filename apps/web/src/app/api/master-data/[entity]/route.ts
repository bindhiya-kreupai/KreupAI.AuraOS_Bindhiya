import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Map entity names from URL to Prisma model names
const entityMap: Record<string, string> = {
    // General
    'currencies': 'currency',
    'languages': 'language',
    'document-types': 'documentType',
    'tenants': 'tenant',

    // Organization
    'business-units': 'businessUnit',
    'designations': 'designation',
    'companies': 'company',
    'departments': 'department',
    'cost-centers': 'costCenter',
    'locations': 'location',

    // Geo-Data
    'countries': 'country',
    'states': 'state',
    'cities': 'city',
    'addresses': 'address',

    // Job Architecture
    'job-functions': 'jobFunction',
    'job-families': 'jobFamily',
    'job-profiles': 'jobProfile',
    'grades': 'grade',

    // Employment
    'skills': 'skill',
    'competencies': 'competency',
    'employment-statuses': 'employeeStatus', // Enum handling might be needed, or if it's a model now
    'employment-types': 'employmentType', // Same here

    // Time & Leave
    'leave-types': 'leaveType',
    'shift-types': 'shiftType',
    'holidays': 'holiday',

    // Payroll
    'tax-regimes': 'taxRegime',
    'pay-components': 'payComponent',
    'banks': 'bank',

    // System
    'roles-permissions': 'role', // Mapping 'roles-permissions' to 'Role' model
    'system-settings': 'systemSetting',

    // Extended
    'education-levels': 'educationLevel',
    'relationships': 'relationship',
    'exit-reasons': 'exitReason',
};

export async function GET(
    request: Request,
    { params }: { params: { entity: string } }
) {
    try {
        const modelName = entityMap[params.entity];

        if (!modelName) {
            return NextResponse.json(
                { error: `Entity '${params.entity}' not found` },
                { status: 404 }
            );
        }

        // @ts-ignore - Dynamic access to prisma models
        const data = await prisma[modelName].findMany({
            orderBy: {
                // Try to order by name if it exists, otherwise createdAt if it exists, otherwise id
                name: 'asc',
            },
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: { entity: string } }
) {
    try {
        const modelName = entityMap[params.entity];

        if (!modelName) {
            return NextResponse.json(
                { error: `Entity '${params.entity}' not found` },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Special handling for Company creation to inject tenantId
        if (modelName === 'company' && !body.tenantId) {
            // Try to find the default tenant seeded
            const tenant = await prisma.tenant.findUnique({
                where: { code: 'KREUP_AI' }
            });
            if (tenant) {
                body.tenantId = tenant.id;
            } else {
                console.warn('Default tenant KREUP_AI not found. Company creation might fail if tenantId is required.');
            }
        }

        // Remove id if present to allow database to generate it
        const { id, ...createData } = body;

        // @ts-ignore
        const newItem = await prisma[modelName].create({
            data: createData,
        });

        return NextResponse.json(newItem);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { entity: string } }
) {
    try {
        const modelName = entityMap[params.entity];

        if (!modelName) {
            return NextResponse.json(
                { error: `Entity '${params.entity}' not found` },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required for update' },
                { status: 400 }
            );
        }

        // @ts-ignore
        const updatedItem = await prisma[modelName].update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { entity: string } }
) {
    try {
        const modelName = entityMap[params.entity];

        if (!modelName) {
            return NextResponse.json(
                { error: `Entity '${params.entity}' not found` },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required for delete' },
                { status: 400 }
            );
        }

        // @ts-ignore
        await prisma[modelName].delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
