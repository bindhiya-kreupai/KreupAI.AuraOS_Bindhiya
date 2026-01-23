import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      siteConfig: {
        companyName: 'AuraOS Technologies',
        tagline: 'Build the future with us',
        logoUrl: '/assets/logo.png',
        bannerUrl: '/assets/career-banner.jpg',
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        description: 'Join our team and work on cutting-edge technology solutions.',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/auraos',
          twitter: 'https://twitter.com/auraos',
          glassdoor: 'https://glassdoor.com/auraos',
        },
        benefits: [
          'Remote-first culture',
          'Unlimited PTO',
          'Health & dental insurance',
          'Learning & development budget',
          'Stock options',
        ],
        activeJobCount: 12,
        isPublished: true,
        lastUpdatedAt: '2026-01-20T10:00:00Z',
      },
    },
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      siteConfig: {
        ...body,
        lastUpdatedAt: new Date().toISOString(),
      },
      message: 'Career site configuration updated successfully',
    },
  });
}
