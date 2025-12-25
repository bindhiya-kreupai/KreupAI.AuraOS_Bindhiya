/**
 * GOSI (General Organization for Social Insurance) Service - Saudi Arabia
 * Handles social insurance calculations, contributions, and file generation
 */

import type {
  GOSIConfiguration,
  GOSIContributionRates,
  GOSIRecord,
  GOSISubmissionFile,
  GOSIValidationResult,
  GOSIValidationError,
  GOSIValidationWarning,
  EmployeeComplianceData,
} from './types';

// ============================================================================
// GOSI CONTRIBUTION RATES (2024)
// ============================================================================

const GOSI_RATES: GOSIContributionRates = {
  // Saudi Employee Rates
  saudi: {
    annuity: {
      employee: 9.0,    // 9% employee contribution
      employer: 9.0,    // 9% employer contribution
      total: 18.0,
    },
    saned: {
      employee: 0.75,   // 0.75% SANED (unemployment insurance)
      employer: 0.75,   // 0.75% employer contribution
      total: 1.5,
    },
    occupationalHazards: {
      employee: 0,
      employer: 2.0,    // 2% occupational hazards (employer only)
      total: 2.0,
    },
  },
  // Non-Saudi Employee Rates
  nonSaudi: {
    annuity: {
      employee: 0,      // No annuity for non-Saudis
      employer: 0,
      total: 0,
    },
    saned: {
      employee: 0,      // No SANED for non-Saudis
      employer: 0,
      total: 0,
    },
    occupationalHazards: {
      employee: 0,
      employer: 2.0,    // 2% occupational hazards only
      total: 2.0,
    },
  },
};

// Maximum monthly wage subject to GOSI (45,000 SAR as of 2024)
const GOSI_WAGE_CEILING = 45000;

// Minimum wage for GOSI calculation
const GOSI_MINIMUM_WAGE = 4000;

// ============================================================================
// GOSI SERVICE
// ============================================================================

export class GOSIService {
  /**
   * Calculate GOSI contributions for an employee
   */
  static calculateContributions(
    basicSalary: number,
    housingAllowance: number,
    isSaudi: boolean
  ): {
    contributableSalary: number;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
    breakdown: {
      annuity: { employee: number; employer: number };
      saned: { employee: number; employer: number };
      occupationalHazards: { employee: number; employer: number };
    };
  } {
    // GOSI contribution is calculated on basic salary + housing allowance
    const grossContributableSalary = basicSalary + housingAllowance;

    // Apply wage ceiling
    const contributableSalary = Math.min(grossContributableSalary, GOSI_WAGE_CEILING);

    const rates = isSaudi ? GOSI_RATES.saudi : GOSI_RATES.nonSaudi;

    // Calculate each component
    const annuityEmployee = (contributableSalary * rates.annuity.employee) / 100;
    const annuityEmployer = (contributableSalary * rates.annuity.employer) / 100;

    const sanedEmployee = (contributableSalary * rates.saned.employee) / 100;
    const sanedEmployer = (contributableSalary * rates.saned.employer) / 100;

    const hazardsEmployee = (contributableSalary * rates.occupationalHazards.employee) / 100;
    const hazardsEmployer = (contributableSalary * rates.occupationalHazards.employer) / 100;

    const employeeContribution = annuityEmployee + sanedEmployee + hazardsEmployee;
    const employerContribution = annuityEmployer + sanedEmployer + hazardsEmployer;

    return {
      contributableSalary,
      employeeContribution: Math.round(employeeContribution * 100) / 100,
      employerContribution: Math.round(employerContribution * 100) / 100,
      totalContribution: Math.round((employeeContribution + employerContribution) * 100) / 100,
      breakdown: {
        annuity: {
          employee: Math.round(annuityEmployee * 100) / 100,
          employer: Math.round(annuityEmployer * 100) / 100,
        },
        saned: {
          employee: Math.round(sanedEmployee * 100) / 100,
          employer: Math.round(sanedEmployer * 100) / 100,
        },
        occupationalHazards: {
          employee: Math.round(hazardsEmployee * 100) / 100,
          employer: Math.round(hazardsEmployer * 100) / 100,
        },
      },
    };
  }

  /**
   * Generate GOSI submission file for a payroll period
   */
  static generateSubmissionFile(
    config: GOSIConfiguration,
    records: GOSIRecord[],
    contributionMonth: string
  ): GOSISubmissionFile {
    const creationDate = new Date().toISOString().slice(0, 10);

    // Separate Saudi and non-Saudi records
    const saudiRecords = records.filter(r => r.isSaudi);
    const nonSaudiRecords = records.filter(r => !r.isSaudi);

    // Calculate totals
    const totals = records.reduce(
      (acc, record) => ({
        totalContributableWages: acc.totalContributableWages + record.contributableSalary,
        totalEmployeeContributions: acc.totalEmployeeContributions + record.employeeContribution,
        totalEmployerContributions: acc.totalEmployerContributions + record.employerContribution,
        totalAnnuity: acc.totalAnnuity + record.annuityContribution,
        totalSaned: acc.totalSaned + record.sanedContribution,
        totalOccupationalHazards: acc.totalOccupationalHazards + record.occupationalHazardsContribution,
      }),
      {
        totalContributableWages: 0,
        totalEmployeeContributions: 0,
        totalEmployerContributions: 0,
        totalAnnuity: 0,
        totalSaned: 0,
        totalOccupationalHazards: 0,
      }
    );

    return {
      header: {
        establishmentNumber: config.establishmentNumber,
        laborOfficeCode: config.laborOfficeCode,
        contributionMonth,
        creationDate,
        totalRecords: records.length,
        saudiCount: saudiRecords.length,
        nonSaudiCount: nonSaudiRecords.length,
      },
      records: records.map(record => ({
        ...record,
        recordType: 'EMP' as const,
      })),
      summary: {
        ...totals,
        totalContribution: totals.totalEmployeeContributions + totals.totalEmployerContributions,
      },
    };
  }

  /**
   * Convert GOSI submission to XML format (required for GOSI portal)
   */
  static toXML(file: GOSISubmissionFile): string {
    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<GOSIContribution>',
      '  <Header>',
      `    <EstablishmentNumber>${file.header.establishmentNumber}</EstablishmentNumber>`,
      `    <LaborOfficeCode>${file.header.laborOfficeCode}</LaborOfficeCode>`,
      `    <ContributionMonth>${file.header.contributionMonth}</ContributionMonth>`,
      `    <CreationDate>${file.header.creationDate}</CreationDate>`,
      `    <TotalRecords>${file.header.totalRecords}</TotalRecords>`,
      `    <SaudiCount>${file.header.saudiCount}</SaudiCount>`,
      `    <NonSaudiCount>${file.header.nonSaudiCount}</NonSaudiCount>`,
      '  </Header>',
      '  <Employees>',
    ];

    file.records.forEach(record => {
      xmlLines.push(
        '    <Employee>',
        `      <SubscriberNumber>${record.subscriberNumber}</SubscriberNumber>`,
        `      <NationalId>${record.nationalId}</NationalId>`,
        `      <IqamaNumber>${record.iqamaNumber || ''}</IqamaNumber>`,
        `      <IsSaudi>${record.isSaudi}</IsSaudi>`,
        `      <BasicSalary>${record.basicSalary.toFixed(2)}</BasicSalary>`,
        `      <HousingAllowance>${record.housingAllowance.toFixed(2)}</HousingAllowance>`,
        `      <ContributableSalary>${record.contributableSalary.toFixed(2)}</ContributableSalary>`,
        `      <EmployeeContribution>${record.employeeContribution.toFixed(2)}</EmployeeContribution>`,
        `      <EmployerContribution>${record.employerContribution.toFixed(2)}</EmployerContribution>`,
        `      <AnnuityContribution>${record.annuityContribution.toFixed(2)}</AnnuityContribution>`,
        `      <SanedContribution>${record.sanedContribution.toFixed(2)}</SanedContribution>`,
        `      <OccupationalHazards>${record.occupationalHazardsContribution.toFixed(2)}</OccupationalHazards>`,
        '    </Employee>'
      );
    });

    xmlLines.push(
      '  </Employees>',
      '  <Summary>',
      `    <TotalContributableWages>${file.summary.totalContributableWages.toFixed(2)}</TotalContributableWages>`,
      `    <TotalEmployeeContributions>${file.summary.totalEmployeeContributions.toFixed(2)}</TotalEmployeeContributions>`,
      `    <TotalEmployerContributions>${file.summary.totalEmployerContributions.toFixed(2)}</TotalEmployerContributions>`,
      `    <TotalAnnuity>${file.summary.totalAnnuity.toFixed(2)}</TotalAnnuity>`,
      `    <TotalSaned>${file.summary.totalSaned.toFixed(2)}</TotalSaned>`,
      `    <TotalOccupationalHazards>${file.summary.totalOccupationalHazards.toFixed(2)}</TotalOccupationalHazards>`,
      `    <TotalContribution>${file.summary.totalContribution.toFixed(2)}</TotalContribution>`,
      '  </Summary>',
      '</GOSIContribution>'
    );

    return xmlLines.join('\n');
  }

  /**
   * Convert GOSI submission to CSV format
   */
  static toCSV(file: GOSISubmissionFile): string {
    const headers = [
      'Subscriber Number',
      'National ID',
      'Iqama Number',
      'Is Saudi',
      'Basic Salary',
      'Housing Allowance',
      'Contributable Salary',
      'Employee Contribution',
      'Employer Contribution',
      'Annuity',
      'SANED',
      'Occupational Hazards',
    ];

    const rows = file.records.map(record => [
      record.subscriberNumber,
      record.nationalId,
      record.iqamaNumber || '',
      record.isSaudi ? 'Yes' : 'No',
      record.basicSalary.toFixed(2),
      record.housingAllowance.toFixed(2),
      record.contributableSalary.toFixed(2),
      record.employeeContribution.toFixed(2),
      record.employerContribution.toFixed(2),
      record.annuityContribution.toFixed(2),
      record.sanedContribution.toFixed(2),
      record.occupationalHazardsContribution.toFixed(2),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Validate GOSI records before submission
   */
  static validateRecords(records: GOSIRecord[]): GOSIValidationResult {
    const errors: GOSIValidationError[] = [];
    const warnings: GOSIValidationWarning[] = [];

    if (records.length === 0) {
      errors.push({
        employeeId: '',
        field: 'records',
        code: 'EMPTY_RECORDS',
        message: 'No records to submit',
        messageAr: 'لا توجد سجلات للإرسال',
      });
    }

    records.forEach(record => {
      // Validate subscriber number
      if (!record.subscriberNumber) {
        errors.push({
          employeeId: record.employeeId,
          field: 'subscriberNumber',
          code: 'MISSING_SUBSCRIBER',
          message: 'GOSI subscriber number is required',
          messageAr: 'رقم المشترك في التأمينات مطلوب',
        });
      } else if (!/^\d{9,10}$/.test(record.subscriberNumber)) {
        errors.push({
          employeeId: record.employeeId,
          field: 'subscriberNumber',
          code: 'INVALID_SUBSCRIBER',
          message: 'Invalid GOSI subscriber number format',
          messageAr: 'صيغة رقم المشترك غير صالحة',
        });
      }

      // Validate National ID for Saudis
      if (record.isSaudi) {
        if (!record.nationalId) {
          errors.push({
            employeeId: record.employeeId,
            field: 'nationalId',
            code: 'MISSING_NATIONAL_ID',
            message: 'National ID is required for Saudi employees',
            messageAr: 'رقم الهوية الوطنية مطلوب للموظفين السعوديين',
          });
        } else if (!/^1\d{9}$/.test(record.nationalId)) {
          errors.push({
            employeeId: record.employeeId,
            field: 'nationalId',
            code: 'INVALID_NATIONAL_ID',
            message: 'Invalid Saudi National ID format (must start with 1)',
            messageAr: 'صيغة رقم الهوية غير صالحة (يجب أن تبدأ بـ 1)',
          });
        }
      }

      // Validate Iqama for non-Saudis
      if (!record.isSaudi) {
        if (!record.iqamaNumber) {
          errors.push({
            employeeId: record.employeeId,
            field: 'iqamaNumber',
            code: 'MISSING_IQAMA',
            message: 'Iqama number is required for non-Saudi employees',
            messageAr: 'رقم الإقامة مطلوب للموظفين غير السعوديين',
          });
        } else if (!/^2\d{9}$/.test(record.iqamaNumber)) {
          errors.push({
            employeeId: record.employeeId,
            field: 'iqamaNumber',
            code: 'INVALID_IQAMA',
            message: 'Invalid Iqama number format (must start with 2)',
            messageAr: 'صيغة رقم الإقامة غير صالحة (يجب أن تبدأ بـ 2)',
          });
        }
      }

      // Validate salary
      if (record.basicSalary <= 0) {
        errors.push({
          employeeId: record.employeeId,
          field: 'basicSalary',
          code: 'INVALID_SALARY',
          message: 'Basic salary must be greater than 0',
          messageAr: 'يجب أن يكون الراتب الأساسي أكبر من 0',
        });
      }

      // Warnings
      if (record.isSaudi && record.basicSalary < GOSI_MINIMUM_WAGE) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'basicSalary',
          code: 'BELOW_MINIMUM_WAGE',
          message: `Saudi employee salary below minimum wage (${GOSI_MINIMUM_WAGE} SAR)`,
          messageAr: `راتب الموظف السعودي أقل من الحد الأدنى (${GOSI_MINIMUM_WAGE} ريال)`,
        });
      }

      if (record.contributableSalary > GOSI_WAGE_CEILING) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'contributableSalary',
          code: 'EXCEEDS_CEILING',
          message: `Salary exceeds GOSI ceiling, capped at ${GOSI_WAGE_CEILING} SAR`,
          messageAr: `الراتب يتجاوز الحد الأقصى للتأمينات، تم تحديده عند ${GOSI_WAGE_CEILING} ريال`,
        });
      }

      // Validate contribution calculations
      const calculated = this.calculateContributions(
        record.basicSalary,
        record.housingAllowance,
        record.isSaudi
      );

      const tolerance = 0.01;
      if (Math.abs(calculated.employeeContribution - record.employeeContribution) > tolerance) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'employeeContribution',
          code: 'CONTRIBUTION_MISMATCH',
          message: `Employee contribution mismatch: expected ${calculated.employeeContribution}, got ${record.employeeContribution}`,
          messageAr: 'عدم تطابق في حصة الموظف',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Prepare GOSI records from payroll data
   */
  static prepareRecords(
    payrollData: Array<{
      employeeId: string;
      complianceData: EmployeeComplianceData;
      basicSalary: number;
      housingAllowance: number;
    }>
  ): GOSIRecord[] {
    return payrollData.map(data => {
      const isSaudi = data.complianceData.nationality === 'SA';
      const contributions = this.calculateContributions(
        data.basicSalary,
        data.housingAllowance,
        isSaudi
      );

      return {
        employeeId: data.employeeId,
        subscriberNumber: data.complianceData.gosiSubscriberNumber || '',
        nationalId: data.complianceData.nationalId || '',
        iqamaNumber: data.complianceData.iqamaNumber,
        isSaudi,
        basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance,
        contributableSalary: contributions.contributableSalary,
        employeeContribution: contributions.employeeContribution,
        employerContribution: contributions.employerContribution,
        annuityContribution: contributions.breakdown.annuity.employee + contributions.breakdown.annuity.employer,
        sanedContribution: contributions.breakdown.saned.employee + contributions.breakdown.saned.employer,
        occupationalHazardsContribution: contributions.breakdown.occupationalHazards.employer,
      };
    });
  }

  /**
   * Get current GOSI rates
   */
  static getRates(): GOSIContributionRates {
    return GOSI_RATES;
  }

  /**
   * Get GOSI wage ceiling
   */
  static getWageCeiling(): number {
    return GOSI_WAGE_CEILING;
  }

  /**
   * Get minimum wage for GOSI
   */
  static getMinimumWage(): number {
    return GOSI_MINIMUM_WAGE;
  }

  /**
   * Calculate total GOSI liability for company
   */
  static calculateCompanyLiability(
    records: GOSIRecord[]
  ): {
    totalEmployerContribution: number;
    totalEmployeeContribution: number;
    totalContribution: number;
    byType: {
      annuity: number;
      saned: number;
      occupationalHazards: number;
    };
    bySaudiStatus: {
      saudi: { count: number; total: number };
      nonSaudi: { count: number; total: number };
    };
  } {
    const saudiRecords = records.filter(r => r.isSaudi);
    const nonSaudiRecords = records.filter(r => !r.isSaudi);

    return {
      totalEmployerContribution: records.reduce((sum, r) => sum + r.employerContribution, 0),
      totalEmployeeContribution: records.reduce((sum, r) => sum + r.employeeContribution, 0),
      totalContribution: records.reduce(
        (sum, r) => sum + r.employerContribution + r.employeeContribution,
        0
      ),
      byType: {
        annuity: records.reduce((sum, r) => sum + r.annuityContribution, 0),
        saned: records.reduce((sum, r) => sum + r.sanedContribution, 0),
        occupationalHazards: records.reduce((sum, r) => sum + r.occupationalHazardsContribution, 0),
      },
      bySaudiStatus: {
        saudi: {
          count: saudiRecords.length,
          total: saudiRecords.reduce(
            (sum, r) => sum + r.employerContribution + r.employeeContribution,
            0
          ),
        },
        nonSaudi: {
          count: nonSaudiRecords.length,
          total: nonSaudiRecords.reduce((sum, r) => sum + r.employerContribution, 0),
        },
      },
    };
  }
}

export default GOSIService;
