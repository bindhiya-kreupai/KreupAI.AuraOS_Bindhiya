/**
 * Nitaqat (Saudization) API Routes - KSA
 *
 * @swagger
 * /api/compliance/nitaqat:
 *   post:
 *     summary: Calculate Nitaqat status for a company
 *     tags: [Compliance - Nitaqat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - industryCode
 *               - industryName
 *               - totalEmployees
 *               - saudiEmployees
 *             properties:
 *               companyId:
 *                 type: string
 *               industryCode:
 *                 type: string
 *               industryName:
 *                 type: string
 *               totalEmployees:
 *                 type: number
 *               saudiEmployees:
 *                 type: number
 *     responses:
 *       200:
 *         description: Nitaqat status calculated
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { NitaqatService, NITAQAT_BAND_COLORS } from '@/lib/services/compliance';
import type { NitaqatBand } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/nitaqat
 * Calculate Nitaqat status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['companyId', 'industryCode', 'industryName', 'totalEmployees', 'saudiEmployees'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, errorAr: `حقل مطلوب مفقود: ${field}` },
          { status: 400 }
        );
      }
    }

    const status = NitaqatService.calculateStatus(
      body.companyId,
      body.industryCode,
      body.industryName,
      parseInt(body.totalEmployees),
      parseInt(body.saudiEmployees)
    );

    // Get band benefits
    const bandInfo = NitaqatService.getBandBenefits(status.band);
    const bandColor = NITAQAT_BAND_COLORS[status.band];

    return NextResponse.json({
      success: true,
      data: {
        status,
        bandInfo,
        bandColor,
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to calculate Nitaqat status', errorAr: 'فشل في حساب حالة نطاقات' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/nitaqat
 * Get Nitaqat reference data (industries, band colors)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'simulate') {
      // Simulate a change
      const companyId = url.searchParams.get('companyId') || '';
      const industryCode = url.searchParams.get('industryCode') || '';
      const industryName = url.searchParams.get('industryName') || '';
      const totalEmployees = parseInt(url.searchParams.get('totalEmployees') || '0');
      const saudiEmployees = parseInt(url.searchParams.get('saudiEmployees') || '0');
      const saudiChange = parseInt(url.searchParams.get('saudiChange') || '0');
      const nonSaudiChange = parseInt(url.searchParams.get('nonSaudiChange') || '0');

      const currentStatus = NitaqatService.calculateStatus(
        companyId,
        industryCode,
        industryName,
        totalEmployees,
        saudiEmployees
      );

      const simulatedStatus = NitaqatService.simulateChange(
        currentStatus,
        saudiChange,
        nonSaudiChange,
        industryCode
      );

      return NextResponse.json({
        success: true,
        data: {
          current: currentStatus,
          simulated: simulatedStatus,
          change: {
            saudiChange,
            nonSaudiChange,
            bandChanged: currentStatus.band !== simulatedStatus.band,
            newBand: simulatedStatus.band,
          },
        },
      });
    }

    if (action === 'targetBand') {
      // Calculate employees needed for target band
      const industryCode = url.searchParams.get('industryCode') || '';
      const totalEmployees = parseInt(url.searchParams.get('totalEmployees') || '0');
      const currentSaudis = parseInt(url.searchParams.get('currentSaudis') || '0');
      const targetBand = (url.searchParams.get('targetBand') || 'GREEN_LOW') as NitaqatBand;

      const result = NitaqatService.calculateSaudisNeededForBand(
        totalEmployees,
        currentSaudis,
        targetBand,
        industryCode
      );

      return NextResponse.json({
        success: true,
        data: {
          targetBand,
          saudisNeeded: result.needed,
          newRatio: result.newRatio,
        },
      });
    }

    // Default: return reference data
    const industries = NitaqatService.getIndustries();

    return NextResponse.json({
      success: true,
      data: {
        industries,
        bandColors: NITAQAT_BAND_COLORS,
        sizeBands: [
          { name: 'Small', nameAr: 'صغيرة', min: 6, max: 49 },
          { name: 'Medium', nameAr: 'متوسطة', min: 50, max: 499 },
          { name: 'Large', nameAr: 'كبيرة', min: 500, max: 2999 },
          { name: 'Giant', nameAr: 'عملاقة', min: 3000, max: null },
        ],
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch Nitaqat reference data', errorAr: 'فشل في جلب بيانات نطاقات المرجعية' },
      { status: 500 }
    );
  }
}
