/**
 * Mudad (Wage Protection System) Service - Saudi Arabia
 * Handles salary file generation and submissions for KSA's Ministry of HRSD
 */

import type { EmployeeComplianceData } from './types';

// ============================================================================
// MUDAD TYPES
// ============================================================================

export interface MudadConfiguration {
  id: string;
  tenantId: string;
  companyId: string;
  establishmentNumber: string;
  laborOfficeCode: string;
  unifiedNumber?: string;
  molEstablishmentId: string;
  bankIBAN: string;
  bankCode: string;
  isActive: boolean;
}

export interface MudadRecord {
  employeeId: string;
  iqamaNumber: string;
  nationalId?: string;
  employeeNameEn: string;
  employeeNameAr: string;
  isSaudi: boolean;
  bankIBAN: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  deductions: number;
  netSalary: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHECK';
  workDays: number;
  absentDays: number;
}

export interface MudadSubmissionFile {
  header: {
    establishmentNumber: string;
    laborOfficeCode: string;
    molEstablishmentId: string;
    paymentMonth: string;
    paymentYear: string;
    creationDate: string;
    creationTime: string;
    totalRecords: number;
    totalSalaries: number;
    saudiCount: number;
    nonSaudiCount: number;
    bankCode: string;
  };
  records: Array<MudadRecord & { recordType: 'SAL' }>;
  summary: {
    totalBasicSalary: number;
    totalHousingAllowance: number;
    totalTransportAllowance: number;
    totalOtherAllowances: number;
    totalDeductions: number;
    totalNetSalaries: number;
    averageSalary: number;
  };
}

export interface MudadValidationResult {
  isValid: boolean;
  errors: MudadValidationError[];
  warnings: MudadValidationWarning[];
}

export interface MudadValidationError {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

export interface MudadValidationWarning {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// MUDAD VALIDATION CONSTANTS
// ============================================================================

const MUDAD_VALIDATION = {
  MIN_SAUDI_WAGE: 4000, // Minimum wage for Saudis (SAR)
  MIN_WAGE: 1,
  MAX_RECORDS_PER_FILE: 50000,
  IBAN_LENGTH: 24,
  IQAMA_LENGTH: 10,
  NATIONAL_ID_LENGTH: 10,
};

// ============================================================================
// MUDAD SERVICE
// ============================================================================

export class MudadService {
  /**
   * Generate Mudad submission file for a payroll period
   */
  static generateSubmissionFile(
    config: MudadConfiguration,
    records: MudadRecord[],
    paymentMonth: string,
    paymentYear: string
  ): MudadSubmissionFile {
    const now = new Date();
    const creationDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const creationTime = now.toISOString().slice(11, 19).replace(/:/g, '');

    const saudiRecords = records.filter(r => r.isSaudi);
    const nonSaudiRecords = records.filter(r => !r.isSaudi);

    // Calculate totals
    const totals = records.reduce(
      (acc, record) => ({
        totalBasicSalary: acc.totalBasicSalary + record.basicSalary,
        totalHousingAllowance: acc.totalHousingAllowance + record.housingAllowance,
        totalTransportAllowance: acc.totalTransportAllowance + record.transportAllowance,
        totalOtherAllowances: acc.totalOtherAllowances + record.otherAllowances,
        totalDeductions: acc.totalDeductions + record.deductions,
        totalNetSalaries: acc.totalNetSalaries + record.netSalary,
      }),
      {
        totalBasicSalary: 0,
        totalHousingAllowance: 0,
        totalTransportAllowance: 0,
        totalOtherAllowances: 0,
        totalDeductions: 0,
        totalNetSalaries: 0,
      }
    );

    return {
      header: {
        establishmentNumber: config.establishmentNumber,
        laborOfficeCode: config.laborOfficeCode,
        molEstablishmentId: config.molEstablishmentId,
        paymentMonth,
        paymentYear,
        creationDate,
        creationTime,
        totalRecords: records.length,
        totalSalaries: totals.totalNetSalaries,
        saudiCount: saudiRecords.length,
        nonSaudiCount: nonSaudiRecords.length,
        bankCode: config.bankCode,
      },
      records: records.map(record => ({
        ...record,
        recordType: 'SAL' as const,
      })),
      summary: {
        ...totals,
        averageSalary: records.length > 0 ? totals.totalNetSalaries / records.length : 0,
      },
    };
  }

  /**
   * Convert Mudad submission to XML format (for HRSD portal)
   */
  static toXML(file: MudadSubmissionFile): string {
    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<MudadSalaryFile xmlns="http://mudad.hrsd.gov.sa/schema">',
      '  <Header>',
      `    <EstablishmentNumber>${file.header.establishmentNumber}</EstablishmentNumber>`,
      `    <LaborOfficeCode>${file.header.laborOfficeCode}</LaborOfficeCode>`,
      `    <MOLEstablishmentId>${file.header.molEstablishmentId}</MOLEstablishmentId>`,
      `    <PaymentMonth>${file.header.paymentMonth}</PaymentMonth>`,
      `    <PaymentYear>${file.header.paymentYear}</PaymentYear>`,
      `    <CreationDate>${file.header.creationDate}</CreationDate>`,
      `    <CreationTime>${file.header.creationTime}</CreationTime>`,
      `    <TotalRecords>${file.header.totalRecords}</TotalRecords>`,
      `    <TotalSalaries>${file.header.totalSalaries.toFixed(2)}</TotalSalaries>`,
      `    <SaudiCount>${file.header.saudiCount}</SaudiCount>`,
      `    <NonSaudiCount>${file.header.nonSaudiCount}</NonSaudiCount>`,
      `    <BankCode>${file.header.bankCode}</BankCode>`,
      '  </Header>',
      '  <SalaryRecords>',
    ];

    file.records.forEach(record => {
      xmlLines.push(
        '    <SalaryRecord>',
        `      <IdNumber>${record.isSaudi ? record.nationalId : record.iqamaNumber}</IdNumber>`,
        `      <IsSaudi>${record.isSaudi}</IsSaudi>`,
        `      <EmployeeNameAr>${this.escapeXml(record.employeeNameAr)}</EmployeeNameAr>`,
        `      <EmployeeNameEn>${this.escapeXml(record.employeeNameEn)}</EmployeeNameEn>`,
        `      <BankIBAN>${record.bankIBAN}</BankIBAN>`,
        `      <BasicSalary>${record.basicSalary.toFixed(2)}</BasicSalary>`,
        `      <HousingAllowance>${record.housingAllowance.toFixed(2)}</HousingAllowance>`,
        `      <TransportAllowance>${record.transportAllowance.toFixed(2)}</TransportAllowance>`,
        `      <OtherAllowances>${record.otherAllowances.toFixed(2)}</OtherAllowances>`,
        `      <Deductions>${record.deductions.toFixed(2)}</Deductions>`,
        `      <NetSalary>${record.netSalary.toFixed(2)}</NetSalary>`,
        `      <PaymentMethod>${record.paymentMethod}</PaymentMethod>`,
        `      <WorkDays>${record.workDays}</WorkDays>`,
        `      <AbsentDays>${record.absentDays}</AbsentDays>`,
        '    </SalaryRecord>'
      );
    });

    xmlLines.push(
      '  </SalaryRecords>',
      '  <Summary>',
      `    <TotalBasicSalary>${file.summary.totalBasicSalary.toFixed(2)}</TotalBasicSalary>`,
      `    <TotalHousingAllowance>${file.summary.totalHousingAllowance.toFixed(2)}</TotalHousingAllowance>`,
      `    <TotalTransportAllowance>${file.summary.totalTransportAllowance.toFixed(2)}</TotalTransportAllowance>`,
      `    <TotalOtherAllowances>${file.summary.totalOtherAllowances.toFixed(2)}</TotalOtherAllowances>`,
      `    <TotalDeductions>${file.summary.totalDeductions.toFixed(2)}</TotalDeductions>`,
      `    <TotalNetSalaries>${file.summary.totalNetSalaries.toFixed(2)}</TotalNetSalaries>`,
      `    <AverageSalary>${file.summary.averageSalary.toFixed(2)}</AverageSalary>`,
      '  </Summary>',
      '</MudadSalaryFile>'
    );

    return xmlLines.join('\n');
  }

  /**
   * Convert Mudad submission to CSV format
   */
  static toCSV(file: MudadSubmissionFile): string {
    const headers = [
      'ID Number',
      'Is Saudi',
      'Employee Name (Arabic)',
      'Employee Name (English)',
      'Bank IBAN',
      'Basic Salary',
      'Housing Allowance',
      'Transport Allowance',
      'Other Allowances',
      'Deductions',
      'Net Salary',
      'Payment Method',
      'Work Days',
      'Absent Days',
    ];

    const rows = file.records.map(record => [
      record.isSaudi ? record.nationalId : record.iqamaNumber,
      record.isSaudi ? 'Yes' : 'No',
      `"${record.employeeNameAr}"`,
      `"${record.employeeNameEn}"`,
      record.bankIBAN,
      record.basicSalary.toFixed(2),
      record.housingAllowance.toFixed(2),
      record.transportAllowance.toFixed(2),
      record.otherAllowances.toFixed(2),
      record.deductions.toFixed(2),
      record.netSalary.toFixed(2),
      record.paymentMethod,
      record.workDays.toString(),
      record.absentDays.toString(),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Validate Mudad records before submission
   */
  static validateRecords(records: MudadRecord[]): MudadValidationResult {
    const errors: MudadValidationError[] = [];
    const warnings: MudadValidationWarning[] = [];

    if (records.length === 0) {
      errors.push({
        employeeId: '',
        field: 'records',
        code: 'EMPTY_RECORDS',
        message: 'No records to submit',
        messageAr: 'لا توجد سجلات للإرسال',
      });
    }

    if (records.length > MUDAD_VALIDATION.MAX_RECORDS_PER_FILE) {
      errors.push({
        employeeId: '',
        field: 'records',
        code: 'TOO_MANY_RECORDS',
        message: `Maximum ${MUDAD_VALIDATION.MAX_RECORDS_PER_FILE} records per file`,
        messageAr: `الحد الأقصى ${MUDAD_VALIDATION.MAX_RECORDS_PER_FILE} سجل لكل ملف`,
      });
    }

    records.forEach(record => {
      // Validate ID number
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
            message: 'Invalid National ID format',
            messageAr: 'صيغة رقم الهوية الوطنية غير صالحة',
          });
        }
      } else {
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
            message: 'Invalid Iqama number format',
            messageAr: 'صيغة رقم الإقامة غير صالحة',
          });
        }
      }

      // Validate IBAN for bank transfers
      if (record.paymentMethod === 'BANK_TRANSFER') {
        if (!record.bankIBAN) {
          errors.push({
            employeeId: record.employeeId,
            field: 'bankIBAN',
            code: 'MISSING_IBAN',
            message: 'Bank IBAN is required for bank transfers',
            messageAr: 'رقم الآيبان البنكي مطلوب للتحويلات البنكية',
          });
        } else if (!this.validateIBAN(record.bankIBAN)) {
          errors.push({
            employeeId: record.employeeId,
            field: 'bankIBAN',
            code: 'INVALID_IBAN',
            message: 'Invalid Saudi IBAN format',
            messageAr: 'صيغة الآيبان السعودي غير صالحة',
          });
        }
      }

      // Validate salary
      if (record.netSalary < MUDAD_VALIDATION.MIN_WAGE) {
        errors.push({
          employeeId: record.employeeId,
          field: 'netSalary',
          code: 'INVALID_SALARY',
          message: 'Net salary must be greater than 0',
          messageAr: 'يجب أن يكون صافي الراتب أكبر من 0',
        });
      }

      // Warnings
      if (record.isSaudi && record.basicSalary < MUDAD_VALIDATION.MIN_SAUDI_WAGE) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'basicSalary',
          code: 'BELOW_MINIMUM_WAGE',
          message: `Saudi employee salary below minimum wage (${MUDAD_VALIDATION.MIN_SAUDI_WAGE} SAR)`,
          messageAr: `راتب الموظف السعودي أقل من الحد الأدنى (${MUDAD_VALIDATION.MIN_SAUDI_WAGE} ريال)`,
        });
      }

      // Cash payment warning
      if (record.paymentMethod === 'CASH') {
        warnings.push({
          employeeId: record.employeeId,
          field: 'paymentMethod',
          code: 'CASH_PAYMENT',
          message: 'Cash payments may not be compliant with Mudad requirements',
          messageAr: 'المدفوعات النقدية قد لا تتوافق مع متطلبات مدد',
        });
      }

      // Work days validation
      if (record.workDays + record.absentDays > 31) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'workDays',
          code: 'INVALID_DAYS',
          message: 'Total work days + absent days exceeds month length',
          messageAr: 'مجموع أيام العمل وأيام الغياب يتجاوز طول الشهر',
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
   * Validate Saudi IBAN format
   */
  private static validateIBAN(iban: string): boolean {
    // Saudi IBAN format: SA followed by 22 characters (2 check digits + 20 BBAN)
    const saudiIBANRegex = /^SA\d{2}[A-Z0-9]{20}$/;
    return saudiIBANRegex.test(iban.replace(/\s/g, '').toUpperCase());
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Prepare Mudad records from payroll data
   */
  static prepareRecords(
    payrollData: Array<{
      employeeId: string;
      employeeNameEn: string;
      employeeNameAr: string;
      complianceData: EmployeeComplianceData;
      basicSalary: number;
      housingAllowance: number;
      transportAllowance: number;
      otherAllowances: number;
      deductions: number;
      netSalary: number;
      workDays: number;
      absentDays: number;
    }>
  ): MudadRecord[] {
    return payrollData.map(data => ({
      employeeId: data.employeeId,
      iqamaNumber: data.complianceData.iqamaNumber || '',
      nationalId: data.complianceData.nationalId,
      employeeNameEn: data.employeeNameEn,
      employeeNameAr: data.employeeNameAr,
      isSaudi: data.complianceData.nationality === 'SA',
      bankIBAN: data.complianceData.bankIBAN || '',
      basicSalary: data.basicSalary,
      housingAllowance: data.housingAllowance,
      transportAllowance: data.transportAllowance,
      otherAllowances: data.otherAllowances,
      deductions: data.deductions,
      netSalary: data.netSalary,
      paymentMethod: 'BANK_TRANSFER' as const,
      workDays: data.workDays,
      absentDays: data.absentDays,
    }));
  }

  /**
   * Get list of Saudi banks for Mudad
   */
  static getBanks(): Array<{ code: string; name: string; nameAr: string; swiftCode: string }> {
    return [
      { code: '10', name: 'Saudi National Bank (SNB)', nameAr: 'البنك الأهلي السعودي', swiftCode: 'NCBKSAJE' },
      { code: '20', name: 'Riyad Bank', nameAr: 'بنك الرياض', swiftCode: 'RIABORPP' },
      { code: '30', name: 'Saudi British Bank (SABB)', nameAr: 'البنك السعودي البريطاني', swiftCode: 'SABBSARI' },
      { code: '40', name: 'Banque Saudi Fransi', nameAr: 'البنك السعودي الفرنسي', swiftCode: 'BSFRSARI' },
      { code: '45', name: 'Saudi Investment Bank', nameAr: 'البنك السعودي للاستثمار', swiftCode: 'SIBCSARI' },
      { code: '55', name: 'Bank AlBilad', nameAr: 'بنك البلاد', swiftCode: 'ALBISARI' },
      { code: '60', name: 'Alinma Bank', nameAr: 'مصرف الإنماء', swiftCode: 'INMASARI' },
      { code: '65', name: 'Bank AlJazira', nameAr: 'بنك الجزيرة', swiftCode: 'BJAZSAJE' },
      { code: '80', name: 'Arab National Bank', nameAr: 'البنك العربي الوطني', swiftCode: 'ARNBSARI' },
      { code: '90', name: 'Al Rajhi Bank', nameAr: 'مصرف الراجحي', swiftCode: 'RJHISARI' },
    ];
  }

  /**
   * Calculate monthly summary statistics
   */
  static calculateSummaryStats(records: MudadRecord[]): {
    saudiStats: {
      count: number;
      totalSalary: number;
      averageSalary: number;
      minSalary: number;
      maxSalary: number;
    };
    nonSaudiStats: {
      count: number;
      totalSalary: number;
      averageSalary: number;
      minSalary: number;
      maxSalary: number;
    };
    overallStats: {
      count: number;
      totalSalary: number;
      averageSalary: number;
      medianSalary: number;
    };
  } {
    const saudiRecords = records.filter(r => r.isSaudi);
    const nonSaudiRecords = records.filter(r => !r.isSaudi);

    const calculateStats = (recs: MudadRecord[]) => {
      if (recs.length === 0) {
        return { count: 0, totalSalary: 0, averageSalary: 0, minSalary: 0, maxSalary: 0 };
      }
      const salaries = recs.map(r => r.netSalary);
      return {
        count: recs.length,
        totalSalary: salaries.reduce((a, b) => a + b, 0),
        averageSalary: salaries.reduce((a, b) => a + b, 0) / recs.length,
        minSalary: Math.min(...salaries),
        maxSalary: Math.max(...salaries),
      };
    };

    const allSalaries = records.map(r => r.netSalary).sort((a, b) => a - b);
    const medianSalary =
      allSalaries.length > 0
        ? allSalaries.length % 2 === 0
          ? (allSalaries[allSalaries.length / 2 - 1] + allSalaries[allSalaries.length / 2]) / 2
          : allSalaries[Math.floor(allSalaries.length / 2)]
        : 0;

    return {
      saudiStats: calculateStats(saudiRecords),
      nonSaudiStats: calculateStats(nonSaudiRecords),
      overallStats: {
        count: records.length,
        totalSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
        averageSalary: records.length > 0 ? records.reduce((sum, r) => sum + r.netSalary, 0) / records.length : 0,
        medianSalary,
      },
    };
  }
}

export default MudadService;
