#!/usr/bin/env node
/**
 * Tenant isolation static analyzer (#89).
 *
 * Scans every API route file under apps/web/src/app/api for Prisma calls that
 * touch tenant-scoped models without including `tenantId` in the where clause.
 *
 * Operates on text — fast, no TS compile required. False-positives are
 * suppressed via inline `// tenant-ok:` comments above the call.
 *
 * Exit codes:
 *   0 = clean (or only allow-listed findings)
 *   1 = violations found
 *
 * Run:
 *   node scripts/check-tenant-isolation.mjs
 *   node scripts/check-tenant-isolation.mjs --json   # machine-readable
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ROUTE_ROOT = 'apps/web/src/app/api';

// Prisma models we consider tenant-scoped. Drawn from schema.prisma — every
// model with a `tenantId` column belongs here. The list is intentionally
// hand-curated rather than auto-extracted, so a missing model is a real
// finding, not a metadata drift.
const TENANT_SCOPED_MODELS = new Set([
  'employee',
  'company',
  'department',
  'location',
  'jobProfile',
  'grade',
  'employeeStatus',
  'employmentType',
  'user',
  'role',
  'userRole',
  'permission',
  'rolePermission',
  'leaveType',
  'leavePolicy',
  'leaveBalance',
  'leaveRequest',
  'leaveAccrual',
  'leaveCarryForward',
  'leaveEncashment',
  'attendancePunch',
  'attendanceRecord',
  'shift',
  'shiftAssignment',
  'shiftRoster',
  'shiftSwapRequest',
  'overtimeRequest',
  'attendanceRegularization',
  'compOffRequest',
  'payrollConfiguration',
  'payrollRun',
  'payslip',
  'payrollAdjustment',
  'taxRegime',
  'payComponent',
  'bank',
  'systemSetting',
  'salaryComponent',
  'salaryStructure',
  'profileChangeRequest',
  'fullFinalSettlement',
  'visaPermit',
  'visaRenewal',
  'statutoryReport',
  'expenseClaim',
  'expenseLineItem',
  'expensePolicy',
  'cobraQualifyingEvent',
  'cobraEnrollment',
  'customField',
  'featureFlag',
  'fMLACase',
  'fMLAUsage',
  'gLAccount',
  'payrollAccountMapping',
  'gLJournalEntry',
  'payEquityFinding',
  'dRDrill',
  'backupRun',
  'dSARRequest',
  'consentRecord',
  'dataProcessingAgreement',
  'serviceLevelObjective',
  'incident',
  'aIModelCard',
  'aIBiasAudit',
  'securityEvent',
]);

// Operation suffixes that need a where-clause with tenantId.
const SCOPED_OPS = ['findFirst', 'findMany', 'findUnique', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'];

// Suppression marker — place `// tenant-ok: <reason>` on the line above the call.
const SUPPRESS = /\/\/\s*tenant-ok:/;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.isFile() && (path.endsWith('.ts') || path.endsWith('.tsx'))) out.push(path);
  }
  return out;
}

function* scanFile(text, path) {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip if previous line carries suppression
    const prev = i > 0 ? lines[i - 1] : '';
    if (SUPPRESS.test(prev)) continue;

    // Match `prisma.<model>.<op>(` patterns
    const m = line.match(/prisma\.([a-zA-Z]+)\.([a-zA-Z]+)\s*\(/);
    if (!m) continue;
    const [, model, op] = m;
    if (!TENANT_SCOPED_MODELS.has(model)) continue;
    if (!SCOPED_OPS.includes(op)) continue;

    // Grab the next ~30 lines as the call's argument window. Naive but enough
    // to catch the `where: { ... tenantId ... }` shape.
    const window = lines.slice(i, Math.min(lines.length, i + 30)).join('\n');
    const hasTenantId = /tenantId\s*[:,]/.test(window);
    const usesCompanyTenant = /company:\s*\{\s*tenantId/.test(window);
    const usesUserTenantTrick = /user:\s*\{[^}]*tenantId/.test(window);

    // If the call uses a variable `where` (rather than inlining the object),
    // scan back up to 50 lines for its tenant-scoped assignment.
    let usesVarWithTenant = false;
    if (
      /\bwhere\s*[,}]/.test(window) &&
      !hasTenantId &&
      !usesCompanyTenant &&
      !usesUserTenantTrick
    ) {
      const back = lines.slice(Math.max(0, i - 50), i).join('\n');
      if (
        /\bwhere[^=]*=[\s\S]{0,400}tenantId/.test(back) ||
        /\bwhere[^=]*=[\s\S]{0,400}company:\s*\{\s*tenantId/.test(back) ||
        /\bwhere\.[a-zA-Z]+[\s\S]{0,200}=\s*\{[\s\S]{0,200}tenantId/.test(back)
      ) {
        usesVarWithTenant = true;
      }
    }

    if (!hasTenantId && !usesCompanyTenant && !usesUserTenantTrick && !usesVarWithTenant) {
      yield {
        file: relative(ROOT, path),
        line: i + 1,
        snippet: line.trim(),
        model,
        op,
      };
    }
  }
}

async function main() {
  const root = join(ROOT, ROUTE_ROOT);
  try {
    await stat(root);
  } catch {
    console.error(`Route root not found: ${root}`);
    process.exit(2);
  }

  const files = await walk(root);
  const findings = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const f of scanFile(text, file)) findings.push(f);
  }

  const isJson = process.argv.includes('--json');
  if (isJson) {
    console.log(JSON.stringify({ scanned: files.length, findings }, null, 2));
  } else {
    console.log(`Tenant Isolation Analyzer — scanned ${files.length} route files`);
    if (findings.length === 0) {
      console.log('✓ no violations');
    } else {
      console.log(`✗ ${findings.length} violation(s):\n`);
      for (const f of findings) {
        console.log(`  ${f.file}:${f.line}  prisma.${f.model}.${f.op}(`);
        console.log(`    | ${f.snippet}`);
      }
      console.log(
        '\nTo suppress a false positive, add `// tenant-ok: <reason>` on the line ABOVE the prisma call.'
      );
    }
  }
  process.exit(findings.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
