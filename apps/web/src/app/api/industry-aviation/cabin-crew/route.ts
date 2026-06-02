import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

const members = [
    { id: '1', name: 'Emily Blunt', position: 'Senior Pursuer', status: 'on-duty', flightId: 'AF123' },
    { id: '2', name: 'Tom Hardy', position: 'Flight Attendant', status: 'rest', flightId: null }
];

const assignments = [
    { id: '1', crewId: '1', flightNumber: 'AF123', departure: 'CDG', arrival: 'JFK', date: '2024-03-20' }
];

export async function GET(req: NextRequest) {
    const { pathname } = new URL(req.url);
    if (pathname.includes('/members')) {
        return NextResponse.json({ crewMembers: members });
    }
    if (pathname.includes('/assignments')) {
        return NextResponse.json({ assignments });
    }
    return NextResponse.json({ crewMembers: members, assignments });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newMember = { id: Math.random().toString(36).substr(2, 9), ...data };
    members.push(newMember);
    return NextResponse.json({ crewMember: newMember });
}
