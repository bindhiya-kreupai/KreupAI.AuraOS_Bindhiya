/**
 * AST-aware fix for catch-clause identifier mismatches (#29a)
 *
 * Two problems this fixes:
 *   1. `} catch (_error) { ... error.message ... }`
 *      Catch param is `_error` (prefix = unused) but body uses bare `error`.
 *      → rename param to drop the underscore.
 *   2. `} catch (error) { ... err.message ... }` or
 *      `} catch (err) { ... error.message ... }`
 *      Cross-name mismatches from earlier refactors.
 *      → rename body identifiers to match the catch param.
 *
 * Both transforms use ts-morph to walk only IDENTIFIER nodes — string
 * literals, property keys, and type references are not touched.
 *
 * Run:
 *   npx tsx scripts/ts-fix-catch-clauses.ts        # apply
 *   npx tsx scripts/ts-fix-catch-clauses.ts --dry  # report only
 */

import { Project, SyntaxKind, Identifier } from 'ts-morph';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

const DRY = process.argv.includes('--dry');

interface Stat {
  file: string;
  catchClauses: number;
  paramRenames: number;
  bodyIdentifierRenames: number;
}

const stats: Stat[] = [];

/**
 * For a given catch-clause, decide whether the catch parameter name and
 * the catch body's identifier usage are consistent, and reconcile.
 *
 * Rules:
 *   - If catch param is _X and body uses bare X as IDENTIFIER (not property,
 *     not in string): the underscore was wrong — rename param to X.
 *   - If catch param is X and body uses Y (where Y ∈ {err, error, _err, _error}
 *     ∖ {X}) as IDENTIFIER: rename body Ys to X.
 */
function normaliseCatch(
  cc: ReturnType<typeof project.getSourceFiles>[0]['getStatements'] extends () => unknown
    ? never
    : never
): never {
  throw new Error('placeholder for type-juggling');
}

// Walk all source files
const ALL_VARIANTS = new Set(['err', 'error', '_err', '_error']);

for (const sf of project.getSourceFiles('apps/web/src/**/*.{ts,tsx}')) {
  let catchCount = 0;
  let paramRenames = 0;
  let bodyRenames = 0;

  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.CatchClause) return;
    catchCount++;

    const cc = node.asKindOrThrow(SyntaxKind.CatchClause);
    const decl = cc.getVariableDeclaration();
    if (!decl) return;
    const paramName = decl.getName();
    if (!ALL_VARIANTS.has(paramName)) return;

    // Collect identifier references inside the catch block that match any
    // variant. ts-morph's getDescendantsOfKind walks only AST nodes, so
    // strings and property keys are correctly excluded.
    const block = cc.getBlock();
    const idents: Identifier[] = [];
    block.getDescendantsOfKind(SyntaxKind.Identifier).forEach((id) => {
      const text = id.getText();
      if (!ALL_VARIANTS.has(text)) return;
      // Skip property names — `obj.error` has `error` as an Identifier but
      // it's the right-hand side of a PropertyAccessExpression, NOT a free
      // variable reference. ts-morph: parent kind is PropertyAccessExpression
      // AND this identifier is the `name` of that access.
      const parent = id.getParent();
      if (parent && parent.getKind() === SyntaxKind.PropertyAccessExpression) {
        const pae = parent.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        if (pae.getNameNode() === id) return; // it's `something.error` (property)
      }
      // Skip property keys in object literals — `{ error: ... }` has
      // `error` as Identifier inside a PropertyAssignment as the name.
      if (parent && parent.getKind() === SyntaxKind.PropertyAssignment) {
        const pa = parent.asKindOrThrow(SyntaxKind.PropertyAssignment);
        if (pa.getNameNode() === id) return;
      }
      // Skip type references (rare for these names but possible)
      if (parent && parent.getKind() === SyntaxKind.TypeReference) return;
      // Skip shorthand-property shorthands like `{ error }` — keep these as
      // they ARE references that need to align with the param name. But
      // ShorthandPropertyAssignment is fine; it's still a reference.

      idents.push(id);
    });

    if (idents.length === 0) {
      // Param exists but body never references it — that's fine.
      // If the param is unprefixed (no leading `_`) we COULD rename it to
      // `_X` for the lint rule, but that's a #29e concern, not #29a.
      return;
    }

    // Decide: should we rename the param to match the body, or the body
    // to match the param?
    const bodyIdentifierNames = new Set(idents.map((i) => i.getText()));

    // Case 1: param is _X and body has bare X (no other variants present).
    //   The underscore was wrong — rename param to X.
    if (paramName.startsWith('_')) {
      const unprefixed = paramName.slice(1);
      if (bodyIdentifierNames.has(unprefixed) && bodyIdentifierNames.size === 1) {
        // Rename param to the unprefixed form by renaming the declaration.
        // ts-morph's rename() updates all references in scope; since the
        // body identifiers are already named `unprefixed`, those are
        // unaffected, but the declaration text changes from `_X` to `X`.
        if (!DRY) decl.rename(unprefixed);
        paramRenames++;
        return;
      }
    }

    // Case 2: body has identifiers that don't match the param name.
    //   Rename body identifiers to match.
    for (const id of idents) {
      const text = id.getText();
      if (text !== paramName) {
        if (!DRY) id.replaceWithText(paramName);
        bodyRenames++;
      }
    }
  });

  if (paramRenames > 0 || bodyRenames > 0) {
    stats.push({
      file: sf.getFilePath().replace(ROOT + '/', ''),
      catchClauses: catchCount,
      paramRenames,
      bodyIdentifierRenames: bodyRenames,
    });
  }
}

if (!DRY) {
  project.saveSync();
}

console.log(`Files changed: ${stats.length}`);
console.log(
  `Catch-param renames: ${stats.reduce((s, x) => s + x.paramRenames, 0)}`
);
console.log(
  `Body identifier renames: ${stats.reduce((s, x) => s + x.bodyIdentifierRenames, 0)}`
);
if (stats.length > 0 && stats.length <= 20) {
  for (const s of stats) {
    console.log(
      `  ${s.file}: param=${s.paramRenames} body=${s.bodyIdentifierRenames}`
    );
  }
}
