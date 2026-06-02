import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

// All supported industries with metadata
const INDUSTRIES = [
    { code: 'agriculture', name: 'Agriculture', icon: 'Sprout', description: 'Farm and agricultural workforce management' },
    { code: 'automotive', name: 'Automotive', icon: 'Car', description: 'Automotive manufacturing and dealership HR' },
    { code: 'aviation', name: 'Aviation', icon: 'Plane', description: 'Airlines and aviation industry workforce' },
    { code: 'construction', name: 'Construction', icon: 'HardHat', description: 'Construction and building industry HR' },
    { code: 'energy', name: 'Energy', icon: 'Zap', description: 'Power and energy sector management' },
    { code: 'financial', name: 'Financial Services', icon: 'Building', description: 'Banking and financial services HR' },
    { code: 'government', name: 'Government', icon: 'Landmark', description: 'Public sector and government HR' },
    { code: 'healthcare', name: 'Healthcare', icon: 'Heart', description: 'Healthcare and medical workforce' },
    { code: 'hospitality', name: 'Hospitality', icon: 'Hotel', description: 'Hotels, restaurants and hospitality' },
    { code: 'logistics', name: 'Logistics', icon: 'Truck', description: 'Transportation and logistics workforce' },
    { code: 'manufacturing', name: 'Manufacturing', icon: 'Factory', description: 'Manufacturing and production HR' },
    { code: 'maritime', name: 'Maritime', icon: 'Anchor', description: 'Shipping and maritime industry' },
    { code: 'media', name: 'Media & Entertainment', icon: 'Film', description: 'Media and entertainment workforce' },
    { code: 'mining', name: 'Mining', icon: 'Mountain', description: 'Mining and extraction industry' },
    { code: 'nonprofit', name: 'Nonprofit', icon: 'Heart', description: 'Nonprofit and NGO workforce' },
    { code: 'retail', name: 'Retail', icon: 'ShoppingBag', description: 'Retail and e-commerce HR' },
];

/**
 * GET /api/industry
 * List all supported industries
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            industries: INDUSTRIES,
            total: INDUSTRIES.length,
        });
    } catch (error: any) {
        console.error('Industry list API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
