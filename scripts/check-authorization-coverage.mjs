#!/usr/bin/env node
/**
 * Authorization verification matrix (#94).
 *
 * Scans every API route file for missing auth/permission guards and produces
 * a coverage matrix grouped by domain.
 *
 * What it checks per route file:
 *   1. Is the handler wrapped in withEnhancedAuth or createProtectedRoute?
 *   2. Does it include a permission check via `permissions.includes(...)`?
 *   3. Are mutation handlers (POST/PUT/PATCH/DELETE) wrapped in withAudit?
 *
 * Exit codes:
 *   0 = clean (all routes guarded + audited)
 *   1 = coverage gaps found
 *
 * Run:
 *   node scripts/check-authorization-coverage.mjs
 *   node scripts/check-authorization-coverage.mjs --json
 *   node scripts/check-authorization-coverage.mjs --domain=payroll
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ROUTE_ROOT = 'apps/web/src/app/api';

const HAS_AUTH = /with(Enhanced|Protected)?Auth|createProtectedRoute/;
const HAS_PERMISSION_CHECK = /permissions\.includes\s*\(|requirePermission\s*\(/;
const HAS_AUDIT = /withAudit\s*\(/;
const HANDLER_EXPORT = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g;
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) out.push(p);
  }
  return out;
}

function domainOf(path) {
  // apps/web/src/app/api/v1/payroll/full-final/route.ts → payroll
  const parts = relative(ROOT, path).split('/');
  const idx = parts.indexOf('api');
  if (idx === -1) return 'unknown';
  const after = parts.slice(idx + 1).filter((p) => p !== 'v1' && !p.startsWith('['));
  return after[0] ?? 'unknown';
}

function analyze(text, path) {
  const methods = [];
  let m;
  HANDLER_EXPORT.lastIndex = 0;
  while ((m = HANDLER_EXPORT.exec(text)) !== null) methods.push(m[1]);

  return {
    file: relative(ROOT, path),
    domain: domainOf(path),
    methods,
    hasAuth: HAS_AUTH.test(text),
    hasPermissionCheck: HAS_PERMISSION_CHECK.test(text),
    hasAudit: HAS_AUDIT.test(text),
    needsAudit: methods.some((m) => MUTATION_METHODS.has(m)),
  };
}

function score(r) {
  const missing = [];
  if (r.methods.length > 0 && !r.hasAuth) missing.push('AUTH');
  if (r.methods.length > 0 && !r.hasPermissionCheck) missing.push('PERMISSION');
  if (r.needsAudit && !r.hasAudit) missing.push('AUDIT');
  return missing;
}

async function main() {
  const root = join(ROOT, ROUTE_ROOT);
  try { await stat(root); } catch {
    console.error(`Route root not found: ${root}`);
    process.exit(2);
  }

  const argDomain = process.argv.find((a) => a.startsWith('--domain='))?.split('=')[1];
  const isJson = process.argv.includes('--json');

  const files = (await walk(root)).filter((f) => f.endsWith('route.ts'));
  const records = [];
  for (const f of files) {
    const r = analyze(await readFile(f, 'utf8'), f);
    if (argDomain && r.domain !== argDomain) continue;
    records.push({ ...r, missing: score(r) });
  }

  // Aggregate by domain
  const byDomain = new Map();
  for (const r of records) {
    const bucket = byDomain.get(r.domain) ?? {
      domain: r.domain,
      total: 0,
      auth: 0,
      permission: 0,
      audit: 0,
      auditNeeded: 0,
      missing: [],
    };
    bucket.total += 1;
    if (r.hasAuth) bucket.auth += 1;
    if (r.hasPermissionCheck) bucket.permission += 1;
    if (r.needsAudit) bucket.auditNeeded += 1;
    if (r.hasAudit) bucket.audit += 1;
    if (r.missing.length) bucket.missing.push({ file: r.file, missing: r.missing, methods: r.methods });
    byDomain.set(r.domain, bucket);
  }

  const summary = Array.from(byDomain.values()).sort((a, b) => b.total - a.total);

  if (isJson) {
    console.log(JSON.stringify({ scanned: records.length, summary }, null, 2));
    process.exit(summary.some((d) => d.missing.length) ? 1 : 0);
    return;
  }

  console.log(`Authorization Coverage Matrix — ${records.length} route files\n`);
  const totalGaps = summary.reduce((s, d) => s + d.missing.length, 0);
  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    `${pad('Domain', 28)} ${pad('Routes', 8)} ${pad('Auth', 8)} ${pad('Perm', 8)} ${pad('Audit/Mut', 10)} ${pad('Gaps', 6)}`
  );
  console.log('-'.repeat(78));
  for (const d of summary) {
    const pct = (n) => `${Math.round((n / Math.max(1, d.total)) * 100)}%`;
    console.log(
      `${pad(d.domain, 28)} ${pad(d.total, 8)} ${pad(pct(d.auth), 8)} ${pad(pct(d.permission), 8)} ${pad(`${d.audit}/${d.auditNeeded}`, 10)} ${pad(d.missing.length, 6)}`
    );
  }
  console.log('-'.repeat(78));
  console.log(`Total coverage gaps: ${totalGaps}\n`);

  if (totalGaps > 0 && !argDomain) {
    console.log('Top 10 worst-offending files:');
    const worst = summary
      .flatMap((d) => d.missing.map((m) => ({ ...m, domain: d.domain })))
      .sort((a, b) => b.missing.length - a.missing.length)
      .slice(0, 10);
    for (const w of worst) {
      console.log(`  [${w.domain}] ${w.file}  →  ${w.missing.join(', ')} (${w.methods.join('/')})`);
    }
  }

  process.exit(totalGaps > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
