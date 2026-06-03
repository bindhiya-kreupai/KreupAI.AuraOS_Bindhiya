#!/usr/bin/env node
/**
 * Query performance static analyzer (#84).
 *
 * Walks every API route + service file, extracts Prisma findMany/findFirst/
 * count/aggregate where-clauses, and cross-references the fields used
 * against the `@@index` and `@@unique` directives in schema.prisma.
 *
 * Flags any where-clause field that is NOT covered by an index. Catches
 * the most common report-perf cliff: full-table scan on a heavily-
 * filtered column.
 *
 * Exit codes:
 *   0 = clean
 *   1 = uncovered queries found
 *
 * Run:
 *   node scripts/check-query-perf.mjs
 *   node scripts/check-query-perf.mjs --json
 *   node scripts/check-query-perf.mjs --service=payroll
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCHEMA = 'packages/@aura/database/prisma/schema.prisma';
const SCAN_ROOTS = ['apps/web/src/app/api', 'apps/web/src/lib/services'];

// Fields that don't need explicit indexes (auto-indexed by Prisma)
const AUTO_INDEXED = new Set(['id']);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) out.push(p);
  }
  return out;
}

/**
 * Parse schema.prisma — extract per-model: pascalcased model name (for prisma
 * client field `firstLowercased`), tenantId-having flag, and the set of
 * indexed-or-unique fields (single-column only — composite indexes still help
 * single-column queries on the leading column).
 */
async function parseSchema() {
  const text = await readFile(join(ROOT, SCHEMA), 'utf8');
  const models = new Map();
  const blockRe = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    const name = m[1];
    const body = m[2];
    const clientField = name[0].toLowerCase() + name.slice(1);

    const indexedFields = new Set(AUTO_INDEXED);

    // @id and @unique on individual fields
    for (const line of body.split('\n')) {
      const f = line.trim().match(/^(\w+)\s+\S+.*@(id|unique)/);
      if (f) indexedFields.add(f[1]);
    }

    // @@unique([a, b]) and @@index([a, b]) — only the leading column counts
    // for single-column-where coverage detection.
    const dirRe = /@@(?:unique|index)\(\[([^\]]+)\]\)/g;
    let d;
    while ((d = dirRe.exec(body)) !== null) {
      const [first] = d[1].split(',').map((s) => s.trim());
      if (first) indexedFields.add(first.replace(/[()]/g, ''));
    }

    models.set(clientField, { name, indexedFields });
  }
  return models;
}

const SCAN_OPS = ['findFirst', 'findMany', 'findUnique', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'];

/**
 * Naive where-clause scanner. For each `prisma.<model>.<op>({ where: { ... } })`
 * call, return the top-level keys inside the immediately-following where
 * object. This is a text-level approximation — JS parsers would be more
 * accurate but slower for what's a CI gate.
 */
function* scanFile(text, path) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/prisma\.(\w+)\.(\w+)\s*\(/);
    if (!m) continue;
    const [, model, op] = m;
    if (!SCAN_OPS.includes(op)) continue;

    // Grab up to 40 lines forward
    const window = lines.slice(i, Math.min(lines.length, i + 40)).join('\n');
    // Find first `where:` block
    const wm = window.match(/where\s*:\s*\{([\s\S]*?)\n\s{0,12}\}/);
    if (!wm) continue;
    const inner = wm[1];

    // Top-level keys only: not nested, not under AND/OR/NOT (those nest).
    // Also skip Prisma operation keys that frequently appear at the top
    // level of a findMany call but are NOT where-clause fields.
    const OP_KEYS = new Set(['select', 'include', 'orderBy', 'data', 'create', 'update', 'connectOrCreate', 'set', 'push', 'increment', 'skip', 'take', 'cursor', 'distinct', '_count', '_sum', '_avg', '_min', '_max', '_]', 'connect', 'disconnect', 'upsert', 'createMany', 'updateMany', 'deleteMany']);
    const fields = new Set();
    const keyRe = /^\s{2,}(\w+)\s*:/gm;
    let k;
    while ((k = keyRe.exec(inner)) !== null) {
      const f = k[1];
      if (['AND', 'OR', 'NOT'].includes(f)) continue;
      if (OP_KEYS.has(f)) continue;
      fields.add(f);
    }

    yield { file: relative(ROOT, path), line: i + 1, model, op, fields: [...fields] };
  }
}

async function main() {
  const schemaModels = await parseSchema();
  const isJson = process.argv.includes('--json');
  const argService = process.argv.find((a) => a.startsWith('--service='))?.split('=')[1];

  const findings = [];
  for (const root of SCAN_ROOTS) {
    const dir = join(ROOT, root);
    try { await stat(dir); } catch { continue; }
    const files = await walk(dir);
    for (const f of files) {
      if (argService && !f.includes(argService)) continue;
      const text = await readFile(f, 'utf8');
      for (const usage of scanFile(text, f)) {
        const meta = schemaModels.get(usage.model);
        if (!meta) continue; // unknown model — ignore (could be a wrong client)
        const unindexed = usage.fields.filter((field) => !meta.indexedFields.has(field));
        // Strip out always-OK fields
        const filtered = unindexed.filter((f) => !['isDeleted', 'deletedAt'].includes(f));
        if (filtered.length > 0) {
          findings.push({ ...usage, model: meta.name, unindexed: filtered });
        }
      }
    }
  }

  if (isJson) {
    console.log(JSON.stringify({ findings }, null, 2));
    process.exit(findings.length === 0 ? 0 : 1);
    return;
  }

  console.log(`Query Performance Static Analyzer\n`);
  if (findings.length === 0) {
    console.log('✓ no uncovered where-clauses');
    process.exit(0);
  }

  // Group by model+field for ranking
  const byModelField = new Map();
  for (const f of findings) {
    for (const field of f.unindexed) {
      const key = `${f.model}.${field}`;
      const bucket = byModelField.get(key) ?? { model: f.model, field, count: 0, samples: [] };
      bucket.count += 1;
      if (bucket.samples.length < 3) bucket.samples.push(`${f.file}:${f.line}`);
      byModelField.set(key, bucket);
    }
  }
  const ranked = [...byModelField.values()].sort((a, b) => b.count - a.count);

  console.log(`Top uncovered fields (add @@index in schema.prisma):`);
  for (const r of ranked.slice(0, 25)) {
    console.log(`  ${r.model}.${r.field}   — ${r.count} call sites   e.g.  ${r.samples[0]}`);
  }
  console.log(`\nTotal call sites with uncovered fields: ${findings.length}`);
  console.log(`Suppression: this is advisory. For composite-index leading-column queries, the analyzer is conservative and may over-report.`);

  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
