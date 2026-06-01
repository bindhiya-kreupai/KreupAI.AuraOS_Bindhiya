/**
 * AST fix for TS2551 'Did you mean X' (#29 follow-on)
 *
 * TS2551 errors include a suggested correction in the diagnostic message
 * itself. We extract the suggestion and apply it via ts-morph rename of
 * the identifier at the error location.
 *
 * Conservative: skips cases where the identifier at the error site is
 * inside a string literal, comment, or property KEY (it should always be
 * a property access or method call, but we double-check).
 *
 * Run:
 *   npx tsx scripts/ts-fix-did-you-mean.ts        # apply
 *   npx tsx scripts/ts-fix-did-you-mean.ts --dry  # report only
 */

import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

const diagnostics = project.getPreEmitDiagnostics();
const ts2551 = diagnostics.filter((d) => d.getCode() === 2551);

console.log(`Found ${ts2551.length} TS2551 diagnostics`);

let fixed = 0;
const skipped: string[] = [];

for (const diag of ts2551) {
  const sf = diag.getSourceFile();
  if (!sf) continue;
  const start = diag.getStart();
  if (start === undefined) continue;

  const msgText = diag.getMessageText();
  const msg = typeof msgText === 'string' ? msgText : msgText.getMessageText();
  // "Property 'foo' does not exist on type ... Did you mean 'bar'?"
  const m = /Property '([^']+)' does not exist .* Did you mean '([^']+)'/.exec(msg);
  if (!m) {
    skipped.push(`${sf.getFilePath()}: unparseable message`);
    continue;
  }
  const wrong = m[1];
  const right = m[2];

  const node = sf.getDescendantAtPos(start);
  if (!node) {
    skipped.push(`${sf.getFilePath()}: no node at error position`);
    continue;
  }
  // The error highlights the identifier. It should be the `name` of a
  // PropertyAccessExpression.
  if (node.getKind() !== SyntaxKind.Identifier) {
    skipped.push(`${sf.getFilePath()}: not an Identifier at error pos`);
    continue;
  }
  if (node.getText() !== wrong) {
    skipped.push(`${sf.getFilePath()}: text mismatch '${node.getText()}' vs '${wrong}'`);
    continue;
  }
  const parent = node.getParent();
  if (!parent || parent.getKind() !== SyntaxKind.PropertyAccessExpression) {
    skipped.push(`${sf.getFilePath()}: parent is not PropertyAccess`);
    continue;
  }

  if (!DRY) {
    node.replaceWithText(right);
  }
  fixed++;
}

if (!DRY) project.saveSync();

console.log(`\nFixed identifiers: ${fixed}`);
console.log(`Skipped: ${skipped.length}`);
if (skipped.length > 0 && skipped.length <= 10) {
  for (const s of skipped) console.log('  ' + s);
}
