import { NextRequest, NextResponse } from 'next/server';

// Mock data in-memory storage
let stores = [
    { id: '1', name: 'Downtown Flagship', location: 'New York, NY', manager: 'John Doe', status: 'open', weeklySales: 125000, footTraffic: 8500 },
    { id: '2', name: 'Westside Mall', location: 'Los Angeles, CA', manager: 'Jane Smith', status: 'open', weeklySales: 98000, footTraffic: 12000 },
    { id: '3', name: 'North Shore Outlet', location: 'Chicago, IL', manager: 'Bob Wilson', status: 'maintenance', weeklySales: 45000, footTraffic: 3000 }
];

export async function GET(req: NextRequest) {
    return NextResponse.json({ stores });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newStore = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: data.status || 'open',
        weeklySales: 0,
        footTraffic: 0
    };
    stores.push(newStore);
    return NextResponse.json({ store: newStore });
}

export async function PUT(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const updates = await req.json();

    const index = stores.findIndex(s => s.id === id);
    if (index !== -1) {
        stores[index] = { ...stores[index], ...updates };
        return NextResponse.json({ store: stores[index] });
    }

    // Global update if no ID provided (not recommended but for completeness)
    if (!id || id === 'stores') {
        const body = updates;
        // In a real scenario, this would be a more complex update logic
        return NextResponse.json({ store: body });
    }

    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
}
