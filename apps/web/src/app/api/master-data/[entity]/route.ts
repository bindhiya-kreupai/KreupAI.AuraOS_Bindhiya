import { NextResponse } from 'next/server';

const MOCK_DATA = {
    'cities': [
        { id: '1', name: 'New York', stateId: '1', country: 'USA' },
        { id: '2', name: 'San Francisco', stateId: '2', country: 'USA' },
    ],
    'states': [
        { id: '1', name: 'New York', countryId: '1' },
        { id: '2', name: 'California', countryId: '1' },
        { id: '3', name: 'Texas', countryId: '1' },
    ],
    'countries': [
        { id: '1', name: 'United States', code: 'USA' },
        { id: '2', name: 'United Kingdom', code: 'UK' },
        { id: '3', name: 'India', code: 'IND' },
        { id: '4', name: 'UAE', code: 'UAE' },
    ],
    'job-families': [
        { id: '1', name: 'Engineering', code: 'ENG' },
        { id: '2', name: 'Sales', code: 'SALE' },
    ],
    'job-functions': [
        { id: '1', name: 'Software Development', familyId: '1' },
        { id: '2', name: 'Direct Sales', familyId: '2' },
    ],
    'grades': [
        { id: '1', name: 'L1', band: 'Junior' },
        { id: '2', name: 'L2', band: 'Senior' },
    ],
    'currencies': [
        { id: '1', name: 'US Dollar', code: 'USD' },
    ],
    'languages': [
        { id: '1', name: 'English', code: 'en' },
    ],
};

export async function GET(
    request: Request,
    { params }: { params: { entity: string } }
) {
    const entity = params.entity;
    // @ts-ignore
    const data = MOCK_DATA[entity] || [
        { id: 'mock-1', name: `Mock ${entity} 1` },
        { id: 'mock-2', name: `Mock ${entity} 2` },
    ];

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    return NextResponse.json({ id: 'new-id', status: 'created (mock)' });
}

export async function PUT(request: Request) {
    return NextResponse.json({ status: 'updated (mock)' });
}

export async function DELETE(request: Request) {
    return NextResponse.json({ success: true });
}
