#!/usr/bin/env node
/**
 * Mobile/web contract drift check (#87).
 *
 * Walks the mobile codebase for HTTP calls (apiClient.get/post/put/delete or
 * direct fetch with /api/...) and verifies every (method, path) is present
 * in the web manifest at docs/api-contracts/web-routes.json.
 *
 * Mobile→web is the primary direction we care about: a route the mobile app
 * still hits but the web no longer exposes is a CI-blocking regression for
 * the mobile release.
 *
 * Exit codes:
 *   0 = no drift
 *   1 = drift found
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const MOBILE_ROOT = 'apps/mobile/src';
const MANIFEST = 'docs/api-contracts/web-routes.json';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) out.push(p);
  }
  return out;
}

function* scanFile(text, path) {
  // apiClient.get('/v1/...') and direct fetch('/api/v1/...')
  for (const m of text.matchAll(/apiClient\.(get|post|put|patch|delete)\s*<?[^>]*>?\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
    yield { method: m[1].toUpperCase(), apiPath: m[2], file: relative(ROOT, path) };
  }
  for (const m of text.matchAll(/fetch\s*\(\s*['"`](\/api\/[^'"`]+)['"`][^,]*,\s*\{[^}]*method:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g)) {
    yield { method: m[2], apiPath: m[1].replace(/^\/api/, ''), file: relative(ROOT, path) };
  }
}

function normalizePath(p) {
  // Convert "/v1/payroll/full-final/abc-123-uuid" to "/v1/payroll/full-final/:id"
  // by collapsing UUID-shaped or numeric path segments to :id.
  return p
    .split('?')[0]
    .split('/')
    .map((seg) =>
      /^[0-9a-f-]{36}$/i.test(seg) || /^\d+$/.test(seg) ? ':id' : seg
    )
    .join('/');
}

async function main() {
  const mobileRoot = join(ROOT, MOBILE_ROOT);
  try { await stat(mobileRoot); } catch {
    console.error(`Mobile root not found: ${mobileRoot}`);
    process.exit(2);
  }

  const manifest = JSON.parse(await readFile(join(ROOT, MANIFEST), 'utf8'));
  const validRoutes = new Set(Object.keys(manifest));

  const files = await walk(mobileRoot);
  const calls = [];
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    for (const c of scanFile(text, f)) calls.push(c);
  }

  const drift = [];
  for (const c of calls) {
    const normalized = normalizePath('/api' + c.apiPath);
    const key = `${c.method} ${normalized}`;
    if (!validRoutes.has(key)) drift.push({ ...c, lookup: key });
  }

  console.log(`Mobile API call audit — ${calls.length} call sites scanned`);
  if (drift.length === 0) {
    console.log('✓ no drift — every mobile call has a matching web route');
    process.exit(0);
  }
  console.log(`✗ ${drift.length} drifted call(s):\n`);
  // Group by call signature
  const byKey = new Map();
  for (const d of drift) {
    const k = `${d.method} ${d.apiPath}`;
    if (!byKey.has(k)) byKey.set(k, { method: d.method, apiPath: d.apiPath, sites: [] });
    byKey.get(k).sites.push(d.file);
  }
  for (const v of byKey.values()) {
    console.log(`  ${v.method.padEnd(6)} ${v.apiPath}`);
    for (const s of v.sites.slice(0, 3)) console.log(`           ${s}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
