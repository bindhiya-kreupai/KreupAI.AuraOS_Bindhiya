/**
 * AST fix for TS18046 'X is of type unknown' and TS2345 derived from
 * untyped catch clauses.
 *
 * TS 4.4+ defaults catch params to `unknown`. Code written before that
 * change does `catch (error) { ... error.message ... }` which breaks.
 * Annotating the catch param `: any` is the idiomatic escape for code
 * that doesn't narrow.
 *
 * Run:
 *   npx tsx scripts/ts-fix-catch-unknown.ts        # apply
 *   npx tsx scripts/ts-fix-catch-unknown.ts --dry  # report only
 */

import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

let fixed = 0;
const skipped: string[] = [];

for (const sf of project.getSourceFiles()) {
  if (!sf.getFilePath().includes('/apps/web/src/')) continue;
  const clauses = sf.getDescendantsOfKind(SyntaxKind.CatchClause);
  for (const c of clauses) {
    const decl = c.getVariableDeclaration();
    if (!decl) continue;
    if (decl.getTypeNode()) {
      skipped.push(`${sf.getFilePath()}: catch already typed`);
      continue;
    }
    if (!DRY) {
      decl.setType('any');
    }
    fixed++;
  }
}

if (!DRY) project.saveSync();

console.log(`\nAnnotated catch params: ${fixed}`);
console.log(`Skipped (already typed): ${skipped.length}`);
