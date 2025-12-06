import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([
        { id: '1', action: 'Login', user: { email: 'admin@aura.com' }, details: 'User logged in', timestamp: new Date() },
        { id: '2', action: 'Update', user: { email: 'hr@aura.com' }, details: 'Updated employee record', timestamp: new Date() },
    ]);
}
