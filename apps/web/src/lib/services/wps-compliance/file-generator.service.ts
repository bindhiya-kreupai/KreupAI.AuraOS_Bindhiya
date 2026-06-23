import { createHash } from 'crypto';

export interface WpsRow {
  employeeCode: string;
  nationalId?: string;
  labourCardNumber?: string;
  iban: string;
  bankSwift?: string;
  currency: string;
  fixedPay: number;
  variablePay: number;
  deductions: number;
  netPay: number;
  daysWorked?: number;
}

export interface WpsHeaderContext {
  employerId: string;
  establishmentName: string;
  period: string;
  countryCode: string;
}

export interface GeneratedFile {
  content: string;
  hash: string;
  totalEmployees: number;
  totalAmount: number;
  controlTotals: Record<string, number>;
  errors: string[];
}

/**
 * EPIC-11-S02..S05: country file generators.
 *
 * Implemented with country-specific formatters. Each formatter returns
 * the file content (string), a control hash, total counts/amounts and
 * any validation errors.
 */
export class WpsFileGeneratorService {
  generate(format: string, header: WpsHeaderContext, rows: WpsRow[]): GeneratedFile {
    const errors: string[] = [];
    for (const r of rows) {
      if (!r.iban) errors.push(`row ${r.employeeCode}: missing IBAN`);
      if (r.netPay <= 0) errors.push(`row ${r.employeeCode}: netPay must be > 0`);
    }
    let content = '';
    switch (format) {
      case 'SIF':
        content = this.uaeSif(header, rows);
        break;
      case 'MUDAD':
        content = this.ksaMudad(header, rows);
        break;
      case 'QWPS':
        content = this.qatarWps(header, rows);
        break;
      case 'BWPS':
      case 'OWPS':
      case 'KWPS':
        content = this.bankTransferControl(header, rows, format);
        break;
      default:
        errors.push(`unsupported file format ${format}`);
        content = '';
    }
    const totalEmployees = rows.length;
    const totalAmount = rows.reduce((s, r) => s + Number(r.netPay), 0);
    const hash = createHash('sha256').update(content).digest('hex');
    return {
      content,
      hash,
      totalEmployees,
      totalAmount,
      controlTotals: {
        totalFixedPay: rows.reduce((s, r) => s + Number(r.fixedPay), 0),
        totalVariablePay: rows.reduce((s, r) => s + Number(r.variablePay), 0),
        totalDeductions: rows.reduce((s, r) => s + Number(r.deductions), 0),
      },
      errors,
    };
  }

  /** UAE Salary Information File — pipe-delimited mock layout. */
  private uaeSif(h: WpsHeaderContext, rows: WpsRow[]) {
    const edr = [
      'EDR',
      h.employerId,
      h.establishmentName,
      h.period,
      rows.length,
      rows.reduce((s, r) => s + r.netPay, 0).toFixed(2),
    ].join('|');
    const scrs = rows.map((r, i) =>
      [
        'SCR',
        i + 1,
        h.employerId,
        r.employeeCode,
        r.labourCardNumber ?? '',
        r.iban,
        r.fixedPay.toFixed(2),
        r.variablePay.toFixed(2),
        r.deductions.toFixed(2),
        r.netPay.toFixed(2),
        r.daysWorked ?? '',
        h.period,
      ].join('|')
    );
    return [
      edr,
      ...scrs,
      `EOF|${rows.length}|${rows.reduce((s, r) => s + r.netPay, 0).toFixed(2)}`,
    ].join('\n');
  }

  /** KSA Mudad CSV-style export. */
  private ksaMudad(h: WpsHeaderContext, rows: WpsRow[]) {
    const headerLine = [
      'EMPLOYEE_ID',
      'NATIONAL_ID',
      'IBAN',
      'BASIC',
      'ALLOWANCES',
      'DEDUCTIONS',
      'NET_PAY',
      'CURRENCY',
      'DAYS',
      'PERIOD',
    ].join(',');
    const body = rows.map((r) =>
      [
        r.employeeCode,
        r.nationalId ?? '',
        r.iban,
        r.fixedPay.toFixed(2),
        r.variablePay.toFixed(2),
        r.deductions.toFixed(2),
        r.netPay.toFixed(2),
        r.currency,
        r.daysWorked ?? '',
        h.period,
      ].join(',')
    );
    return [
      `# Mudad WPS file | employer=${h.employerId} | period=${h.period} | count=${rows.length}`,
      headerLine,
      ...body,
    ].join('\n');
  }

  private qatarWps(h: WpsHeaderContext, rows: WpsRow[]) {
    const header = `QWPS|${h.employerId}|${h.period}|${rows.length}`;
    const body = rows.map((r, i) =>
      [
        i + 1,
        r.employeeCode,
        r.nationalId ?? '',
        r.iban,
        r.bankSwift ?? '',
        r.netPay.toFixed(2),
        r.currency,
      ].join('|')
    );
    return [header, ...body].join('\n');
  }

  private bankTransferControl(h: WpsHeaderContext, rows: WpsRow[], format: string) {
    const lines = [
      `# ${format} bank-transfer control file`,
      `# employer=${h.employerId} | period=${h.period} | count=${rows.length}`,
      'EMP_CODE,IBAN,NET_PAY,CURRENCY',
      ...rows.map((r) => [r.employeeCode, r.iban, r.netPay.toFixed(2), r.currency].join(',')),
    ];
    return lines.join('\n');
  }
}

export const wpsFileGeneratorService = new WpsFileGeneratorService();
