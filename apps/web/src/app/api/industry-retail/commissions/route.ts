import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

const commissions = [
    { id: '1', employeeName: 'Alice Johnson', amount: 1250, target: 10000, achieved: 12500, status: 'approved', date: '2024-03-01' },
    { id: '2', employeeName: 'Bob Smith', amount: 850, target: 8000, achieved: 7500, status: 'pending', date: '2024-03-05' }
];

export async function GET(req: NextRequest) {
    return NextResponse.json({ commissions });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newCommission = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'pending',
        date: new Date().toISOString()
    };
    commissions.push(newCommission);
    return NextResponse.json({ commission: newCommission });
}

export async function PUT(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const updates = await req.json();

    const index = commissions.findIndex(c => c.id === id);
    if (index !== -1) {
        commissions[index] = { ...commissions[index], ...updates };
        return NextResponse.json({ commission: commissions[index] });
    }

    return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
}
