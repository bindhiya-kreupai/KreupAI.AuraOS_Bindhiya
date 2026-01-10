/**
 * Qatar WPS (Wage Protection System) API Routes
 *
 * @swagger
 * /api/compliance/qatar-wps:
 *   post:
 *     summary: Generate Qatar WPS SIF file
 *     tags: [Compliance - Qatar WPS]
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
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *               payrollMonth:
 *                 type: string
 *                 example: "2024-01"
 *     responses:
 *       200:
 *         description: Qatar WPS file generated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { QatarWPSService } from '@/lib/services/compliance';
import type { QatarWPSConfiguration, QatarWPSRecord } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/qatar-wps
 * Generate Qatar WPS SIF file
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

    const config: QatarWPSConfiguration = body.config;
    const records: QatarWPSRecord[] = body.records;
    const payrollMonth: string = body.payrollMonth;
    const format: string = body.format || 'json';

    // Validate records
    const validation = QatarWPSService.validateRecords(records);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 });
    }

    // Generate SIF file
    const sifFile = QatarWPSService.generateSIFFile(config, records, payrollMonth);

    if (format === 'sif') {
      // Return as downloadable SIF file
      const sifContent = QatarWPSService.sifToString(sifFile);
      return new NextResponse(sifContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="Qatar_WPS_${payrollMonth.replace('-', '')}.sif"`,
        },
      });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      data: {
        sifFile,
        sifContent: QatarWPSService.sifToString(sifFile),
        validation,
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to generate Qatar WPS file', errorAr: 'فشل في إنشاء ملف WPS قطر' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/qatar-wps
 * Get Qatar WPS reference data (banks, validation rules)
 */
export async function GET() {
  try {
    const banks = QatarWPSService.getQatarBanks();

    return NextResponse.json({
      success: true,
      data: {
        banks,
        validationRules: {
          qidLength: 11,
          minimumWage: 1000, // QAR
          maxRecordsPerFile: 10000,
        },
        requiredFields: [
          'qatarId',
          'employeeName',
          'nationality',
          'bankName',
          'accountNumber',
          'basicSalary',
          'netSalary',
        ],
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch Qatar WPS reference data', errorAr: 'فشل في جلب بيانات WPS قطر المرجعية' },
      { status: 500 }
    );
  }
}
