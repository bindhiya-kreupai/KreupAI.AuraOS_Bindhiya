/**
 * AST fix for TS2304 'Cannot find name X' (#29a follow-on)
 *
 * For each TS2304 error, find a sibling file in the same directory (or
 * the directory's index.ts / types.ts) that exports X. If found, add X
 * to the existing `import` from that file, or create a new import.
 *
 * Conservative: only handles types/interfaces/classes exported from
 * sibling `types.ts` files (the most common pattern in this repo).
 * Skips errors where no sibling export is found — those need manual
 * attention.
 *
 * Run:
 *   npx tsx scripts/ts-fix-missing-imports.ts        # apply
 *   npx tsx scripts/ts-fix-missing-imports.ts --dry  # report only
 */

import { Project, SyntaxKind, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'apps/web/tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

// Index every exported type/interface/class name → list of source files
const exportIndex = new Map<string, Set<string>>();

for (const sf of project.getSourceFiles('apps/web/src/**/*.{ts,tsx}')) {
  for (const node of sf.getDescendantsOfKind(SyntaxKind.InterfaceDeclaration)) {
    const isExported = node.getModifiers().some((m) => m.getKind() === SyntaxKind.ExportKeyword);
    if (!isExported) continue;
    const name = node.getName();
    const set = exportIndex.get(name) ?? new Set<string>();
    set.add(sf.getFilePath());
    exportIndex.set(name, set);
  }
  for (const node of sf.getDescendantsOfKind(SyntaxKind.TypeAliasDeclaration)) {
    const isExported = node.getModifiers().some((m) => m.getKind() === SyntaxKind.ExportKeyword);
    if (!isExported) continue;
    const name = node.getName();
    const set = exportIndex.get(name) ?? new Set<string>();
    set.add(sf.getFilePath());
    exportIndex.set(name, set);
  }
  for (const node of sf.getDescendantsOfKind(SyntaxKind.ClassDeclaration)) {
    const isExported = node.getModifiers().some((m) => m.getKind() === SyntaxKind.ExportKeyword);
    const name = node.getName();
    if (!isExported || !name) continue;
    const set = exportIndex.get(name) ?? new Set<string>();
    set.add(sf.getFilePath());
    exportIndex.set(name, set);
  }
  // Also include named const/function exports — they're sometimes missing too
  for (const node of sf.getDescendantsOfKind(SyntaxKind.VariableStatement)) {
    const isExported = node.getModifiers().some((m) => m.getKind() === SyntaxKind.ExportKeyword);
    if (!isExported) continue;
    for (const d of node.getDeclarationList().getDeclarations()) {
      const name = d.getName();
      const set = exportIndex.get(name) ?? new Set<string>();
      set.add(sf.getFilePath());
      exportIndex.set(name, set);
    }
  }
  for (const node of sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)) {
    const isExported = node.getModifiers().some((m) => m.getKind() === SyntaxKind.ExportKeyword);
    const name = node.getName();
    if (!isExported || !name) continue;
    const set = exportIndex.get(name) ?? new Set<string>();
    set.add(sf.getFilePath());
    exportIndex.set(name, set);
  }
}

// Use Project's getPreEmitDiagnostics to find TS2304s
const diagnostics = project.getPreEmitDiagnostics();
const ts2304 = diagnostics.filter((d) => d.getCode() === 2304);
console.log(`Found ${ts2304.length} TS2304 diagnostics`);

// Group by (sourceFile, missingName)
interface Missing {
  fileSf: SourceFile;
  name: string;
}
const missingByFile = new Map<string, Missing[]>();

for (const diag of ts2304) {
  const sf = diag.getSourceFile();
  if (!sf) continue;
  const msgText = diag.getMessageText();
  const msg = typeof msgText === 'string' ? msgText : msgText.getMessageText();
  const m = /Cannot find name '([^']+)'/.exec(msg);
  if (!m) continue;
  const name = m[1];
  const key = sf.getFilePath();
  const arr = missingByFile.get(key) ?? [];
  arr.push({ fileSf: sf, name });
  missingByFile.set(key, arr);
}

let importsAddedPerFile = 0;
let missingResolved = 0;
const ambiguous: string[] = [];
const unresolved: string[] = [];

for (const [filePath, missings] of missingByFile) {
  const sf = missings[0].fileSf;
  const fileDir = path.dirname(filePath);
  const uniqueNames = new Set(missings.map((x) => x.name));

  // For each missing name, find a sibling file that exports it.
  // Prefer the same directory; fall back to nearest ancestor; cap at 4 levels.
  const resolutions = new Map<string, string>(); // name → relative module path

  for (const name of uniqueNames) {
    const candidates = exportIndex.get(name);
    if (!candidates || candidates.size === 0) {
      unresolved.push(`${filePath}: ${name}`);
      continue;
    }
    // Prefer a file in the same directory
    let chosen: string | undefined;
    for (const cand of candidates) {
      if (path.dirname(cand) === fileDir) {
        chosen = cand;
        break;
      }
    }
    // Next: ancestor directories
    if (!chosen) {
      let dir = fileDir;
      for (let i = 0; i < 4 && !chosen; i++) {
        for (const cand of candidates) {
          if (path.dirname(cand) === dir) {
            chosen = cand;
            break;
          }
        }
        dir = path.dirname(dir);
      }
    }
    if (!chosen) {
      // Last resort: pick the first candidate that matches by `types.ts` or
      // `index.ts` filename (most likely barrel)
      for (const cand of candidates) {
        const base = path.basename(cand);
        if (base === 'types.ts' || base === 'index.ts') {
          chosen = cand;
          break;
        }
      }
    }
    if (!chosen) {
      if (candidates.size > 1) ambiguous.push(`${filePath}: ${name} (${candidates.size} candidates)`);
      else chosen = [...candidates][0];
    }
    if (chosen) resolutions.set(name, chosen);
  }

  if (resolutions.size === 0) continue;

  // Group by target module path so we can add one import line per module
  const grouped = new Map<string, string[]>();
  for (const [name, target] of resolutions) {
    const arr = grouped.get(target) ?? [];
    arr.push(name);
    grouped.set(target, arr);
  }

  for (const [targetPath, names] of grouped) {
    // Compute relative module specifier from sf to target. Strip .ts/.tsx extension.
    let relPath = path.relative(fileDir, targetPath);
    relPath = relPath.replace(/\.(ts|tsx)$/, '');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    // If it's `./types`, leave as is. If it's `./types/index`, simplify to `./types`.
    relPath = relPath.replace(/\/index$/, '');

    // Check if sf already imports from this module
    const existingImport = sf
      .getImportDeclarations()
      .find((imp) => imp.getModuleSpecifierValue() === relPath);

    if (existingImport) {
      // Add the missing names to the existing import's named bindings
      const existingNames = new Set(existingImport.getNamedImports().map((n) => n.getName()));
      const toAdd = names.filter((n) => !existingNames.has(n));
      if (toAdd.length === 0) continue;
      if (!DRY) {
        for (const n of toAdd) existingImport.addNamedImport(n);
      }
      missingResolved += toAdd.length;
    } else {
      // Create a new import declaration
      if (!DRY) {
        sf.addImportDeclaration({
          moduleSpecifier: relPath,
          namedImports: names.map((n) => ({ name: n })),
        });
      }
      missingResolved += names.length;
      importsAddedPerFile++;
    }
  }
}

if (!DRY) project.saveSync();

console.log('');
console.log(`Files with TS2304: ${missingByFile.size}`);
console.log(`Missing names resolved: ${missingResolved}`);
console.log(`New import declarations added: ${importsAddedPerFile}`);
console.log(`Unresolved (no export found): ${unresolved.length}`);
console.log(`Ambiguous (multiple candidates, no obvious pick): ${ambiguous.length}`);
if (unresolved.length > 0 && unresolved.length <= 30) {
  console.log('\nUnresolved:');
  for (const u of unresolved) console.log('  ' + u);
}
