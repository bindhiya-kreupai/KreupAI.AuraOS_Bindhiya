/**
 * WPS (Wage Protection System) Service - UAE
 * Generates SIF files and manages WPS submissions for UAE payroll
 */

import type {
  WPSConfiguration,
  WPSRecord,
  WPSSIFFile,
  WPSSIFRecord,
  WPSValidationResult,
  WPSValidationError,
  WPSValidationWarning,
  EmployeeComplianceData,
} from './types';

// ============================================================================
// WPS FILE FORMAT CONSTANTS
// ============================================================================

const WPS_RECORD_TYPES = {
  HEADER: 'SCR', // Salary Control Record
  EMPLOYEE: 'EDR', // Employee Data Record
  TRAILER: 'SUM', // Summary Record
} as const;

const WPS_VALIDATION_RULES = {
  LABOUR_CARD_LENGTH: 12,
  ACCOUNT_NUMBER_MIN_LENGTH: 10,
  ACCOUNT_NUMBER_MAX_LENGTH: 23,
  MIN_SALARY: 1,
  MAX_RECORDS_PER_FILE: 10000,
} as const;

// ============================================================================
// WPS SERVICE
// ============================================================================

export class WPSService {
  /**
   * Generate WPS SIF (Salary Information File) for a payroll run
   */
  static generateSIFFile(
    config: WPSConfiguration,
    records: WPSRecord[],
    payrollMonth: string
  ): WPSSIFFile {
    const creationDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Calculate totals safely avoiding NaN
    const totalAmount = records.reduce(
      (sum, r) => sum + Number(r.netSalary || 0) + Number(r.leaveSalary || 0),
      0
    );

    // Build header
    const header = {
      employerCode: config.employerCode,
      agentCode: config.wpsAgentCode,
      bankCode: config.bankCode,
      salaryMonth: payrollMonth.replace('-', ''),
      totalRecords: records.length,
      totalAmount,
      creationDate,
    };

    // Build employee records
    const sifRecords: WPSSIFRecord[] = records.map((record) => ({
      recordType: 'EDR' as const,
      labourCardNumber: record.labourCardNumber,
      routingCode: record.bankRoutingCode,
      accountNumber: record.accountNumber,
      salaryAmount: Number(record.netSalary || 0),
      leaveSalary: Number(record.leaveSalary || 0),
    }));

    // Build trailer
    const trailer = {
      totalRecords: records.length,
      totalAmount,
    };

    return { header, records: sifRecords, trailer };
  }

  /**
   * Convert SIF file to string format for download
   */
  static sifToString(sif: WPSSIFFile): string {
    const lines: string[] = [];

    // Header line (SCR)
    lines.push(this.formatHeaderLine(sif.header));

    // Employee records (EDR)
    sif.records.forEach((record) => {
      lines.push(this.formatEmployeeRecordLine(record));
    });

    // Trailer line (SUM)
    lines.push(this.formatTrailerLine(sif.trailer));

    return lines.join('\r\n');
  }

  /**
   * Format header line for SIF file
   */
  private static formatHeaderLine(header: WPSSIFFile['header']): string {
    // SCR format: RecordType,EmployerCode,AgentCode,BankCode,SalaryMonth,TotalRecords,TotalAmount,CreationDate
    return [
      WPS_RECORD_TYPES.HEADER,
      header.employerCode.padEnd(12),
      header.agentCode.padEnd(8),
      header.bankCode.padEnd(8),
      header.salaryMonth,
      header.totalRecords.toString().padStart(6, '0'),
      this.formatAmount(header.totalAmount),
      header.creationDate,
    ].join(',');
  }

  /**
   * Format employee record line for SIF file
   */
  private static formatEmployeeRecordLine(record: WPSSIFRecord): string {
    // EDR format: RecordType,LabourCardNumber,RoutingCode,AccountNumber,SalaryAmount,LeaveSalary
    return [
      WPS_RECORD_TYPES.EMPLOYEE,
      record.labourCardNumber.padEnd(12),
      record.routingCode.padEnd(12),
      record.accountNumber.padEnd(23),
      this.formatAmount(record.salaryAmount),
      this.formatAmount(record.leaveSalary),
    ].join(',');
  }

  /**
   * Format trailer line for SIF file
   */
  private static formatTrailerLine(trailer: WPSSIFFile['trailer']): string {
    // SUM format: RecordType,TotalRecords,TotalAmount
    return [
      WPS_RECORD_TYPES.TRAILER,
      trailer.totalRecords.toString().padStart(6, '0'),
      this.formatAmount(trailer.totalAmount),
    ].join(',');
  }

  /**
   * Format amount with 2 decimal places, 15 chars total
   */
  private static formatAmount(amount: number): string {
    return amount.toFixed(2).padStart(15, '0');
  }

  /**
   * Validate WPS records before submission
   */
  static validateRecords(records: WPSRecord[]): WPSValidationResult {
    const errors: WPSValidationError[] = [];
    const warnings: WPSValidationWarning[] = [];

    if (records.length === 0) {
      errors.push({
        employeeId: '',
        field: 'records',
        code: 'EMPTY_RECORDS',
        message: 'No records to submit',
        messageAr: 'لا توجد سجلات للإرسال',
      });
    }

    if (records.length > WPS_VALIDATION_RULES.MAX_RECORDS_PER_FILE) {
      errors.push({
        employeeId: '',
        field: 'records',
        code: 'TOO_MANY_RECORDS',
        message: `Maximum ${WPS_VALIDATION_RULES.MAX_RECORDS_PER_FILE} records per file`,
        messageAr: `الحد الأقصى ${WPS_VALIDATION_RULES.MAX_RECORDS_PER_FILE} سجل لكل ملف`,
      });
    }

    records.forEach((record) => {
      // Validate labour card number
      if (!record.labourCardNumber) {
        errors.push({
          employeeId: record.employeeId,
          field: 'labourCardNumber',
          code: 'MISSING_LABOUR_CARD',
          message: 'Labour card number is required',
          messageAr: 'رقم بطاقة العمل مطلوب',
        });
      } else if (record.labourCardNumber.length !== WPS_VALIDATION_RULES.LABOUR_CARD_LENGTH) {
        errors.push({
          employeeId: record.employeeId,
          field: 'labourCardNumber',
          code: 'INVALID_LABOUR_CARD',
          message: `Labour card must be ${WPS_VALIDATION_RULES.LABOUR_CARD_LENGTH} characters`,
          messageAr: `يجب أن يكون رقم بطاقة العمل ${WPS_VALIDATION_RULES.LABOUR_CARD_LENGTH} حرفًا`,
        });
      }

      // Validate bank account
      if (!record.accountNumber) {
        errors.push({
          employeeId: record.employeeId,
          field: 'accountNumber',
          code: 'MISSING_ACCOUNT',
          message: 'Bank account number is required',
          messageAr: 'رقم الحساب البنكي مطلوب',
        });
      } else if (
        record.accountNumber.length < WPS_VALIDATION_RULES.ACCOUNT_NUMBER_MIN_LENGTH ||
        record.accountNumber.length > WPS_VALIDATION_RULES.ACCOUNT_NUMBER_MAX_LENGTH
      ) {
        errors.push({
          employeeId: record.employeeId,
          field: 'accountNumber',
          code: 'INVALID_ACCOUNT',
          message: 'Invalid bank account number length',
          messageAr: 'طول رقم الحساب البنكي غير صالح',
        });
      }

      // Validate bank routing code
      if (!record.bankRoutingCode) {
        errors.push({
          employeeId: record.employeeId,
          field: 'bankRoutingCode',
          code: 'MISSING_ROUTING_CODE',
          message: 'Bank routing code is required',
          messageAr: 'رمز التوجيه البنكي مطلوب',
        });
      }

      // Validate salary
      if (record.netSalary < WPS_VALIDATION_RULES.MIN_SALARY) {
        errors.push({
          employeeId: record.employeeId,
          field: 'netSalary',
          code: 'INVALID_SALARY',
          message: 'Net salary must be greater than 0',
          messageAr: 'يجب أن يكون صافي الراتب أكبر من 0',
        });
      }

      // Warnings
      if (record.leaveSalary > record.netSalary) {
        warnings.push({
          employeeId: record.employeeId,
          field: 'leaveSalary',
          code: 'HIGH_LEAVE_SALARY',
          message: 'Leave salary exceeds net salary',
          messageAr: 'راتب الإجازة يتجاوز صافي الراتب',
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
   * Prepare WPS records from payroll data
   */
  static prepareRecords(
    payrollData: Array<{
      employeeId: string;
      complianceData: EmployeeComplianceData;
      basicSalary: number;
      allowances: number;
      deductions: number;
      netSalary: number;
      leaveSalary?: number;
    }>
  ): WPSRecord[] {
    return payrollData.map((data) => ({
      employeeId: data.employeeId,
      labourCardNumber: data.complianceData.labourCardNumber || '',
      personalNumber: data.complianceData.wpsPersonalNumber,
      bankRoutingCode: data.complianceData.bankRoutingCode || '',
      accountNumber: data.complianceData.bankAccountNumber || '',
      basicSalary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
      netSalary: data.netSalary,
      leaveSalary: data.leaveSalary || 0,
    }));
  }

  /**
   * Get WPS agent codes by bank
   */
  static getWPSAgents(): Array<{ code: string; name: string; nameAr: string }> {
    return [
      { code: 'ADCB', name: 'Abu Dhabi Commercial Bank', nameAr: 'بنك أبوظبي التجاري' },
      { code: 'ADIB', name: 'Abu Dhabi Islamic Bank', nameAr: 'مصرف أبوظبي الإسلامي' },
      { code: 'CBD', name: 'Commercial Bank of Dubai', nameAr: 'بنك دبي التجاري' },
      { code: 'DIB', name: 'Dubai Islamic Bank', nameAr: 'بنك دبي الإسلامي' },
      { code: 'ENBD', name: 'Emirates NBD', nameAr: 'الإمارات دبي الوطني' },
      { code: 'FAB', name: 'First Abu Dhabi Bank', nameAr: 'بنك أبوظبي الأول' },
      { code: 'MASHREQ', name: 'Mashreq Bank', nameAr: 'بنك المشرق' },
      { code: 'NBAD', name: 'National Bank of Abu Dhabi', nameAr: 'بنك أبوظبي الوطني' },
      { code: 'RAK', name: 'RAK Bank', nameAr: 'بنك رأس الخيمة الوطني' },
      { code: 'SHARJAH', name: 'Sharjah Islamic Bank', nameAr: 'مصرف الشارقة الإسلامي' },
    ];
  }

  /**
   * Get bank routing codes
   */
  static getBankRoutingCodes(): Array<{ code: string; bank: string; bankAr: string }> {
    return [
      { code: 'ADCBAEAA', bank: 'Abu Dhabi Commercial Bank', bankAr: 'بنك أبوظبي التجاري' },
      { code: 'ABDIAEAD', bank: 'Abu Dhabi Islamic Bank', bankAr: 'مصرف أبوظبي الإسلامي' },
      { code: 'CBDUAEAD', bank: 'Commercial Bank of Dubai', bankAr: 'بنك دبي التجاري' },
      { code: 'DUIBAEAD', bank: 'Dubai Islamic Bank', bankAr: 'بنك دبي الإسلامي' },
      { code: 'EABOROAD', bank: 'Emirates NBD', bankAr: 'الإمارات دبي الوطني' },
      { code: 'NBADAEAA', bank: 'First Abu Dhabi Bank', bankAr: 'بنك أبوظبي الأول' },
      { code: 'BOMLAEAD', bank: 'Mashreq Bank', bankAr: 'بنك المشرق' },
      { code: 'NABOROAD', bank: 'RAK Bank', bankAr: 'بنك رأس الخيمة الوطني' },
    ];
  }
}

export default WPSService;
