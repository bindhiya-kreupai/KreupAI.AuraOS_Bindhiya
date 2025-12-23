/**
 * India Statutory API Routes
 * Phase 4: India Payroll Compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { IndiaFormsService } from '@/lib/services/india-statutory';

/**
 * POST /api/india-statutory
 * Generate statutory forms and returns
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorHi: 'टेनेंट आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const action = body.action || 'generate-form16';

    switch (action) {
      case 'generate-form16':
        if (!body.employeeId || !body.financialYear) {
          return NextResponse.json(
            {
              error: 'employeeId and financialYear are required',
              errorHi: 'कर्मचारी आईडी और वित्तीय वर्ष आवश्यक हैं'
            },
            { status: 400 }
          );
        }

        const form16 = await IndiaFormsService.generateForm16(
          body.tenantId,
          body.employeeId,
          body.financialYear
        );

        return NextResponse.json({
          success: true,
          data: form16,
          message: 'Form 16 generated successfully',
          messageHi: 'फॉर्म 16 सफलतापूर्वक बनाया गया',
        });

      case 'generate-form24q':
        if (!body.quarter || !body.financialYear) {
          return NextResponse.json(
            {
              error: 'quarter and financialYear are required',
              errorHi: 'तिमाही और वित्तीय वर्ष आवश्यक हैं'
            },
            { status: 400 }
          );
        }

        const form24q = await IndiaFormsService.generateForm24Q(
          body.tenantId,
          body.quarter,
          body.financialYear
        );

        return NextResponse.json({
          success: true,
          data: form24q,
          message: 'Form 24Q generated successfully',
          messageHi: 'फॉर्म 24Q सफलतापूर्वक बनाया गया',
        });

      case 'generate-epf-return':
        if (!body.month || !body.year) {
          return NextResponse.json(
            {
              error: 'month and year are required',
              errorHi: 'महीना और वर्ष आवश्यक हैं'
            },
            { status: 400 }
          );
        }

        const epfReturn = await IndiaFormsService.generateEPFReturn(
          body.tenantId,
          body.month,
          body.year
        );

        return NextResponse.json({
          success: true,
          data: epfReturn,
          message: 'EPF Return generated successfully',
          messageHi: 'ईपीएफ रिटर्न सफलतापूर्वक बनाया गया',
        });

      case 'generate-esi-return':
        if (!body.month || !body.year) {
          return NextResponse.json(
            {
              error: 'month and year are required',
              errorHi: 'महीना और वर्ष आवश्यक हैं'
            },
            { status: 400 }
          );
        }

        const esiReturn = await IndiaFormsService.generateESIReturn(
          body.tenantId,
          body.month,
          body.year
        );

        return NextResponse.json({
          success: true,
          data: esiReturn,
          message: 'ESI Return generated successfully',
          messageHi: 'ईएसआई रिटर्न सफलतापूर्वक बनाया गया',
        });

      case 'submit-form12bb':
        if (!body.declaration) {
          return NextResponse.json(
            {
              error: 'declaration is required',
              errorHi: 'घोषणा आवश्यक है'
            },
            { status: 400 }
          );
        }

        const form12bb = await IndiaFormsService.submitForm12BB(body.declaration);

        return NextResponse.json({
          success: true,
          data: form12bb,
          message: 'Form 12BB submitted successfully',
          messageHi: 'फॉर्म 12BB सफलतापूर्वक जमा किया गया',
        });

      case 'process-declaration':
        if (!body.declaration) {
          return NextResponse.json(
            {
              error: 'declaration is required',
              errorHi: 'घोषणा आवश्यक है'
            },
            { status: 400 }
          );
        }

        const processed = await IndiaFormsService.processDeclaration(body.declaration);

        return NextResponse.json({
          success: true,
          data: processed,
          message: 'Declaration processed successfully',
          messageHi: 'घोषणा सफलतापूर्वक संसाधित की गई',
        });

      case 'calculate-tax':
        if (body.taxableIncome === undefined || !body.regime) {
          return NextResponse.json(
            {
              error: 'taxableIncome and regime are required',
              errorHi: 'कर योग्य आय और व्यवस्था आवश्यक हैं'
            },
            { status: 400 }
          );
        }

        const taxCalculation = IndiaFormsService.calculateTax(
          body.taxableIncome,
          body.regime
        );

        return NextResponse.json({
          success: true,
          data: taxCalculation,
          message: 'Tax calculated successfully',
          messageHi: 'कर सफलतापूर्वक गणना की गई',
        });

      case 'calculate-epf':
        if (body.grossWages === undefined) {
          return NextResponse.json(
            {
              error: 'grossWages is required',
              errorHi: 'सकल वेतन आवश्यक है'
            },
            { status: 400 }
          );
        }

        const epfCalculation = IndiaFormsService.calculateEPFContribution(
          body.grossWages,
          body.ncpDays || 0
        );

        return NextResponse.json({
          success: true,
          data: epfCalculation,
          message: 'EPF contribution calculated',
          messageHi: 'ईपीएफ योगदान की गणना की गई',
        });

      case 'calculate-esi':
        if (body.grossWages === undefined) {
          return NextResponse.json(
            {
              error: 'grossWages is required',
              errorHi: 'सकल वेतन आवश्यक है'
            },
            { status: 400 }
          );
        }

        const esiCalculation = IndiaFormsService.calculateESIContribution(body.grossWages);

        return NextResponse.json({
          success: true,
          data: esiCalculation,
          message: 'ESI contribution calculated',
          messageHi: 'ईएसआई योगदान की गणना की गई',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorHi: 'अमान्य क्रिया' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('India statutory error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process request',
        errorHi: 'अनुरोध संसाधित करने में विफल',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/india-statutory
 * Get statutory forms and compliance data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type') || 'tax-slabs';

    switch (type) {
      case 'tax-slabs':
        const taxSlabs = {
          old: [
            { min: 0, max: 250000, rate: 0, description: 'No tax' },
            { min: 250001, max: 500000, rate: 5, description: '5% of income above 2.5L' },
            { min: 500001, max: 1000000, rate: 20, description: '20% of income above 5L' },
            { min: 1000001, max: Infinity, rate: 30, description: '30% of income above 10L' },
          ],
          new: [
            { min: 0, max: 300000, rate: 0, description: 'No tax' },
            { min: 300001, max: 600000, rate: 5, description: '5% of income above 3L' },
            { min: 600001, max: 900000, rate: 10, description: '10% of income above 6L' },
            { min: 900001, max: 1200000, rate: 15, description: '15% of income above 9L' },
            { min: 1200001, max: 1500000, rate: 20, description: '20% of income above 12L' },
            { min: 1500001, max: Infinity, rate: 30, description: '30% of income above 15L' },
          ],
          rebate87A: {
            old: { threshold: 500000, maxRebate: 12500 },
            new: { threshold: 700000, maxRebate: 25000 },
          },
          surcharge: [
            { min: 5000001, max: 10000000, rate: 10 },
            { min: 10000001, max: 20000000, rate: 15 },
            { min: 20000001, max: 50000000, rate: 25 },
            { min: 50000001, max: Infinity, rate: 37 },
          ],
          cess: 4, // Health & Education Cess
        };

        return NextResponse.json({
          success: true,
          data: taxSlabs,
        });

      case 'epf-rates':
        const epfRates = {
          epfWageCeiling: 15000,
          employeeContribution: 12,
          employerContribution: 12,
          epsContribution: 8.33,
          epfEmployer: 3.67,
          adminCharges: 0.5,
          edliCharges: 0.5,
          epsMaxContribution: 1250,
        };

        return NextResponse.json({
          success: true,
          data: epfRates,
        });

      case 'esi-rates':
        const esiRates = {
          wageCeiling: 21000,
          employeeContribution: 0.75,
          employerContribution: 3.25,
          totalContribution: 4,
        };

        return NextResponse.json({
          success: true,
          data: esiRates,
        });

      case 'deduction-limits':
        const limits = {
          section80C: 150000,
          section80CCD1B: 50000,
          section80D: {
            selfFamily: 25000,
            selfFamilySenior: 50000,
            parents: 25000,
            parentsSenior: 50000,
            preventiveHealth: 5000,
          },
          section80TTA: 10000,
          section80TTB: 50000,
          section24b: 200000,
          standardDeduction: 50000,
          hraExemption: {
            metro: 50, // % of basic
            nonMetro: 40, // % of basic
          },
        };

        return NextResponse.json({
          success: true,
          data: limits,
        });

      case 'financial-years':
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        // FY starts in April
        const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;

        const financialYears = [];
        for (let i = 0; i < 5; i++) {
          const fy = startYear - i;
          financialYears.push({
            value: `${fy}-${(fy + 1) % 100}`,
            label: `FY ${fy}-${(fy + 1) % 100}`,
            assessmentYear: `${fy + 1}-${(fy + 2) % 100}`,
          });
        }

        return NextResponse.json({
          success: true,
          data: financialYears,
        });

      case 'compliance-calendar':
        const complianceCalendar = [
          {
            form: 'TDS Payment',
            frequency: 'Monthly',
            dueDate: '7th of following month',
            penalty: '1.5% per month',
          },
          {
            form: 'Form 24Q (Q1)',
            frequency: 'Quarterly',
            dueDate: '31st July',
            penalty: 'Rs. 200 per day',
          },
          {
            form: 'Form 24Q (Q2)',
            frequency: 'Quarterly',
            dueDate: '31st October',
            penalty: 'Rs. 200 per day',
          },
          {
            form: 'Form 24Q (Q3)',
            frequency: 'Quarterly',
            dueDate: '31st January',
            penalty: 'Rs. 200 per day',
          },
          {
            form: 'Form 24Q (Q4)',
            frequency: 'Quarterly',
            dueDate: '31st May',
            penalty: 'Rs. 200 per day',
          },
          {
            form: 'Form 16',
            frequency: 'Annual',
            dueDate: '15th June',
            penalty: 'Rs. 100 per day per certificate',
          },
          {
            form: 'EPF Payment',
            frequency: 'Monthly',
            dueDate: '15th of following month',
            penalty: '1% per month',
          },
          {
            form: 'ESI Payment',
            frequency: 'Monthly',
            dueDate: '15th of following month',
            penalty: '12% per annum',
          },
          {
            form: 'Professional Tax',
            frequency: 'Monthly/Quarterly',
            dueDate: 'Varies by state',
            penalty: 'Varies by state',
          },
        ];

        return NextResponse.json({
          success: true,
          data: complianceCalendar,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorHi: 'अमान्य प्रकार' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('India statutory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statutory data', errorHi: 'वैधानिक डेटा प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
