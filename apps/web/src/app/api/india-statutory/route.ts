/**
 * India Statutory API Routes
 * Phase 4: India Payroll Compliance
 *
 * Comprehensive endpoints for:
 * - PF (Provident Fund) calculations
 * - ESI (Employee State Insurance) calculations
 * - TDS (Tax Deducted at Source) calculations
 * - Professional Tax calculations
 * - Statutory forms generation
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { IndiaFormsService } from '@/lib/services/india-statutory';
import { IndiaStatutoryService } from '@/lib/services/compliance/india-statutory.service';

/**
 * POST /api/india-statutory
 * Generate statutory forms and returns (auth: india-statutory:write)
 *
 * Tenant scoping: tenantId is ALWAYS taken from the authenticated session.
 * Any tenantId in the request body is overridden.
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    body.tenantId = auth!.tenantId;

    const action = body.action || 'generate-form16';

    switch (action) {
      case 'generate-form16':
        if (!body.employeeId || !body.financialYear) {
          return NextResponse.json(
            {
              error: 'employeeId and financialYear are required',
              errorHi: 'कर्मचारी आईडी और वित्तीय वर्ष आवश्यक हैं',
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
              errorHi: 'तिमाही और वित्तीय वर्ष आवश्यक हैं',
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
              errorHi: 'महीना और वर्ष आवश्यक हैं',
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
              errorHi: 'महीना और वर्ष आवश्यक हैं',
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
              errorHi: 'घोषणा आवश्यक है',
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
              errorHi: 'घोषणा आवश्यक है',
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
              errorHi: 'कर योग्य आय और व्यवस्था आवश्यक हैं',
            },
            { status: 400 }
          );
        }

        const taxCalculation = IndiaFormsService.calculateTax(body.taxableIncome, body.regime);

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
              errorHi: 'सकल वेतन आवश्यक है',
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
              errorHi: 'सकल वेतन आवश्यक है',
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

      case 'calculate-pf-detailed':
        if (body.basicSalary === undefined) {
          return NextResponse.json(
            {
              error: 'basicSalary is required',
              errorHi: 'मूल वेतन आवश्यक है',
            },
            { status: 400 }
          );
        }

        const pfDetailed = IndiaStatutoryService.calculatePF(
          body.basicSalary,
          body.dearnessAllowance || 0,
          body.isVoluntaryHigher || false
        );

        return NextResponse.json({
          success: true,
          data: pfDetailed,
          message: 'PF contribution calculated with detailed breakdown',
          messageHi: 'पीएफ योगदान का विस्तृत विवरण गणना की गई',
        });

      case 'calculate-esi-detailed':
        if (body.grossSalary === undefined) {
          return NextResponse.json(
            {
              error: 'grossSalary is required',
              errorHi: 'सकल वेतन आवश्यक है',
            },
            { status: 400 }
          );
        }

        const esiDetailed = IndiaStatutoryService.calculateESI(body.grossSalary);

        return NextResponse.json({
          success: true,
          data: esiDetailed,
          message: 'ESI contribution calculated',
          messageHi: 'ईएसआई योगदान की गणना की गई',
        });

      case 'calculate-professional-tax':
        // DEPRECATED — Professional Tax now has a single canonical surface at
        // POST /api/compliance/india-professional-tax (action=calculateMonthly),
        // backed by the richer 17-state IndiaProfessionalTaxService. This basic
        // action is retired to remove the duplicate PT surface (AURA-061).
        return NextResponse.json(
          {
            error:
              'Deprecated. Use POST /api/compliance/india-professional-tax (action=calculateMonthly).',
            errorHi:
              'यह अप्रचलित है। कृपया POST /api/compliance/india-professional-tax (action=calculateMonthly) का उपयोग करें।',
          },
          { status: 410 }
        );

      case 'calculate-tds-detailed':
        if (body.annualGrossSalary === undefined) {
          return NextResponse.json(
            {
              error: 'annualGrossSalary is required',
              errorHi: 'वार्षिक सकल वेतन आवश्यक है',
            },
            { status: 400 }
          );
        }

        const tdsResult = IndiaStatutoryService.calculateTDS(
          body.annualGrossSalary,
          body.isNewRegime !== false, // Default to new regime
          {
            section80C: body.section80C,
            section80CCD1B: body.section80CCD1B,
            section80D: body.section80D,
            section24B: body.section24B,
            section80E: body.section80E,
            hra: body.hra,
            lta: body.lta,
            otherExemptions: body.otherExemptions,
          }
        );

        return NextResponse.json({
          success: true,
          data: tdsResult,
          message: 'TDS calculated with slab breakdown',
          messageHi: 'स्लैब विवरण के साथ टीडीएस की गणना की गई',
        });

      case 'compare-tax-regimes':
        if (body.annualGrossSalary === undefined) {
          return NextResponse.json(
            {
              error: 'annualGrossSalary is required',
              errorHi: 'वार्षिक सकल वेतन आवश्यक है',
            },
            { status: 400 }
          );
        }

        const comparison = IndiaStatutoryService.compareRegimes(body.annualGrossSalary, {
          section80C: body.section80C,
          section80CCD1B: body.section80CCD1B,
          section80D: body.section80D,
          section24B: body.section24B,
          hra: body.hra,
          lta: body.lta,
        });

        return NextResponse.json({
          success: true,
          data: comparison,
          message: 'Tax regime comparison completed',
          messageHi: 'कर व्यवस्था तुलना पूर्ण',
        });

      case 'calculate-all-statutory':
        if (!body.employeeData) {
          return NextResponse.json(
            {
              error: 'employeeData is required',
              errorHi: 'कर्मचारी डेटा आवश्यक है',
            },
            { status: 400 }
          );
        }

        const allStatutory = IndiaStatutoryService.calculateAll(
          body.employeeData,
          body.month || new Date().toISOString().slice(0, 7),
          body.annualGrossSalary
        );

        return NextResponse.json({
          success: true,
          data: allStatutory,
          message: 'All statutory deductions calculated',
          messageHi: 'सभी वैधानिक कटौती की गणना की गई',
        });

      case 'validate-pan':
        if (!body.panNumber) {
          return NextResponse.json(
            { error: 'panNumber is required', errorHi: 'पैन नंबर आवश्यक है' },
            { status: 400 }
          );
        }

        const panValidation = IndiaStatutoryService.validatePAN(body.panNumber);
        return NextResponse.json({
          success: true,
          data: panValidation,
        });

      case 'validate-aadhaar':
        if (!body.aadhaarNumber) {
          return NextResponse.json(
            { error: 'aadhaarNumber is required', errorHi: 'आधार नंबर आवश्यक है' },
            { status: 400 }
          );
        }

        const aadhaarValidation = IndiaStatutoryService.validateAadhaar(body.aadhaarNumber);
        return NextResponse.json({
          success: true,
          data: aadhaarValidation,
        });

      case 'validate-uan':
        if (!body.uanNumber) {
          return NextResponse.json(
            { error: 'uanNumber is required', errorHi: 'यूएएन नंबर आवश्यक है' },
            { status: 400 }
          );
        }

        const uanValidation = IndiaStatutoryService.validateUAN(body.uanNumber);
        return NextResponse.json({
          success: true,
          data: uanValidation,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorHi: 'अमान्य क्रिया' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['india-statutory:write'],
    rateLimit: 'API_USER',
  }
);

/**
 * GET /api/india-statutory
 * Get statutory forms and compliance data (auth: india-statutory:read)
 *
 * Tenant scoping: tenantId is ALWAYS taken from the authenticated session.
 * Any tenantId in the query string is ignored.
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, _ctx) => {
    const { searchParams } = new URL(request.url);
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

      case 'pf-config':
        const pfConfig = IndiaStatutoryService.getPFConfig();
        return NextResponse.json({
          success: true,
          data: pfConfig,
        });

      case 'esi-config':
        const esiConfig = IndiaStatutoryService.getESIConfig();
        return NextResponse.json({
          success: true,
          data: esiConfig,
        });

      case 'supported-states':
        const supportedStates = IndiaStatutoryService.getSupportedStates();
        return NextResponse.json({
          success: true,
          data: supportedStates,
        });

      case 'all-configs':
        const allConfigs = {
          pf: IndiaStatutoryService.getPFConfig(),
          esi: IndiaStatutoryService.getESIConfig(),
          supportedStates: IndiaStatutoryService.getSupportedStates(),
          taxSlabs: {
            old: [
              { min: 0, max: 250000, rate: 0, description: 'No tax' },
              { min: 250001, max: 500000, rate: 5, description: '5% of income above 2.5L' },
              { min: 500001, max: 1000000, rate: 20, description: '20% of income above 5L' },
              { min: 1000001, max: null, rate: 30, description: '30% of income above 10L' },
            ],
            new: [
              { min: 0, max: 300000, rate: 0, description: 'No tax' },
              { min: 300001, max: 700000, rate: 5, description: '5% of income above 3L' },
              { min: 700001, max: 1000000, rate: 10, description: '10% of income above 7L' },
              { min: 1000001, max: 1200000, rate: 15, description: '15% of income above 10L' },
              { min: 1200001, max: 1500000, rate: 20, description: '20% of income above 12L' },
              { min: 1500001, max: null, rate: 30, description: '30% of income above 15L' },
            ],
          },
          deductionLimits: {
            section80C: 150000,
            section80CCD1B: 50000,
            section80D: { selfFamily: 25000, selfFamilySenior: 50000 },
            section24B: 200000,
            standardDeduction: 75000,
          },
          cessRate: 0.04,
          rebate87A: {
            newRegimeThreshold: 700000,
            maxRebate: 25000,
          },
        };
        return NextResponse.json({
          success: true,
          data: allConfigs,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorHi: 'अमान्य प्रकार' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['india-statutory:read'],
    rateLimit: 'API_USER',
  }
);
