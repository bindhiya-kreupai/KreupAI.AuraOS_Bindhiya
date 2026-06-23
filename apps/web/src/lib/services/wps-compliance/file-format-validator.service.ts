/**
 * EPIC-13 KSA / EPIC-14 UAE — WPS file-format validator.
 *
 * Closes the audit gaps:
 *   EPIC-13 — "WPS file-format validator (sub-story missing)"
 *   EPIC-14 — "WPS SIF file validator"
 *
 * The existing `WpsFileGeneratorService` produces the file. This
 * complementary service VALIDATES a candidate file (uploaded for
 * review, archived, or rebuilt out-of-band) against the same format
 * rules. It accepts the raw text and the expected header context and
 * emits a typed verdict with per-row issues and bilingual reasons.
 *
 * Supported formats:
 *  - SIF  — UAE WPS (UAE Central Bank SIF v1.x — fixed columns,
 *           comma-delimited record types EDR / SCR / DCR / TOT.
 *           In our codebase the generator uses a simplified comma
 *           grammar; this validator mirrors that grammar so generated
 *           files round-trip.)
 *  - MUDAD — KSA Mudad (header line `H|...`, body lines `B|...`,
 *            trailer `T|count|totalAmount`).
 *  - QWPS / BWPS / OWPS / KWPS — generic bank transfer controls.
 *
 * Pure evaluator — no IO. Bilingual reason text on every issue.
 */

export type WpsFormat = 'SIF' | 'MUDAD' | 'QWPS' | 'BWPS' | 'OWPS' | 'KWPS';

export type WpsValidationIssueSeverity = 'ERROR' | 'WARN';

export type WpsValidationIssueCode =
  | 'EMPTY_FILE'
  | 'MISSING_HEADER'
  | 'MISSING_TRAILER'
  | 'HEADER_COUNTRY_MISMATCH'
  | 'HEADER_PERIOD_MISMATCH'
  | 'HEADER_EMPLOYER_MISMATCH'
  | 'BAD_RECORD_TYPE'
  | 'WRONG_COLUMN_COUNT'
  | 'INVALID_IBAN'
  | 'INVALID_NET_PAY'
  | 'NET_PAY_NON_NUMERIC'
  | 'DUPLICATE_EMPLOYEE'
  | 'COUNT_MISMATCH'
  | 'TOTAL_AMOUNT_MISMATCH'
  | 'UNSUPPORTED_FORMAT';

export interface WpsValidationIssue {
  code: WpsValidationIssueCode;
  severity: WpsValidationIssueSeverity;
  /** 1-based line number in the file (0 when not line-specific). */
  line: number;
  /** Employee code if the issue is row-specific. */
  employeeCode?: string;
  message: string;
  messageAr: string;
}

export interface WpsValidationInput {
  format: WpsFormat;
  content: string;
  expected: {
    employerId: string;
    establishmentName?: string;
    /** Period the file is supposed to cover (e.g. `2026-05`). */
    period: string;
    /** ISO-3166-1 alpha-2 country code (used by SIF header). */
    countryCode: string;
    /** Expected employee count (optional — used when the upstream knows). */
    employeeCount?: number;
    /** Expected total net pay (optional). */
    totalAmount?: number;
  };
}

export interface WpsValidationReport {
  format: WpsFormat;
  /** Number of body rows parsed. */
  parsedRows: number;
  /** Sum of net pay over parsed rows. */
  parsedTotalAmount: number;
  issues: WpsValidationIssue[];
  totals: {
    errors: number;
    warnings: number;
  };
  valid: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

const MSG: Record<
  WpsValidationIssueCode,
  {
    en: (ctx?: Record<string, string | number>) => string;
    ar: (ctx?: Record<string, string | number>) => string;
  }
> = {
  EMPTY_FILE: {
    en: () => 'File is empty',
    ar: () => 'الملف فارغ',
  },
  MISSING_HEADER: {
    en: () => 'Header record missing',
    ar: () => 'سجل الرأس مفقود',
  },
  MISSING_TRAILER: {
    en: () => 'Trailer record missing',
    ar: () => 'سجل التذييل مفقود',
  },
  HEADER_COUNTRY_MISMATCH: {
    en: (c) => `Header country mismatch (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `الدولة في الرأس لا تطابق (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  HEADER_PERIOD_MISMATCH: {
    en: (c) => `Header period mismatch (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `الفترة في الرأس لا تطابق (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  HEADER_EMPLOYER_MISMATCH: {
    en: (c) => `Header employer mismatch (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `صاحب العمل في الرأس لا يطابق (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  BAD_RECORD_TYPE: {
    en: (c) => `Unknown record type '${c?.recordType}'`,
    ar: (c) => `نوع السجل غير معروف '${c?.recordType}'`,
  },
  WRONG_COLUMN_COUNT: {
    en: (c) => `Wrong column count (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `عدد الأعمدة خطأ (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  INVALID_IBAN: {
    en: (c) => `Invalid IBAN '${c?.iban}'`,
    ar: (c) => `رقم آيبان غير صالح '${c?.iban}'`,
  },
  INVALID_NET_PAY: {
    en: () => 'Net pay must be greater than zero',
    ar: () => 'صافي الراتب يجب أن يكون أكبر من صفر',
  },
  NET_PAY_NON_NUMERIC: {
    en: (c) => `Net pay is not numeric ('${c?.value}')`,
    ar: (c) => `صافي الراتب ليس رقمياً ('${c?.value}')`,
  },
  DUPLICATE_EMPLOYEE: {
    en: (c) => `Employee ${c?.employeeCode} appears more than once`,
    ar: (c) => `الموظف ${c?.employeeCode} يظهر أكثر من مرة`,
  },
  COUNT_MISMATCH: {
    en: (c) => `Employee count mismatch (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `عدد الموظفين لا يطابق (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  TOTAL_AMOUNT_MISMATCH: {
    en: (c) => `Total amount mismatch (expected ${c?.expected}, got ${c?.actual})`,
    ar: (c) => `الإجمالي لا يطابق (المتوقع ${c?.expected}، الفعلي ${c?.actual})`,
  },
  UNSUPPORTED_FORMAT: {
    en: (c) => `Unsupported format '${c?.format}'`,
    ar: (c) => `تنسيق غير مدعوم '${c?.format}'`,
  },
};

function issue(
  code: WpsValidationIssueCode,
  severity: WpsValidationIssueSeverity,
  line: number,
  employeeCode?: string,
  ctx?: Record<string, string | number>
): WpsValidationIssue {
  return {
    code,
    severity,
    line,
    employeeCode,
    message: MSG[code].en(ctx),
    messageAr: MSG[code].ar(ctx),
  };
}

/** Light IBAN structural check — country letters + checksum digits + alphanumerics. */
function isPlausibleIban(iban: string): boolean {
  if (!iban) return false;
  const trimmed = iban.trim().toUpperCase();
  if (trimmed.length < 15 || trimmed.length > 34) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(trimmed)) return false;
  return true;
}

function isNumeric(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s.trim());
}

// ============================================================================
// SIF (UAE / generic comma-delimited)
// ============================================================================

function validateSif(input: WpsValidationInput): WpsValidationReport {
  const issues: WpsValidationIssue[] = [];
  const content = input.content.replace(/\r\n/g, '\n').trim();
  if (!content) {
    issues.push(issue('EMPTY_FILE', 'ERROR', 0));
    return finalise('SIF', 0, 0, issues, input);
  }
  const lines = content.split('\n');
  // The shared generator produces a header line that starts with `SIF|EMPLOYER=...|PERIOD=...|COUNTRY=...`.
  const headerLine = lines[0];
  if (!headerLine || !headerLine.startsWith('SIF')) {
    issues.push(issue('MISSING_HEADER', 'ERROR', 1));
  } else {
    const headerFields = Object.fromEntries(
      headerLine
        .split('|')
        .slice(1)
        .map((p) => {
          const [k, v] = p.split('=');
          return [k, v ?? ''];
        })
    );
    if (headerFields.EMPLOYER && headerFields.EMPLOYER !== input.expected.employerId) {
      issues.push(
        issue('HEADER_EMPLOYER_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.employerId,
          actual: headerFields.EMPLOYER,
        })
      );
    }
    if (headerFields.PERIOD && headerFields.PERIOD !== input.expected.period) {
      issues.push(
        issue('HEADER_PERIOD_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.period,
          actual: headerFields.PERIOD,
        })
      );
    }
    if (headerFields.COUNTRY && headerFields.COUNTRY !== input.expected.countryCode) {
      issues.push(
        issue('HEADER_COUNTRY_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.countryCode,
          actual: headerFields.COUNTRY,
        })
      );
    }
  }
  let parsedRows = 0;
  let parsedTotal = 0;
  const seen = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    if (raw.startsWith('TOT')) {
      const parts = raw.split('|');
      // TOT|count|totalAmount
      if (parts.length === 3) {
        const cnt = Number(parts[1]);
        const tot = Number(parts[2]);
        if (Number.isFinite(cnt) && cnt !== parsedRows) {
          issues.push(
            issue('COUNT_MISMATCH', 'ERROR', i + 1, undefined, {
              expected: parsedRows,
              actual: cnt,
            })
          );
        }
        if (Number.isFinite(tot) && Math.abs(tot - parsedTotal) > 0.01) {
          issues.push(
            issue('TOTAL_AMOUNT_MISMATCH', 'ERROR', i + 1, undefined, {
              expected: tot,
              actual: Math.round(parsedTotal * 100) / 100,
            })
          );
        }
      }
      continue;
    }
    const cols = raw.split(',');
    // Generator schema: employeeCode, nationalId, labourCardNumber, iban, bankSwift, currency,
    //                   fixedPay, variablePay, deductions, netPay, daysWorked
    if (cols.length < 10) {
      issues.push(
        issue('WRONG_COLUMN_COUNT', 'ERROR', i + 1, cols[0], { expected: 10, actual: cols.length })
      );
      continue;
    }
    const empCode = cols[0]?.trim();
    if (empCode) {
      if (seen.has(empCode)) {
        issues.push(
          issue('DUPLICATE_EMPLOYEE', 'ERROR', i + 1, empCode, { employeeCode: empCode })
        );
      }
      seen.add(empCode);
    }
    const iban = cols[3]?.trim();
    if (!isPlausibleIban(iban)) {
      issues.push(issue('INVALID_IBAN', 'ERROR', i + 1, empCode, { iban: iban || '' }));
    }
    const netPayCol = cols[9]?.trim();
    if (!isNumeric(netPayCol)) {
      issues.push(issue('NET_PAY_NON_NUMERIC', 'ERROR', i + 1, empCode, { value: netPayCol }));
    } else {
      const np = Number(netPayCol);
      if (np <= 0) {
        issues.push(issue('INVALID_NET_PAY', 'ERROR', i + 1, empCode));
      } else {
        parsedTotal += np;
      }
    }
    parsedRows += 1;
  }
  return finalise('SIF', parsedRows, parsedTotal, issues, input);
}

// ============================================================================
// MUDAD (KSA)
// ============================================================================

function validateMudad(input: WpsValidationInput): WpsValidationReport {
  const issues: WpsValidationIssue[] = [];
  const content = input.content.replace(/\r\n/g, '\n').trim();
  if (!content) {
    issues.push(issue('EMPTY_FILE', 'ERROR', 0));
    return finalise('MUDAD', 0, 0, issues, input);
  }
  const lines = content.split('\n');
  const headerLine = lines.find((l) => l.startsWith('H|'));
  const trailerLine = lines.find((l) => l.startsWith('T|'));
  if (!headerLine) issues.push(issue('MISSING_HEADER', 'ERROR', 1));
  if (!trailerLine) issues.push(issue('MISSING_TRAILER', 'ERROR', lines.length));
  if (headerLine) {
    const hParts = headerLine.split('|');
    // H|EMPLOYER|PERIOD|COUNTRY|...
    const empId = hParts[1];
    const period = hParts[2];
    const country = hParts[3];
    if (empId && empId !== input.expected.employerId) {
      issues.push(
        issue('HEADER_EMPLOYER_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.employerId,
          actual: empId,
        })
      );
    }
    if (period && period !== input.expected.period) {
      issues.push(
        issue('HEADER_PERIOD_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.period,
          actual: period,
        })
      );
    }
    if (country && country !== input.expected.countryCode) {
      issues.push(
        issue('HEADER_COUNTRY_MISMATCH', 'ERROR', 1, undefined, {
          expected: input.expected.countryCode,
          actual: country,
        })
      );
    }
  }
  let parsedRows = 0;
  let parsedTotal = 0;
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    if (raw.startsWith('H|') || raw.startsWith('T|')) continue;
    if (!raw.startsWith('B|')) {
      issues.push(
        issue('BAD_RECORD_TYPE', 'ERROR', i + 1, undefined, {
          recordType: raw.split('|')[0] || '?',
        })
      );
      continue;
    }
    const parts = raw.split('|');
    // B|empCode|nationalId|iban|netPay|...
    if (parts.length < 5) {
      issues.push(
        issue('WRONG_COLUMN_COUNT', 'ERROR', i + 1, parts[1], { expected: 5, actual: parts.length })
      );
      continue;
    }
    const empCode = parts[1]?.trim();
    if (empCode) {
      if (seen.has(empCode)) {
        issues.push(
          issue('DUPLICATE_EMPLOYEE', 'ERROR', i + 1, empCode, { employeeCode: empCode })
        );
      }
      seen.add(empCode);
    }
    const iban = parts[3]?.trim();
    if (!isPlausibleIban(iban)) {
      issues.push(issue('INVALID_IBAN', 'ERROR', i + 1, empCode, { iban: iban || '' }));
    }
    const netPayCol = parts[4]?.trim();
    if (!isNumeric(netPayCol)) {
      issues.push(issue('NET_PAY_NON_NUMERIC', 'ERROR', i + 1, empCode, { value: netPayCol }));
    } else {
      const np = Number(netPayCol);
      if (np <= 0) {
        issues.push(issue('INVALID_NET_PAY', 'ERROR', i + 1, empCode));
      } else {
        parsedTotal += np;
      }
    }
    parsedRows += 1;
  }
  if (trailerLine) {
    const tParts = trailerLine.split('|');
    if (tParts.length >= 3) {
      const cnt = Number(tParts[1]);
      const tot = Number(tParts[2]);
      if (Number.isFinite(cnt) && cnt !== parsedRows) {
        issues.push(
          issue('COUNT_MISMATCH', 'ERROR', lines.indexOf(trailerLine) + 1, undefined, {
            expected: parsedRows,
            actual: cnt,
          })
        );
      }
      if (Number.isFinite(tot) && Math.abs(tot - parsedTotal) > 0.01) {
        issues.push(
          issue('TOTAL_AMOUNT_MISMATCH', 'ERROR', lines.indexOf(trailerLine) + 1, undefined, {
            expected: tot,
            actual: Math.round(parsedTotal * 100) / 100,
          })
        );
      }
    }
  }
  return finalise('MUDAD', parsedRows, parsedTotal, issues, input);
}

// ============================================================================
// Generic bank-transfer-control (QWPS / BWPS / OWPS / KWPS)
// ============================================================================

function validateBtc(input: WpsValidationInput, format: WpsFormat): WpsValidationReport {
  const issues: WpsValidationIssue[] = [];
  const content = input.content.replace(/\r\n/g, '\n').trim();
  if (!content) {
    issues.push(issue('EMPTY_FILE', 'ERROR', 0));
    return finalise(format, 0, 0, issues, input);
  }
  const lines = content.split('\n');
  let parsedRows = 0;
  let parsedTotal = 0;
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    // Header line (first non-empty) typically encodes employer + period in pipe-separated form.
    if (i === 0) {
      if (!raw.includes('|')) {
        issues.push(issue('MISSING_HEADER', 'ERROR', 1));
      }
      continue;
    }
    const cols = raw.split(',');
    if (cols.length < 3) {
      issues.push(
        issue('WRONG_COLUMN_COUNT', 'ERROR', i + 1, cols[0], { expected: 3, actual: cols.length })
      );
      continue;
    }
    const empCode = cols[0]?.trim();
    const iban = cols[1]?.trim();
    const netPayCol = cols[2]?.trim();
    if (empCode) {
      if (seen.has(empCode)) {
        issues.push(
          issue('DUPLICATE_EMPLOYEE', 'ERROR', i + 1, empCode, { employeeCode: empCode })
        );
      }
      seen.add(empCode);
    }
    if (!isPlausibleIban(iban)) {
      issues.push(issue('INVALID_IBAN', 'ERROR', i + 1, empCode, { iban: iban || '' }));
    }
    if (!isNumeric(netPayCol)) {
      issues.push(issue('NET_PAY_NON_NUMERIC', 'ERROR', i + 1, empCode, { value: netPayCol }));
    } else {
      const np = Number(netPayCol);
      if (np <= 0) {
        issues.push(issue('INVALID_NET_PAY', 'ERROR', i + 1, empCode));
      } else {
        parsedTotal += np;
      }
    }
    parsedRows += 1;
  }
  return finalise(format, parsedRows, parsedTotal, issues, input);
}

function finalise(
  format: WpsFormat,
  parsedRows: number,
  parsedTotalAmount: number,
  issues: WpsValidationIssue[],
  input: WpsValidationInput
): WpsValidationReport {
  if (input.expected.employeeCount !== undefined && input.expected.employeeCount !== parsedRows) {
    issues.push(
      issue('COUNT_MISMATCH', 'WARN', 0, undefined, {
        expected: input.expected.employeeCount,
        actual: parsedRows,
      })
    );
  }
  if (
    input.expected.totalAmount !== undefined &&
    Math.abs(input.expected.totalAmount - parsedTotalAmount) > 0.01
  ) {
    issues.push(
      issue('TOTAL_AMOUNT_MISMATCH', 'WARN', 0, undefined, {
        expected: input.expected.totalAmount,
        actual: Math.round(parsedTotalAmount * 100) / 100,
      })
    );
  }
  const errors = issues.filter((i) => i.severity === 'ERROR').length;
  const warnings = issues.filter((i) => i.severity === 'WARN').length;
  return {
    format,
    parsedRows,
    parsedTotalAmount: Math.round(parsedTotalAmount * 100) / 100,
    issues,
    totals: { errors, warnings },
    valid: errors === 0,
  };
}

// ============================================================================
// Public entry point
// ============================================================================

export function validateWpsFile(input: WpsValidationInput): WpsValidationReport {
  switch (input.format) {
    case 'SIF':
      return validateSif(input);
    case 'MUDAD':
      return validateMudad(input);
    case 'QWPS':
    case 'BWPS':
    case 'OWPS':
    case 'KWPS':
      return validateBtc(input, input.format);
    default:
      return {
        format: input.format,
        parsedRows: 0,
        parsedTotalAmount: 0,
        issues: [
          issue('UNSUPPORTED_FORMAT', 'ERROR', 0, undefined, { format: String(input.format) }),
        ],
        totals: { errors: 1, warnings: 0 },
        valid: false,
      };
  }
}
