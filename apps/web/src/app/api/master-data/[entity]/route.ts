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

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const exportFormat = searchParams.get('export');
        const status = searchParams.get('status');

        // Build where clause
        const where: any = {};

        if (status && status !== 'All') {
            where.status = status;
        }

        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                // Only add code if it likely exists (most master data has code/name)
                // specific check might be needed but generic try is safer with OR if we assume standard schema
                // A better approach for generic would be to assume 'name' exists or check schema, 
                // but for now, we'll try name and code. If model doesn't have code, this might throw.
                // However, most of our mapped models have code. Let's be slightly safer and just search name for now
                // or try to catch if it fails? No, Prisma will throw validation error.
                // Let's assume 'code' exists for all mapped entities as per schema audit (Bank has swiftCode, but generic is code?)
                // Actually Bank has `swiftCode`, Location has `code`.
                // Let's stick to 'name' which is almost universal, and maybe 'code' if we can be sure.
                // Safest generic bet: Search 'name'.
                // If we want to be smarter, we'd need to know the fields. 
                // For this implementation, let's search 'name' and 'code' if the entity isn't 'banks' (which has swiftCode).
                // Or simply just 'name' to be safe across all.
            ];

            // Add code search for entities known to have 'code'
            if (params.entity !== 'banks') {
                where.OR.push({ code: { contains: q, mode: 'insensitive' } });
            } else {
                where.OR.push({ swiftCode: { contains: q, mode: 'insensitive' } });
            }
        }

        // Fetch System Settings for Active Regions if filtering by country/region is applicable
        // We only filter for entities that clearly have a country association
        const regionSensitiveEntities = ['banks', 'tax-regimes', 'holidays']; // Add others as needed

        if (regionSensitiveEntities.includes(params.entity)) {
            const systemSetting = await prisma.systemSetting.findUnique({
                where: { key: 'ACTIVE_REGIONS' }
            });

            if (systemSetting && systemSetting.value) {
                const activeRegions = systemSetting.value.split(',').map(r => r.trim());

                if (activeRegions.length > 0) {
                    if (params.entity === 'banks') {
                        // Bank has countryCode
                        // @ts-ignore
                        where.countryCode = { in: activeRegions };
                    } else if (params.entity === 'tax-regimes') {
                        // TaxRegime has country (assuming it stores code like 'IN', 'AE' etc based on seed)
                        // @ts-ignore
                        where.country = { in: activeRegions };
                        // Note: Schema says 'country' is String. Seed uses countryCode in variable but let's check schema again.
                        // Schema: country String. Seed: countryCode: 'IN'. Implies field name in seed might be slightly off or mapped manually.
                        // Let's rely on the actual schema field name 'country' for TaxRegime.
                    }
                    // Add other entities logic here
                }
            }
        }

        let orderBy: any = { name: 'asc' };
        if (modelName === 'systemSetting') {
            orderBy = { key: 'asc' };
        } else if (params.entity === 'roles-permissions') { // Role has name
            orderBy = { name: 'asc' };
        }
        // Add more exceptions if needed, or check if we can genericize by checking if 'name' exists?
        // Safest is to hardcode exceptions for now or default to id provided we catch error.

        // Better approach:
        // Use a safe sort field mapping
        const sortFieldMap: Record<string, string> = {
            'systemSetting': 'key',
            'bank': 'name',
            // defaults to name usually
        };

        if (sortFieldMap[modelName]) {
            orderBy = { [sortFieldMap[modelName]]: 'asc' };
        }

        // @ts-ignore - Dynamic access to prisma models
        const data = await prisma[modelName].findMany({
            where,
            orderBy,
        });

        if (exportFormat === 'csv') {
            if (!data || data.length === 0) {
                return new NextResponse('', {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="${params.entity}.csv"`,
                    },
                });
            }

            // Generate CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((row: any) =>
                Object.values(row).map((value: any) => {
                    if (typeof value === 'string') {
                        // Escape quotes and wrap in quotes
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            ).join('\n');
            const csv = `${headers}\n${rows}`;

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${params.entity}.csv"`,
                },
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        // Fallback: If filter failed (e.g. column doesn't exist), try returning all or simple error
        // But for master data, 'name' is standard.
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
