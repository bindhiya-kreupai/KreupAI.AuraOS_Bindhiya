import { NextRequest, NextResponse } from 'next/server';

let hires = [
    { id: '1', candidateName: 'Sarah Connor', position: 'Sales Associate', status: 'hired', startDate: '2024-11-01', storeId: '1' },
    { id: '2', candidateName: 'Kyle Reese', position: 'Warehouse Support', status: 'interviewing', startDate: '2024-11-15', storeId: '2' }
];

export async function GET(req: NextRequest) {
    return NextResponse.json({ hires });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newHire = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'applied',
    };
    hires.push(newHire);
    return NextResponse.json({ hire: newHire });
}

export async function PUT(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const updates = await req.json();

    const index = hires.findIndex(h => h.id === id);
    if (index !== -1) {
        hires[index] = { ...hires[index], ...updates };
        return NextResponse.json({ hire: hires[index] });
    }

    return NextResponse.json({ error: 'Hire record not found' }, { status: 404 });
}
