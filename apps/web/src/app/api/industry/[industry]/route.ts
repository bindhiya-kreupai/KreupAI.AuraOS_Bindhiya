import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Static industry-vertical metadata. This endpoint never reads private data,
// so it remains publicly accessible like /api/industry.
const INDUSTRY_META: Record<string, any> = {
  agriculture: { name: 'Agriculture', icon: 'Sprout' },
  automotive: { name: 'Automotive', icon: 'Car' },
  aviation: { name: 'Aviation', icon: 'Plane' },
  construction: { name: 'Construction', icon: 'HardHat' },
  energy: { name: 'Energy', icon: 'Zap' },
  financial: { name: 'Financial Services', icon: 'Building' },
  government: { name: 'Government', icon: 'Landmark' },
  healthcare: { name: 'Healthcare', icon: 'Heart' },
  hospitality: { name: 'Hospitality', icon: 'Hotel' },
  logistics: { name: 'Logistics', icon: 'Truck' },
  manufacturing: { name: 'Manufacturing', icon: 'Factory' },
  maritime: { name: 'Maritime', icon: 'Anchor' },
  media: { name: 'Media', icon: 'Tv' },
  mining: { name: 'Mining', icon: 'Mountain' },
  nonprofit: { name: 'Nonprofit', icon: 'Heart' },
  retail: { name: 'Retail', icon: 'ShoppingCart' },
};

export async function GET(_request: NextRequest, { params }: { params: { industry: string } }) {
  const code = params.industry?.toLowerCase();
  const meta = INDUSTRY_META[code];
  if (!meta) {
    return NextResponse.json(
      { success: false, error: { code: 'E2001', message: 'Unknown industry' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: { code, ...meta } });
}
