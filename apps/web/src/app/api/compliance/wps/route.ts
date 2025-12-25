/**
 * WPS (Wage Protection System) API Routes - UAE
 *
 * @swagger
 * /api/compliance/wps:
 *   post:
 *     summary: Generate WPS SIF file for UAE payroll
 *     tags: [Compliance - WPS]
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
 *               - payrollMonth
 *             properties:
 *               config:
 *                 type: object
 *                 properties:
 *                   employerCode:
 *                     type: string
 *                   wpsAgentCode:
 *                     type: string
 *                   bankCode:
 *                     type: string
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *               payrollMonth:
 *                 type: string
 *                 example: "2024-01"
 *               format:
 *                 type: string
 *                 enum: [sif, json]
 *     responses:
 *       200:
 *         description: WPS file generated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { WPSService } from '@/lib/services/compliance';
import type { WPSConfiguration, WPSRecord } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/wps
 * Generate WPS SIF file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.config || !body.records || !body.payrollMonth) {
      return NextResponse.json(
        {
          error: 'Missing required fields: config, records, payrollMonth',
          errorAr: 'حقول مطلوبة مفقودة: الإعدادات، السجلات، شهر الرواتب'
        },
        { status: 400 }
      );
    }

    const config: WPSConfiguration = body.config;
    const records: WPSRecord[] = body.records;
    const payrollMonth: string = body.payrollMonth;
    const format: string = body.format || 'json';

    // Validate records
    const validation = WPSService.validateRecords(records);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 });
    }

    // Generate SIF file
    const sifFile = WPSService.generateSIFFile(config, records, payrollMonth);

    if (format === 'sif') {
      // Return as downloadable SIF file
      const sifContent = WPSService.sifToString(sifFile);
      return new NextResponse(sifContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="WPS_${payrollMonth.replace('-', '')}.sif"`,
        },
      });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      data: {
        sifFile,
        sifContent: WPSService.sifToString(sifFile),
        validation,
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to generate WPS file', errorAr: 'فشل في إنشاء ملف WPS' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/wps
 * Get WPS reference data (agents, bank codes)
 */
export async function GET() {
  try {
    const agents = WPSService.getWPSAgents();
    const bankRoutingCodes = WPSService.getBankRoutingCodes();

    return NextResponse.json({
      success: true,
      data: {
        agents,
        bankRoutingCodes,
        validationRules: {
          labourCardLength: 12,
          accountNumberMinLength: 10,
          accountNumberMaxLength: 23,
          maxRecordsPerFile: 10000,
        },
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to fetch WPS reference data', errorAr: 'فشل في جلب بيانات WPS المرجعية' },
      { status: 500 }
    );
  }
}
