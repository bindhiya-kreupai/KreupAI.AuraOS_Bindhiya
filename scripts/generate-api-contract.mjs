#!/usr/bin/env node
/**
 * API contract manifest generator (#87).
 *
 * Walks every web API route file and emits a JSON manifest of (path × method)
 * → { permission?, body-shape-hint, response-shape-hint }. The manifest is
 * checked into `docs/api-contracts/web-routes.json`. A second script
 * (`check-mobile-contract-drift.mjs`) walks the mobile codebase to verify
 * every mobile API call still has a matching web route.
 *
 * Run:
 *   node scripts/generate-api-contract.mjs > docs/api-contracts/web-routes.json
 *   node scripts/generate-api-contract.mjs --check   # exit 1 if differs from on-disk
 */
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ROUTE_ROOT = 'apps/web/src/app/api';
const MANIFEST_PATH = 'docs/api-contracts/web-routes.json';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.isFile() && p.endsWith('route.ts')) out.push(p);
  }
  return out;
}

function routePathOf(filePath) {
  // apps/web/src/app/api/v1/payroll/full-final/[id]/route.ts → /api/v1/payroll/full-final/:id
  const rel = relative(join(ROOT, 'apps/web/src/app'), filePath);
  const parts = rel.replace(/\/route\.ts$/, '').split('/');
  return '/' + parts.map((p) => p.replace(/^\[\.\.\.(.+)\]$/, '*$1').replace(/^\[(.+)\]$/, ':$1')).join('/');
}

const METHOD_RE = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g;
const PERMISSION_RE = /permissions\.includes\(['"`]([^'"`]+)['"`]\)/;
const REQUIRED_FIELD_RE = /(!body\??\[?["']?(\w+)["']?\]?|body\??\.(\w+)\s*[!=]==?\s*undefined)/g;
const RETURN_OK_RE = /success:\s*true.*?data:\s*(\w+)/s;

function inferPermission(handlerSource) {
  const m = handlerSource.match(PERMISSION_RE);
  return m?.[1];
}

function inferRequiredFields(handlerSource) {
  const fields = new Set();
  // Patterns like: `if (!body.title)` or `if (!body.email)`
  for (const m of handlerSource.matchAll(/!body\.(\w+)/g)) fields.add(m[1]);
  // Required list pattern: `const required = ['employeeId', 'eventType', ...]`
  const reqList = handlerSource.match(/const\s+required\s*=\s*\[([^\]]+)\]/);
  if (reqList) {
    for (const m of reqList[1].matchAll(/['"]([\w]+)['"]/g)) fields.add(m[1]);
  }
  return [...fields];
}

function splitByHandler(source) {
  // Crude: split on `export const X =` lines. Each segment is a method's source.
  const segments = {};
  let last = null;
  for (const line of source.split('\n')) {
    const m = line.match(/export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/);
    if (m) {
      last = m[1];
      segments[last] = '';
    } else if (last) {
      segments[last] += line + '\n';
    }
  }
  return segments;
}

async function build() {
  const root = join(ROOT, ROUTE_ROOT);
  try { await stat(root); } catch {
    console.error(`Route root not found: ${root}`);
    process.exit(2);
  }
  const files = await walk(root);
  const manifest = {};
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    const path = routePathOf(f);
    const handlers = splitByHandler(text);
    for (const [method, source] of Object.entries(handlers)) {
      const permission = inferPermission(source);
      const requiredFields = method === 'GET' ? [] : inferRequiredFields(source);
      manifest[`${method} ${path}`] = {
        permission: permission ?? null,
        requiredFields,
        file: relative(ROOT, f),
      };
    }
  }
  return manifest;
}

async function main() {
  const isCheck = process.argv.includes('--check');
  const manifest = await build();
  const sortedKeys = Object.keys(manifest).sort();
  const sorted = Object.fromEntries(sortedKeys.map((k) => [k, manifest[k]]));
  const out = JSON.stringify(sorted, null, 2) + '\n';

  if (isCheck) {
    try {
      const onDisk = await readFile(join(ROOT, MANIFEST_PATH), 'utf8');
      if (onDisk === out) {
        console.log(`✓ ${MANIFEST_PATH} is up to date (${sortedKeys.length} routes)`);
        process.exit(0);
      }
      console.error(`✗ ${MANIFEST_PATH} is stale — re-run without --check to update`);
      process.exit(1);
    } catch {
      console.error(`✗ ${MANIFEST_PATH} missing — run without --check to create`);
      process.exit(1);
    }
  }

  await writeFile(join(ROOT, MANIFEST_PATH), out);
  console.log(`✓ wrote ${MANIFEST_PATH} (${sortedKeys.length} routes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
