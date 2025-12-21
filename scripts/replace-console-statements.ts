#!/usr/bin/env ts-node

/**
 * Console Statement Replacement Script
 *
 * This script automatically replaces console.log/error/warn/info statements
 * with proper structured logging using the logger from @/lib/logger
 *
 * Usage:
 *   npx ts-node scripts/replace-console-statements.ts [--dry-run] [--path <path>]
 *
 * Options:
 *   --dry-run    Show what would be changed without making actual changes
 *   --path       Specify a specific path to process (default: apps/web/src)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ReplacementStats {
  filesProcessed: number;
  filesModified: number;
  totalReplacements: number;
  consoleLog: number;
  consoleError: number;
  consoleWarn: number;
  consoleInfo: number;
  consoleDebug: number;
}

const stats: ReplacementStats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0,
  consoleLog: 0,
  consoleError: 0,
  consoleWarn: 0,
  consoleInfo: 0,
  consoleDebug: 0,
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const pathIndex = args.indexOf('--path');
const targetPath = pathIndex >= 0 ? args[pathIndex + 1] : 'apps/web/src';

// Files/directories to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /scripts\/replace-console-statements\.ts/, // Skip this script itself
];

// Only process these file extensions
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string): boolean {
  // Check if file matches skip patterns
  if (SKIP_PATTERNS.some(pattern => pattern.test(filePath))) {
    return false;
  }

  // Check if file has valid extension
  const ext = path.extname(filePath);
  return VALID_EXTENSIONS.includes(ext);
}

/**
 * Check if file already imports logger
 */
function hasLoggerImport(content: string): boolean {
  return /import\s+.*\{\s*logger\s*\}.*from\s+['"]@\/lib\/logger['"]/.test(content);
}

/**
 * Add logger import to file if not present
 */
function addLoggerImport(content: string): string {
  if (hasLoggerImport(content)) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  // Add logger import after last import
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/logger';");
  } else {
    // No imports found, add at the beginning
    lines.unshift("import { logger } from '@/lib/logger';");
  }

  return lines.join('\n');
}

/**
 * Replace console statements with logger calls
 */
function replaceConsoleStatements(content: string): { content: string; count: number; details: { [key: string]: number } } {
  let newContent = content;
  let replacementCount = 0;
  const details = {
    consoleLog: 0,
    consoleError: 0,
    consoleWarn: 0,
    consoleInfo: 0,
    consoleDebug: 0,
  };

  // Replace console.error -> logger.error
  const errorMatches = newContent.match(/console\.error\(/g);
  if (errorMatches) {
    details.consoleError = errorMatches.length;
    replacementCount += errorMatches.length;
    newContent = newContent.replace(/console\.error\(/g, 'logger.error(');
  }

  // Replace console.warn -> logger.warn
  const warnMatches = newContent.match(/console\.warn\(/g);
  if (warnMatches) {
    details.consoleWarn = warnMatches.length;
    replacementCount += warnMatches.length;
    newContent = newContent.replace(/console\.warn\(/g, 'logger.warn(');
  }

  // Replace console.info -> logger.info
  const infoMatches = newContent.match(/console\.info\(/g);
  if (infoMatches) {
    details.consoleInfo = infoMatches.length;
    replacementCount += infoMatches.length;
    newContent = newContent.replace(/console\.info\(/g, 'logger.info(');
  }

  // Replace console.log -> logger.info (map to info level)
  const logMatches = newContent.match(/console\.log\(/g);
  if (logMatches) {
    details.consoleLog = logMatches.length;
    replacementCount += logMatches.length;
    newContent = newContent.replace(/console\.log\(/g, 'logger.info(');
  }

  // Replace console.debug -> logger.debug
  const debugMatches = newContent.match(/console\.debug\(/g);
  if (debugMatches) {
    details.consoleDebug = debugMatches.length;
    replacementCount += debugMatches.length;
    newContent = newContent.replace(/console\.debug\(/g, 'logger.debug(');
  }

  return { content: newContent, count: replacementCount, details };
}

/**
 * Process a single file
 */
function processFile(filePath: string): void {
  stats.filesProcessed++;

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file has console statements
    if (!/console\.(log|error|warn|info|debug)\(/.test(content)) {
      return;
    }

    // Replace console statements
    const { content: replacedContent, count, details } = replaceConsoleStatements(content);

    if (count === 0) {
      return;
    }

    // Add logger import if replacements were made
    let finalContent = addLoggerImport(replacedContent);

    // Update stats
    stats.filesModified++;
    stats.totalReplacements += count;
    stats.consoleLog += details.consoleLog;
    stats.consoleError += details.consoleError;
    stats.consoleWarn += details.consoleWarn;
    stats.consoleInfo += details.consoleInfo;
    stats.consoleDebug += details.consoleDebug;

    if (isDryRun) {
      console.log(`[DRY RUN] Would modify: ${filePath}`);
      console.log(`  - console.log: ${details.consoleLog}`);
      console.log(`  - console.error: ${details.consoleError}`);
      console.log(`  - console.warn: ${details.consoleWarn}`);
      console.log(`  - console.info: ${details.consoleInfo}`);
      console.log(`  - console.debug: ${details.consoleDebug}`);
    } else {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`✅ Modified: ${filePath} (${count} replacements)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath: string): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!SKIP_PATTERNS.some(pattern => pattern.test(fullPath))) {
          processDirectory(fullPath);
        }
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔧 Console Statement Replacement Script');
  console.log('========================================\n');

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  console.log(`📂 Target path: ${targetPath}\n`);

  const startTime = Date.now();
  const fullPath = path.resolve(process.cwd(), targetPath);

  // Check if path exists
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: Path does not exist: ${fullPath}`);
    process.exit(1);
  }

  // Process the path
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    processDirectory(fullPath);
  } else if (stat.isFile()) {
    processFile(fullPath);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n========================================');
  console.log('📊 Summary');
  console.log('========================================\n');
  console.log(`Files processed:     ${stats.filesProcessed}`);
  console.log(`Files modified:      ${stats.filesModified}`);
  console.log(`Total replacements:  ${stats.totalReplacements}`);
  console.log('');
  console.log('Breakdown:');
  console.log(`  - console.log:     ${stats.consoleLog} → logger.info`);
  console.log(`  - console.error:   ${stats.consoleError} → logger.error`);
  console.log(`  - console.warn:    ${stats.consoleWarn} → logger.warn`);
  console.log(`  - console.info:    ${stats.consoleInfo} → logger.info`);
  console.log(`  - console.debug:   ${stats.consoleDebug} → logger.debug`);
  console.log('');
  console.log(`⏱️  Completed in ${duration}s`);

  if (isDryRun) {
    console.log('\n⚠️  This was a DRY RUN. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ All replacements complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run ESLint to verify changes: pnpm lint');
    console.log('   2. Run tests: pnpm test');
    console.log('   3. Review and commit changes');
  }
}

// Run the script
main();
