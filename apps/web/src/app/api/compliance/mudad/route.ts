/**
 * Mudad (Wage Protection System) API Routes - KSA
 *
 * @swagger
 * /api/compliance/mudad:
 *   post:
 *     summary: Generate Mudad submission file for KSA payroll
 *     tags: [Compliance - Mudad]
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
 *               - paymentMonth
 *               - paymentYear
 *             properties:
 *               config:
 *                 type: object
 *               records:
 *                 type: array
 *               paymentMonth:
 *                 type: string
 *                 example: "01"
 *               paymentYear:
 *                 type: string
 *                 example: "2024"
 *               format:
 *                 type: string
 *                 enum: [xml, csv, json]
 *     responses:
 *       200:
 *         description: Mudad file generated successfully
 */

import { NextRequest, NextResponse } from 'next/server';
import { MudadService, MudadConfiguration, MudadRecord } from '@/lib/services/compliance';

/**
 * POST /api/compliance/mudad
 * Generate Mudad submission file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.config || !body.records || !body.paymentMonth || !body.paymentYear) {
      return NextResponse.json(
        {
          error: 'Missing required fields: config, records, paymentMonth, paymentYear',
          errorAr: 'حقول مطلوبة مفقودة: الإعدادات، السجلات، شهر الدفع، سنة الدفع'
        },
        { status: 400 }
      );
    }

    const config: MudadConfiguration = body.config;
    const records: MudadRecord[] = body.records;
    const paymentMonth: string = body.paymentMonth;
    const paymentYear: string = body.paymentYear;
    const format: string = body.format || 'json';

    // Validate records
    const validation = MudadService.validateRecords(records);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 });
    }

    // Generate submission file
    const submissionFile = MudadService.generateSubmissionFile(
      config,
      records,
      paymentMonth,
      paymentYear
    );

    if (format === 'xml') {
      const xmlContent = MudadService.toXML(submissionFile);
      return new NextResponse(xmlContent, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="Mudad_${paymentYear}${paymentMonth}.xml"`,
        },
      });
    }

    if (format === 'csv') {
      const csvContent = MudadService.toCSV(submissionFile);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="Mudad_${paymentYear}${paymentMonth}.csv"`,
        },
      });
    }

    // Return JSON response
    const stats = MudadService.calculateSummaryStats(records);

    return NextResponse.json({
      success: true,
      data: {
        submissionFile,
        xmlContent: MudadService.toXML(submissionFile),
        validation,
        statistics: stats,
      },
    });
  } catch (error) {
    console.error('Mudad generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Mudad file', errorAr: 'فشل في إنشاء ملف مدد' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/mudad
 * Get Mudad reference data (banks, validation rules)
 */
export async function GET() {
  try {
    const banks = MudadService.getBanks();

    return NextResponse.json({
      success: true,
      data: {
        banks,
        validationRules: {
          minSaudiWage: 4000,
          ibanLength: 24,
          iqamaLength: 10,
          nationalIdLength: 10,
          maxRecordsPerFile: 50000,
        },
        paymentMethods: [
          { code: 'BANK_TRANSFER', name: 'Bank Transfer', nameAr: 'تحويل بنكي' },
          { code: 'CASH', name: 'Cash', nameAr: 'نقدي' },
          { code: 'CHECK', name: 'Check', nameAr: 'شيك' },
        ],
      },
    });
  } catch (error) {
    console.error('Mudad reference data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Mudad reference data', errorAr: 'فشل في جلب بيانات مدد المرجعية' },
      { status: 500 }
    );
  }
}
