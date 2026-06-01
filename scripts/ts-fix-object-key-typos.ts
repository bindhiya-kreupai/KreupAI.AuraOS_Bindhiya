/**
 * AST fix for TS2561 'Object literal may only specify known properties,
 * but X does not exist ... Did you mean Y?' (#29c)
 *
 * Same approach as ts-fix-did-you-mean.ts but for object-literal property
 * keys (Prisma where/data, Zod schema bodies, etc.).
 *
 * WARNING: Do NOT apply without per-file review. Empirically the TS2561
 * "Did you mean" suggestions are unreliable for Prisma where/data objects —
 * the compiler often suggests the closest field by string distance even
 * when the real fix is a shape change. A blind run on this repo turned
 * 2969 errors into 3015. Use --dry, eyeball the proposed changes, and
 * apply manually.
 *
 * Run:
 *   npx tsx scripts/ts-fix-object-key-typos.ts --dry  # report only (preferred)
 *   npx tsx scripts/ts-fix-object-key-typos.ts        # apply (dangerous)
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

const ts2561 = project.getPreEmitDiagnostics().filter((d) => d.getCode() === 2561);
console.log(`Found ${ts2561.length} TS2561 diagnostics`);

let fixed = 0;
const skipped: string[] = [];

for (const diag of ts2561) {
  const sf = diag.getSourceFile();
  if (!sf) continue;
  const start = diag.getStart();
  if (start === undefined) continue;

  const msgText = diag.getMessageText();
  const msg = typeof msgText === 'string' ? msgText : msgText.getMessageText();
  const m = /but '([^']+)' does not exist .* Did you mean to write '([^']+)'/.exec(msg);
  if (!m) {
    skipped.push(`${sf.getFilePath()}: unparseable`);
    continue;
  }
  const wrong = m[1];
  const right = m[2];

  const node = sf.getDescendantAtPos(start);
  if (!node) {
    skipped.push(`${sf.getFilePath()}: no node`);
    continue;
  }

  // Walk to find an ancestor PropertyAssignment whose name matches `wrong`
  let cur: Node | undefined = node;
  let target: Node | undefined;
  while (cur) {
    if (cur.getKind() === SyntaxKind.PropertyAssignment) {
      const pa = cur.asKindOrThrow(SyntaxKind.PropertyAssignment);
      if (pa.getName() === wrong) {
        target = pa.getNameNode();
        break;
      }
    }
    // Also handle shorthand property assignments
    if (cur.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
      const sp = cur.asKindOrThrow(SyntaxKind.ShorthandPropertyAssignment);
      if (sp.getName() === wrong) {
        target = sp.getNameNode();
        break;
      }
    }
    const parent: Node | undefined = cur.getParent();
    if (!parent) break;
    cur = parent;
  }

  if (!target) {
    skipped.push(`${sf.getFilePath()}: no PropertyAssignment for ${wrong}`);
    continue;
  }

  if (!DRY) {
    target.replaceWithText(right);
  }
  fixed++;
}

if (!DRY) project.saveSync();

console.log(`\nFixed property keys: ${fixed}`);
console.log(`Skipped: ${skipped.length}`);
if (skipped.length > 0 && skipped.length <= 10) {
  for (const s of skipped) console.log('  ' + s);
}
