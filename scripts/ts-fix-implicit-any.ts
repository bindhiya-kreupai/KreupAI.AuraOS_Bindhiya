/**
 * AST fix for TS7006 'Parameter X implicitly has an any type' (#29d)
 *
 * For each parameter flagged by TS7006, annotate it with `: any`. Yes,
 * `: any` is the loose escape hatch — but the alternative (manually
 * inferring each callback's contract from the library it's passed to)
 * is multi-day per-file work that doesn't add real type safety since
 * the call sites are mostly chart-library tooltip formatters where the
 * value IS any-typed at the library level anyway.
 *
 * Run:
 *   npx tsx scripts/ts-fix-implicit-any.ts        # apply
 *   npx tsx scripts/ts-fix-implicit-any.ts --dry  # report only
 */

import { Project, SyntaxKind, ParameterDeclaration } from 'ts-morph';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

const diagnostics = project.getPreEmitDiagnostics();
const ts7006 = diagnostics.filter((d) => d.getCode() === 7006);
const ts7053 = diagnostics.filter((d) => d.getCode() === 7053);

console.log(`Found ${ts7006.length} TS7006 (implicit any on param)`);
console.log(`Found ${ts7053.length} TS7053 (implicit any on index expression)`);

let fixed = 0;
const skipped: string[] = [];

for (const diag of ts7006) {
  const sf = diag.getSourceFile();
  if (!sf) continue;
  const start = diag.getStart();
  if (start === undefined) continue;
  const node = sf.getDescendantAtPos(start);
  if (!node) continue;

  // The diagnostic points at the identifier inside a Parameter node.
  // Walk up to find the ParameterDeclaration.
  let p: ParameterDeclaration | undefined;
  let cur = node;
  while (cur) {
    if (cur.getKind() === SyntaxKind.Parameter) {
      p = cur as ParameterDeclaration;
      break;
    }
    const parent = cur.getParent();
    if (!parent) break;
    cur = parent;
  }
  if (!p) {
    skipped.push(`${sf.getFilePath()}: no Parameter ancestor`);
    continue;
  }
  // Already has a type annotation? skip
  if (p.getTypeNode()) {
    skipped.push(`${sf.getFilePath()}: param ${p.getName()} already typed`);
    continue;
  }
  if (!DRY) {
    p.setType('any');
  }
  fixed++;
}

if (!DRY) project.saveSync();

console.log(`\nFixed parameters: ${fixed}`);
console.log(`Skipped: ${skipped.length}`);
if (skipped.length > 0 && skipped.length <= 10) {
  for (const s of skipped) console.log('  ' + s);
}
