/**
 * Bank File Generator Service — Payroll Disbursement Files
 *
 * Generates bank transfer files in jurisdiction-specific formats:
 *
 *  UAE  : SIF (WPS Salary Information File) — MoHRE mandate
 *         Direct Credit format (ADCBand others)
 *  KSA  : SARIE format (Saudi Arabian Riyal Interbank Express)
 *  India: NEFT batch file (RBI RTGS/NEFT format)
 *         IMPS batch (NPCI IMPS format)
 *         UPI batch (NPCI UPI format)
 *  Intl : SWIFT MT103 (single customer credit transfer)
 *
 * References:
 *  UAE WPS: MoHRE SIF Format v2.0 (2023)
 *  KSA SARIE: SAMA Technical Standards (2022)
 *  India NEFT: RBI NEFT Procedural Guidelines
 *  SWIFT MT103: SWIFT Standards MT Category 1
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const BankFormatSchema = z.enum([
  'UAE_SIF',
  'UAE_DIRECT_CREDIT',
  'KSA_SARIE',
  'INDIA_NEFT',
  'INDIA_IMPS',
  'INDIA_UPI',
  'SWIFT_MT103',
]);

export const GenerateBankFileSchema = z.object({
  payrollRunId: z.string().uuid(),
  bankFormat: BankFormatSchema,
  entityId: z.string().uuid(),
  bankAccountId: z.string(),
  generatedByUserId: z.string().uuid(),
  filterDepartments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BankFormat = z.infer<typeof BankFormatSchema>;

export interface BankTransferRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  ifscCode: string | null;
  ibanNumber: string | null;
  swiftCode: string | null;
  amount: Decimal;
  currency: string;
  narration: string;
  status: 'VALID' | 'INVALID';
  validationError: string | null;
}

export interface BankFileRecord {
  id: string;
  payrollRunId: string;
  entityId: string;
  bankFormat: BankFormat;
  fileName: string;
  fileContent: string;
  totalRecords: number;
  totalAmount: Decimal;
  currency: string;
  validRecords: number;
  invalidRecords: number;
  generatedByUserId: string;
  generatedAt: Date;
  downloadCount: number;
  isActive: boolean;
}

export interface BankValidationSummary {
  totalEmployees: number;
  validCount: number;
  invalidCount: number;
  missingBankDetails: string[];
  invalidIFSC: string[];
  invalidIBAN: string[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_TRANSFER_RECORDS: BankTransferRecord[] = [
  {
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    bankName: 'HDFC Bank',
    bankCode: 'HDFC',
    accountNumber: '50100012345678',
    ifscCode: 'HDFC0001234',
    ibanNumber: null,
    swiftCode: null,
    amount: new Decimal(98309),
    currency: 'INR',
    narration: 'Salary JAN2026 EMP001',
    status: 'VALID',
    validationError: null,
  },
  {
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Rahul Mehta',
    bankName: 'ICICI Bank',
    bankCode: 'ICIC',
    accountNumber: '003501234567',
    ifscCode: 'ICIC0000035',
    ibanNumber: null,
    swiftCode: null,
    amount: new Decimal(145620),
    currency: 'INR',
    narration: 'Salary JAN2026 EMP002',
    status: 'VALID',
    validationError: null,
  },
  {
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    bankName: 'State Bank of India',
    bankCode: 'SBIN',
    accountNumber: '',
    ifscCode: null,
    ibanNumber: null,
    swiftCode: null,
    amount: new Decimal(72500),
    currency: 'INR',
    narration: 'Salary JAN2026 EMP003',
    status: 'INVALID',
    validationError: 'Bank account number is missing',
  },
];

const MOCK_BANK_FILES: BankFileRecord[] = [
  {
    id: 'bf-2026-01',
    payrollRunId: 'run-2026-01',
    entityId: 'entity-001',
    bankFormat: 'INDIA_NEFT',
    fileName: 'NEFT_HDFC_2026-01_1738100000.txt',
    fileContent: '## Mock NEFT file content ##',
    totalRecords: 243,
    totalAmount: new Decimal(15037500),
    currency: 'INR',
    validRecords: 241,
    invalidRecords: 2,
    generatedByUserId: 'user-001',
    generatedAt: new Date('2026-01-31T10:00:00Z'),
    downloadCount: 3,
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Format Generators (Private Helpers)
// ---------------------------------------------------------------------------

function generateNEFTFile(records: BankTransferRecord[], period: string, entityCode: string): string {
  const header = `NEFT_BATCH|${entityCode}|${period}|${records.length}|${records.reduce((s, r) => s.add(r.amount), new Decimal(0)).toFixed(2)}|INR\n`;
  const lines = records
    .filter(r => r.status === 'VALID')
    .map((r, i) =>
      `${String(i + 1).padStart(6, '0')}|${r.accountNumber}|${r.ifscCode}|${r.employeeName.padEnd(35)}|${r.amount.toFixed(2)}|${r.narration}`
    )
    .join('\n');
  const trailer = `\nEND|${records.filter(r => r.status === 'VALID').length}`;
  return header + lines + trailer;
}

function generateIMPSFile(records: BankTransferRecord[], period: string): string {
  const lines = records
    .filter(r => r.status === 'VALID')
    .map(r =>
      `${r.accountNumber}|${r.ifscCode}|${r.employeeName}|${r.amount.toFixed(2)}|${r.narration}`
    )
    .join('\n');
  return `IMPS_BATCH|${period}\n${lines}\nEOF`;
}

function generateUAESIFFile(records: BankTransferRecord[], period: string, entityCode: string): string {
  const header = `HDR|${entityCode}|${period}|${records.length}|${records.reduce((s, r) => s.add(r.amount), new Decimal(0)).toFixed(2)}|AED`;
  const edrs = records
    .filter(r => r.status === 'VALID')
    .map(r => `EDR|${r.employeeCode}|${r.employeeName}|${r.ibanNumber ?? r.accountNumber}|${r.amount.toFixed(2)}|AED`)
    .join('\n');
  const trailer = `TRL|${records.filter(r => r.status === 'VALID').length}`;
  return [header, edrs, trailer].join('\n');
}

function generateSARIEFile(records: BankTransferRecord[], period: string, entityCode: string): string {
  const lines = records
    .filter(r => r.status === 'VALID')
    .map(r =>
      `${r.ibanNumber ?? r.accountNumber}|${r.swiftCode ?? ''}|${r.employeeName}|${r.amount.toFixed(2)}|SAR|${r.narration}`
    )
    .join('\n');
  return `SARIE|${entityCode}|${period}|${records.filter(r => r.status === 'VALID').length}\n${lines}\nEND`;
}

function generateSWIFTMT103(record: BankTransferRecord, senderBIC: string): string {
  return `:20:${record.narration.replace(/\s/g, '').substring(0, 16)}\n` +
    `:23B:CRED\n` +
    `:32A:${new Date().toISOString().slice(0, 10).replace(/-/g, '').slice(2)}${record.currency}${record.amount.toFixed(2)}\n` +
    `:50K:/${record.accountNumber}\n` +
    `:57A:${record.swiftCode ?? senderBIC}\n` +
    `:59:/${record.ibanNumber ?? record.accountNumber}\n${record.employeeName}\n` +
    `:70:${record.narration}\n` +
    `:71A:OUR`;
}

// ---------------------------------------------------------------------------
// Bank File Service
// ---------------------------------------------------------------------------

export class BankFileService {

  /**
   * Validate employee bank details before generating a transfer file.
   */
  async validateBankDetails(payrollRunId: string, bankFormat: BankFormat): Promise<BankValidationSummary> {
    const records = MOCK_TRANSFER_RECORDS;
    const invalid = records.filter(r => r.status === 'INVALID');
    const missingBankDetails = invalid.filter(r => !r.accountNumber).map(r => r.employeeCode);
    const invalidIFSC = invalid.filter(r => r.bankFormat === 'INDIA_NEFT' && r.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(r.ifscCode ?? '')).map(r => r.employeeCode);
    const invalidIBAN = invalid.filter(r => ['UAE_SIF', 'SWIFT_MT103'].includes(bankFormat) && !r.ibanNumber).map(r => r.employeeCode);

    return {
      totalEmployees: records.length,
      validCount: records.filter(r => r.status === 'VALID').length,
      invalidCount: invalid.length,
      missingBankDetails,
      invalidIFSC,
      invalidIBAN,
    };
  }

  /**
   * Generate a bank transfer file for a payroll run in the specified format.
   */
  async generateBankFile(input: z.infer<typeof GenerateBankFileSchema>): Promise<BankFileRecord> {
    const parsed = GenerateBankFileSchema.parse(input);

    const records = MOCK_TRANSFER_RECORDS;
    const period = '2026-02';
    const entityCode = 'ENTITY001';

    let fileContent = '';
    let fileName = '';

    switch (parsed.bankFormat) {
      case 'INDIA_NEFT':
        fileContent = generateNEFTFile(records, period, entityCode);
        fileName = `NEFT_${entityCode}_${period}_${Date.now()}.txt`;
        break;
      case 'INDIA_IMPS':
        fileContent = generateIMPSFile(records, period);
        fileName = `IMPS_${entityCode}_${period}_${Date.now()}.txt`;
        break;
      case 'INDIA_UPI':
        fileContent = records.filter(r => r.status === 'VALID').map(r =>
          `${r.employeeCode}|${r.accountNumber}@${r.bankCode.toLowerCase()}|${r.amount.toFixed(2)}|${r.narration}`
        ).join('\n');
        fileName = `UPI_${entityCode}_${period}_${Date.now()}.txt`;
        break;
      case 'UAE_SIF':
      case 'UAE_DIRECT_CREDIT':
        fileContent = generateUAESIFFile(records, period, entityCode);
        fileName = `WPS_${entityCode}_${period}_${Date.now()}.sif`;
        break;
      case 'KSA_SARIE':
        fileContent = generateSARIEFile(records, period, entityCode);
        fileName = `SARIE_${entityCode}_${period}_${Date.now()}.txt`;
        break;
      case 'SWIFT_MT103':
        fileContent = records.filter(r => r.status === 'VALID')
          .map(r => generateSWIFTMT103(r, 'XYZBBANKXXX')).join('\n\n');
        fileName = `SWIFT_MT103_${entityCode}_${period}_${Date.now()}.txt`;
        break;
      default:
        throw new Error(`Unsupported bank format: ${parsed.bankFormat}`);
    }

    const validRecords = records.filter(r => r.status === 'VALID');
    const totalAmount = validRecords.reduce((s, r) => s.add(r.amount), new Decimal(0));

    const bankFile: BankFileRecord = {
      id: `bf-${Date.now()}`,
      payrollRunId: parsed.payrollRunId,
      entityId: parsed.entityId,
      bankFormat: parsed.bankFormat,
      fileName,
      fileContent,
      totalRecords: records.length,
      totalAmount,
      currency: records[0]?.currency ?? 'INR',
      validRecords: validRecords.length,
      invalidRecords: records.length - validRecords.length,
      generatedByUserId: parsed.generatedByUserId,
      generatedAt: new Date(),
      downloadCount: 0,
      isActive: true,
    };

    return bankFile;
  }

  /**
   * Get history of bank files generated for a payroll run.
   */
  async getBankFileHistory(payrollRunId: string): Promise<BankFileRecord[]> {
    return MOCK_BANK_FILES.filter(f => f.payrollRunId === payrollRunId);
  }

  /**
   * Get preview of the first N transfer records for a run.
   */
  async getTransferPreview(payrollRunId: string, limit = 10): Promise<BankTransferRecord[]> {
    return MOCK_TRANSFER_RECORDS.slice(0, limit);
  }

  /**
   * List supported bank formats with their descriptions.
   */
  getSupportedFormats(): Array<{ format: BankFormat; label: string; country: string; fileExt: string }> {
    return [
      { format: 'UAE_SIF', label: 'UAE WPS SIF File', country: 'AE', fileExt: '.sif' },
      { format: 'UAE_DIRECT_CREDIT', label: 'UAE Direct Credit', country: 'AE', fileExt: '.txt' },
      { format: 'KSA_SARIE', label: 'KSA SARIE Format', country: 'SA', fileExt: '.txt' },
      { format: 'INDIA_NEFT', label: 'India NEFT Batch', country: 'IN', fileExt: '.txt' },
      { format: 'INDIA_IMPS', label: 'India IMPS Batch', country: 'IN', fileExt: '.txt' },
      { format: 'INDIA_UPI', label: 'India UPI Batch', country: 'IN', fileExt: '.txt' },
      { format: 'SWIFT_MT103', label: 'SWIFT MT103 International', country: 'INTL', fileExt: '.txt' },
    ];
  }
}

// Singleton export
export const bankFileService = new BankFileService();

// Re-export for convenience
declare global {
  interface BankTransferRecord {
    bankFormat?: BankFormat;
  }
}
