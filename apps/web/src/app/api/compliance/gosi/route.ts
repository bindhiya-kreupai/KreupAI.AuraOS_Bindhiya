/**
 * GOSI (General Organization for Social Insurance) API Routes - KSA
 *
 * @swagger
 * /api/compliance/gosi:
 *   post:
 *     summary: Generate GOSI submission file for KSA payroll
 *     tags: [Compliance - GOSI]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - config
 *               - records
 *               - contributionMonth
 *             properties:
 *               config:
 *                 type: object
 *               records:
 *                 type: array
 *               contributionMonth:
 *                 type: string
 *                 example: "202401"
 *               format:
 *                 type: string
 *                 enum: [xml, csv, json]
 *     responses:
 *       200:
 *         description: GOSI file generated successfully
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { GOSIService } from '@/lib/services/compliance';
import type { GOSIConfiguration, GOSIRecord } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/gosi
 * Generate GOSI submission file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.config || !body.records || !body.contributionMonth) {
      return NextResponse.json(
        {
          error: 'Missing required fields: config, records, contributionMonth',
          errorAr: 'حقول مطلوبة مفقودة: الإعدادات، السجلات، شهر الاشتراك'
        },
        { status: 400 }
      );
    }

    const config: GOSIConfiguration = body.config;
    const records: GOSIRecord[] = body.records;
    const contributionMonth: string = body.contributionMonth;
    const format: string = body.format || 'json';

    // Validate records
    const validation = GOSIService.validateRecords(records);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 });
    }

    // Generate submission file
    const submissionFile = GOSIService.generateSubmissionFile(config, records, contributionMonth);

    if (format === 'xml') {
      const xmlContent = GOSIService.toXML(submissionFile);
      return new NextResponse(xmlContent, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="GOSI_${contributionMonth}.xml"`,
        },
      });
    }

    if (format === 'csv') {
      const csvContent = GOSIService.toCSV(submissionFile);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="GOSI_${contributionMonth}.csv"`,
        },
      });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      data: {
        submissionFile,
        xmlContent: GOSIService.toXML(submissionFile),
        validation,
        liability: GOSIService.calculateCompanyLiability(records),
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to generate GOSI file', errorAr: 'فشل في إنشاء ملف التأمينات' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/gosi
 * Get GOSI reference data (rates, wage ceiling)
 */
export async function GET() {
  try {
    const rates = GOSIService.getRates();
    const wageCeiling = GOSIService.getWageCeiling();
    const minimumWage = GOSIService.getMinimumWage();

    return NextResponse.json({
      success: true,
      data: {
        rates,
        wageCeiling,
        minimumWage,
        summary: {
          saudiTotalRate: rates.saudi.annuity.total + rates.saudi.saned.total + rates.saudi.occupationalHazards.total,
          nonSaudiTotalRate: rates.nonSaudi.occupationalHazards.total,
        },
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch GOSI reference data', errorAr: 'فشل في جلب بيانات التأمينات المرجعية' },
      { status: 500 }
    );
  }
}
