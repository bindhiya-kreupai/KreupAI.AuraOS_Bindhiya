import { NextResponse } from 'next/server';

// Mock Data
let mockData = [
    { id: '1', name: 'HR Admin', type: 'Role', value: 'Full Access', status: 'Active', createdAt: new Date() },
    { id: '2', name: 'Employee View', type: 'Policy', value: 'Read Only', status: 'Active', createdAt: new Date() },
];

export async function GET() {
    return NextResponse.json(mockData);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, value, status } = body;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            value,
            status,
            createdAt: new Date(),
        };

        mockData.push(newItem);
        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, type, value, status } = body;

        const index = mockData.findIndex(item => item.id === id);
        if (index !== -1) {
            mockData[index] = { ...mockData[index], name, type, value, status };
            return NextResponse.json(mockData[index]);
        }
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        mockData = mockData.filter(item => item.id !== id);
    }
    return NextResponse.json({ success: true });
}
