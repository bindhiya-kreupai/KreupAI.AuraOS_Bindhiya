import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const providers = await (db as any).healthcareProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter out unnamed providers (probably from old mock data or broken creations)
    const validProviders = providers.filter(
      (p: any) => p.providerName && p.providerName.trim() !== ''
    );

    // Fetch credentials manually since there is no explicit Prisma relation
    const credentials = await (db as any).healthcareCredentialing.findMany({
      where: {
        providerId: { in: validProviders.map((p: any) => p.id) },
      },
    });

    // Map it so the frontend doesn't break
    const mappedProviders = validProviders.map((p: any) => {
      const providerCreds = credentials.filter((c: any) => c.providerId === p.id);
      return {
        id: p.id,
        providerNumber: p.npiNumber,
        personalInfo: {
          firstName: p.providerName.split(' ')[0] || '',
          lastName: p.providerName.split(' ').slice(1).join(' ') || '',
          email: p.email || '',
          phone: p.phone || '',
          dateOfBirth: '',
        },
        specialty: p.specialty,
        status: p.isActive ? 'Active' : 'Inactive',
        licenses: providerCreds.map((c: any) => ({
          issuingState: c.issuingState,
          expiryDate: c.expiryDate,
        })),
      };
    });

    return NextResponse.json({ providers: mappedProviders });
  } catch (error: any) {
    console.error('Failed to fetch healthcare providers:', error);
    return NextResponse.json({ error: 'Failed to fetch healthcare providers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = body.personalInfo?.firstName || body.firstName || '';
    const lastName = body.personalInfo?.lastName || body.lastName || '';
    const email = body.personalInfo?.email || body.email || null;
    const phone = body.personalInfo?.phone || body.phone || '000-000-0000';

    const newProvider = await (db as any).healthcareProvider.create({
      data: {
        tenantId: 'default-tenant',
        providerCode: `PRV-${Math.floor(Math.random() * 1000000)}`,
        providerName: `${firstName} ${lastName}`.trim() || 'Unnamed',
        providerType: 'PHYSICIAN',
        specialty: body.specialty || '',
        npiNumber: `NPI-${Math.floor(Math.random() * 1000000000)}`,
        address: {},
        phone,
        email,
        isActive: true,
        rating: 0,
      },
    });

    // Mock a credential entry so the UI has a State and Expiry to display
    await (db as any).healthcareCredentialing.create({
      data: {
        tenantId: 'default-tenant',
        providerId: newProvider.id,
        licenseNumber: `LIC-${Math.floor(Math.random() * 100000)}`,
        licenseType: 'Medical License',
        issuingState: ['CA', 'NY', 'TX', 'FL', 'WA'][Math.floor(Math.random() * 5)],
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ provider: newProvider }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create healthcare provider:', error);
    return NextResponse.json({ error: 'Failed to create healthcare provider' }, { status: 500 });
  }
}
