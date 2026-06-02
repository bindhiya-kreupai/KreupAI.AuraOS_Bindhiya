/**
 * @module bulkImportService
 * @description Bulk data import engine — CSV/Excel parsing, column mapping,
 *   row validation, and batch upsert for enterprise mass-import workflows.
 * @project AURA HCM Platform
 */

import type { ZodSchema } from 'zod';
import type * as XLSXType from 'xlsx';
import { z } from 'zod';
import { APIClient } from '@/lib/api-client';

// ── Entity Types ───────────────────────────────────────────────────────────────

export type ImportEntityType =
  | 'employees'
  | 'departments'
  | 'positions'
  | 'leave-balances'
  | 'attendance';

// ── Row & Parse Types ──────────────────────────────────────────────────────────

export type RawRow = Record<string, string>;

export interface ParsedFile {
  fileName: string;
  fileSize: number;
  entityType?: ImportEntityType;
  columns: string[];
  rows: RawRow[];
  totalRows: number;
  sheetNames?: string[]; // XLSX only
  activeSheet?: string;
}

export interface ColumnMappingEntry {
  sourceColumn: string;
  targetField: string | null; // null = "skip this column"
  confidence: number; // 0–1 auto-detect confidence
  sampleValues: string[];
}

export interface ColumnMappingResult {
  entityType: ImportEntityType;
  mappings: ColumnMappingEntry[];
  unmappedTargetFields: TargetFieldDef[];
}

export interface TargetFieldDef {
  name: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
}

// ── Validation Types ───────────────────────────────────────────────────────────

export interface RowValidationError {
  row: number; // 1-indexed (human-friendly)
  field: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationReport {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  errors: RowValidationError[];
  warnings: RowValidationError[];
  cleanRows: RawRow[];
}

// ── Import Job Types ───────────────────────────────────────────────────────────

export type ImportJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'partial';

export interface ImportJobResult {
  jobId: string;
  entityType: ImportEntityType;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errors: string[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  entityType: ImportEntityType;
  status: ImportJobStatus;
  totalRows: number;
  successRows: number;
  failedRows: number;
  importedBy: string;
  startedAt: string;
  completedAt?: string;
}

// ── Target Field Definitions ───────────────────────────────────────────────────

const ENTITY_TARGET_FIELDS: Record<ImportEntityType, TargetFieldDef[]> = {
  employees: [
    { name: 'employeeId', label: 'Employee ID', required: false, type: 'string' },
    { name: 'firstName', label: 'First Name', required: true, type: 'string' },
    { name: 'lastName', label: 'Last Name', required: true, type: 'string' },
    { name: 'email', label: 'Work Email', required: true, type: 'email' },
    { name: 'phone', label: 'Phone Number', required: false, type: 'phone' },
    { name: 'department', label: 'Department', required: true, type: 'string' },
    { name: 'position', label: 'Position / Job Title', required: true, type: 'string' },
    { name: 'manager', label: 'Reporting Manager', required: false, type: 'string' },
    { name: 'hireDate', label: 'Date of Hire', required: true, type: 'date' },
    { name: 'salary', label: 'Base Salary', required: false, type: 'number' },
    { name: 'location', label: 'Work Location', required: false, type: 'string' },
    { name: 'employmentType', label: 'Employment Type', required: false, type: 'string' },
    { name: 'nationalId', label: 'National ID / Iqama', required: false, type: 'string' },
  ],
  departments: [
    { name: 'code', label: 'Department Code', required: true, type: 'string' },
    { name: 'name', label: 'Department Name', required: true, type: 'string' },
    { name: 'parentDepartment', label: 'Parent Department', required: false, type: 'string' },
    { name: 'headEmail', label: 'Department Head Email', required: false, type: 'email' },
    { name: 'costCenter', label: 'Cost Center', required: false, type: 'string' },
  ],
  positions: [
    { name: 'code', label: 'Position Code', required: true, type: 'string' },
    { name: 'title', label: 'Job Title', required: true, type: 'string' },
    { name: 'department', label: 'Department', required: true, type: 'string' },
    { name: 'grade', label: 'Job Grade', required: false, type: 'string' },
    { name: 'minSalary', label: 'Min Salary', required: false, type: 'number' },
    { name: 'maxSalary', label: 'Max Salary', required: false, type: 'number' },
  ],
  'leave-balances': [
    { name: 'employeeId', label: 'Employee ID', required: true, type: 'string' },
    { name: 'leaveType', label: 'Leave Type', required: true, type: 'string' },
    { name: 'balance', label: 'Balance (Days)', required: true, type: 'number' },
    { name: 'year', label: 'Balance Year', required: true, type: 'string' },
    { name: 'carried', label: 'Carried Forward', required: false, type: 'number' },
  ],
  attendance: [
    { name: 'employeeId', label: 'Employee ID', required: true, type: 'string' },
    { name: 'date', label: 'Date', required: true, type: 'date' },
    { name: 'checkIn', label: 'Check In Time', required: false, type: 'string' },
    { name: 'checkOut', label: 'Check Out Time', required: false, type: 'string' },
    { name: 'status', label: 'Attendance Status', required: true, type: 'string' },
    { name: 'notes', label: 'Notes', required: false, type: 'string' },
  ],
};

// ── Auto-detect column mapping keywords ───────────────────────────────────────

const COLUMN_KEYWORDS: Record<string, string[]> = {
  firstName: ['first_name', 'firstname', 'first name', 'fname', 'given name'],
  lastName: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family name'],
  email: ['email', 'e-mail', 'work email', 'emp_email', 'email address'],
  phone: ['phone', 'mobile', 'telephone', 'contact', 'cell'],
  department: ['department', 'dept', 'division', 'team'],
  position: ['position', 'title', 'job title', 'role', 'designation'],
  manager: ['manager', 'supervisor', 'reports to', 'reporting manager', 'line manager'],
  hireDate: [
    'hire date',
    'start date',
    'joining date',
    'date of joining',
    'doj',
    'hire_date',
    'start_date',
  ],
  salary: ['salary', 'base salary', 'base pay', 'ctc', 'annual salary', 'monthly salary'],
  employeeId: ['employee id', 'emp id', 'employee_id', 'emp_id', 'staff id', 'badge'],
  location: ['location', 'office', 'city', 'site', 'branch'],
  employmentType: ['employment type', 'emp type', 'contract type', 'type'],
  nationalId: ['national id', 'national_id', 'iqama', 'civil id', 'id number', 'nid'],
  code: ['code', 'dept code', 'dept_code', 'short code'],
  name: ['name', 'title', 'label'],
  date: ['date', 'attendance date'],
  checkIn: ['check in', 'check_in', 'time in', 'clock in', 'arrival'],
  checkOut: ['check out', 'check_out', 'time out', 'clock out', 'departure'],
  status: ['status', 'attendance status'],
  balance: ['balance', 'days', 'leave balance', 'leave days'],
  year: ['year', 'balance year', 'fy'],
  leaveType: ['leave type', 'leave_type', 'type'],
};

// ── CSV Parser ─────────────────────────────────────────────────────────────────

/**
 * Stream-parse a CSV File using the built-in ReadableStream API.
 * Falls back to full-text parsing on browsers that don't support streaming.
 */
export async function parseCSV(file: File): Promise<ParsedFile> {
  const text = await readFileAsText(file);
  const lines = splitCSVLines(text);

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row.');
  }

  const columns = parseCSVRow(lines[0]);
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip blank lines

    const values = parseCSVRow(line);
    const row: RawRow = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    columns,
    rows,
    totalRows: rows.length,
  };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'utf-8');
  });
}

function splitCSVLines(text: string): string[] {
  // Handle \r\n and \r line endings
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// ── Excel (XLSX) Parser ────────────────────────────────────────────────────────

/**
 * Parse an XLSX / XLS file.
 * Uses the `xlsx` package (SheetJS) which is loaded dynamically to avoid
 * bloating the initial bundle.
 */
export async function parseExcel(file: File, sheetName?: string): Promise<ParsedFile> {
  // Dynamically import xlsx to keep it out of the critical path
  let XLSX: typeof XLSXType;

  try {
    XLSX = await import('xlsx');
  } catch {
    throw new Error('xlsx package is not installed. Run: npm install xlsx --workspace=apps/web');
  }

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('Excel file contains no worksheets.');
  }

  const activeSheet = sheetName ?? sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];

  if (!worksheet) {
    throw new Error(`Sheet "${activeSheet}" not found in workbook.`);
  }

  // Convert sheet to array-of-arrays
  const raw = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: '',
  });

  if (raw.length < 2) {
    throw new Error('Excel sheet must contain at least a header row and one data row.');
  }

  const columns = (raw[0] as string[]).map((c) => String(c).trim());
  const rows: RawRow[] = [];

  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i] as string[];
    // Skip entirely blank rows
    if (cells.every((c) => !String(c).trim())) continue;

    const row: RawRow = {};
    columns.forEach((col, idx) => {
      const val = cells[idx];
      row[col] = val !== null && val !== undefined ? String(val).trim() : '';
    });
    rows.push(row);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    columns,
    rows,
    totalRows: rows.length,
    sheetNames,
    activeSheet,
  };
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Column Mapping ─────────────────────────────────────────────────────────────

/**
 * Auto-detect column mappings from source CSV/Excel header names to
 * the canonical target field names for the given entity type.
 */
export function mapColumns(
  sourceColumns: string[],
  entityType: ImportEntityType
): ColumnMappingResult {
  const targetFields = ENTITY_TARGET_FIELDS[entityType];

  const mappings: ColumnMappingEntry[] = sourceColumns.map((col) => {
    const colNorm = col.toLowerCase().trim();
    let bestField: string | null = null;
    let bestConfidence = 0;

    for (const [fieldName, keywords] of Object.entries(COLUMN_KEYWORDS)) {
      // Check if this field is relevant to the current entity
      const isRelevant = targetFields.some((f) => f.name === fieldName);
      if (!isRelevant) continue;

      for (const kw of keywords) {
        if (colNorm === kw) {
          if (1.0 > bestConfidence) {
            bestField = fieldName;
            bestConfidence = 1.0;
          }
          break;
        } else if (colNorm.includes(kw) || kw.includes(colNorm)) {
          const confidence = 0.75;
          if (confidence > bestConfidence) {
            bestField = fieldName;
            bestConfidence = confidence;
          }
        }
      }
    }

    return {
      sourceColumn: col,
      targetField: bestField,
      confidence: bestConfidence,
      sampleValues: [], // caller fills in from ParsedFile.rows
    };
  });

  // Populate sample values from the first mapping result (caller should enrich this)
  const mappedTargetFields = new Set(mappings.map((m) => m.targetField).filter(Boolean));
  const unmappedTargetFields = targetFields.filter(
    (f) => f.required && !mappedTargetFields.has(f.name)
  );

  return { entityType, mappings, unmappedTargetFields };
}

/**
 * Enrich ColumnMappingResult with sample values from parsed rows.
 */
export function enrichMappingsWithSamples(
  mappings: ColumnMappingEntry[],
  rows: RawRow[],
  sampleCount = 3
): ColumnMappingEntry[] {
  return mappings.map((m) => ({
    ...m,
    sampleValues: rows
      .slice(0, sampleCount)
      .map((r) => r[m.sourceColumn] ?? '')
      .filter(Boolean),
  }));
}

// ── Zod Schemas per Entity ─────────────────────────────────────────────────────

function dateString() {
  return z.string().refine(
    (v) => {
      if (!v) return false;
      const d = new Date(v);
      return !isNaN(d.getTime());
    },
    { message: 'Invalid date format' }
  );
}

const ENTITY_SCHEMAS: Record<ImportEntityType, ZodSchema> = {
  employees: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    hireDate: dateString(),
    phone: z.string().optional(),
    manager: z.string().optional(),
    salary: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), { message: 'Salary must be numeric' }),
    location: z.string().optional(),
    employmentType: z.string().optional(),
    employeeId: z.string().optional(),
    nationalId: z.string().optional(),
  }),
  departments: z.object({
    code: z.string().min(1, 'Department code is required'),
    name: z.string().min(1, 'Department name is required'),
    parentDepartment: z.string().optional(),
    headEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    costCenter: z.string().optional(),
  }),
  positions: z.object({
    code: z.string().min(1, 'Position code is required'),
    title: z.string().min(1, 'Job title is required'),
    department: z.string().min(1, 'Department is required'),
    grade: z.string().optional(),
    minSalary: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), { message: 'Min salary must be numeric' }),
    maxSalary: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), { message: 'Max salary must be numeric' }),
  }),
  'leave-balances': z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    leaveType: z.string().min(1, 'Leave type is required'),
    balance: z
      .string()
      .min(1, 'Balance is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Balance must be a non-negative number',
      }),
    year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
    carried: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), { message: 'Carried forward must be numeric' }),
  }),
  attendance: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    date: dateString(),
    status: z.string().min(1, 'Status is required'),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    notes: z.string().optional(),
  }),
};

// ── Row Validation ─────────────────────────────────────────────────────────────

/**
 * Apply column mapping to raw rows, then validate each against the entity schema.
 */
export function validateRows(
  rows: RawRow[],
  entityType: ImportEntityType,
  columnMapping: ColumnMappingEntry[]
): ValidationReport {
  const schema = ENTITY_SCHEMAS[entityType];
  const errors: RowValidationError[] = [];
  const warnings: RowValidationError[] = [];
  const errorRowIndices = new Set<number>();
  const cleanRows: RawRow[] = [];

  // Build source→target lookup
  const colLookup: Record<string, string> = {};
  for (const m of columnMapping) {
    if (m.targetField) {
      colLookup[m.sourceColumn] = m.targetField;
    }
  }

  rows.forEach((rawRow, idx) => {
    const rowNum = idx + 1; // 1-indexed

    // Remap columns
    const mapped: RawRow = {};
    for (const [src, val] of Object.entries(rawRow)) {
      const target = colLookup[src];
      if (target) {
        mapped[target] = val;
      }
    }

    // Validate with Zod
    const result = schema.safeParse(mapped);

    if (result.success) {
      cleanRows.push(mapped);
    } else {
      errorRowIndices.add(idx);
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'unknown';
        const value = mapped[field] ?? '';
        const suggestion = buildSuggestion(field, value, issue.message);

        errors.push({
          row: rowNum,
          field,
          value: String(value),
          message: issue.message,
          severity: 'error',
          suggestion,
        });
      }
    }

    // Extra warnings regardless of validity
    const rowWarnings = checkBusinessWarnings(mapped, rowNum, entityType);
    warnings.push(...rowWarnings);
  });

  const errorRows = errorRowIndices.size;
  const warningRows = new Set(warnings.map((w) => w.row)).size;

  return {
    valid: errors.length === 0,
    totalRows: rows.length,
    validRows: cleanRows.length,
    errorRows,
    warningRows,
    errors,
    warnings,
    cleanRows,
  };
}

function buildSuggestion(field: string, value: string, message: string): string | undefined {
  if (field === 'email' && message.includes('email')) {
    return `Check that the value "${value}" follows the format user@domain.com`;
  }
  if ((field === 'hireDate' || field === 'date') && message.includes('date')) {
    return 'Use ISO format YYYY-MM-DD, e.g. 2024-03-15';
  }
  if (
    (field === 'salary' || field === 'balance' || field === 'minSalary' || field === 'maxSalary') &&
    message.includes('numeric')
  ) {
    return 'Remove non-numeric characters (currency symbols, commas, N/A)';
  }
  return undefined;
}

function checkBusinessWarnings(
  row: RawRow,
  rowNum: number,
  entityType: ImportEntityType
): RowValidationError[] {
  const warnings: RowValidationError[] = [];

  if (entityType === 'employees') {
    if (row.salary && Number(row.salary) > 500_000) {
      warnings.push({
        row: rowNum,
        field: 'salary',
        value: row.salary,
        message: `Unusually high salary: ${row.salary}. Please verify.`,
        severity: 'warning',
      });
    }
    if (row.hireDate) {
      const hired = new Date(row.hireDate);
      if (hired > new Date()) {
        warnings.push({
          row: rowNum,
          field: 'hireDate',
          value: row.hireDate,
          message: 'Hire date is in the future.',
          severity: 'warning',
        });
      }
    }
  }

  return warnings;
}

// ── Bulk Import Execution ──────────────────────────────────────────────────────

const BATCH_SIZE = 100;

/**
 * Send validated rows to the API in batches of BATCH_SIZE.
 * Reports progress via the optional onProgress callback.
 */
export async function executeBulkImport(
  entityType: ImportEntityType,
  validRows: RawRow[],
  onProgress?: (processed: number, total: number) => void
): Promise<ImportJobResult> {
  const jobId = `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  let successRows = 0;
  const allErrors: string[] = [];

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    try {
      const response = await APIClient.post<{ inserted: number; errors: string[] }>(
        `/api/v1/admin/bulk-import/${entityType}`,
        { rows: batch, jobId }
      );
      successRows += response.inserted;
      if (response.errors?.length) {
        allErrors.push(...response.errors);
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown batch error';
      allErrors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${msg}`);
    }

    onProgress?.(Math.min(i + BATCH_SIZE, validRows.length), validRows.length);
  }

  const completedAt = new Date().toISOString();
  const failedRows = validRows.length - successRows;
  const status: ImportJobStatus =
    allErrors.length === 0 ? 'completed' : successRows === 0 ? 'failed' : 'partial';

  return {
    jobId,
    entityType,
    status,
    totalRows: validRows.length,
    processedRows: validRows.length,
    successRows,
    failedRows,
    errors: allErrors,
    startedAt,
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
  };
}

// ── Import History ─────────────────────────────────────────────────────────────

export async function getImportHistory(): Promise<ImportHistoryItem[]> {
  try {
    return await APIClient.get<ImportHistoryItem[]>('/api/v1/admin/bulk-import/history');
  } catch {
    // Return empty array if the endpoint isn't live yet
    return [];
  }
}

// ── File Helpers ───────────────────────────────────────────────────────────────

/** Parse any supported file type (CSV or XLSX/XLS). */
export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a CSV or Excel file.`);
}

/** Return a list of available target fields for the entity type. */
export function getTargetFields(entityType: ImportEntityType): TargetFieldDef[] {
  return ENTITY_TARGET_FIELDS[entityType];
}
