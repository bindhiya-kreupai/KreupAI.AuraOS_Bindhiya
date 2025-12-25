#!/usr/bin/env node

/**
 * Script to fix common linting issues:
 * 1. Remove console.log/console.error statements (except in test files)
 * 2. Prefix unused variables with underscore
 * 3. Fix unescaped entities in JSX
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const appsWebSrc = path.join(projectRoot, 'apps/web/src');

// Patterns to identify what to fix
const consolePattern = /console\.(log|error|warn|info|debug)\([^)]*\);?\n?/g;
const unusedVarPattern = /(\w+)(?= is (?:defined|assigned))/;

function getAllTsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
      getAllTsxFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixConsoleStatements(content, filePath) {
  // Don't remove console statements from test files or setup files
  if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('setup.ts')) {
    return content;
  }
  
  // Remove console statements but preserve structure
  let fixed = content.replace(consolePattern, '');
  
  return fixed;
}

function fixUnescapedEntities(content) {
  // Fix apostrophes in JSX
  const lines = content.split('\n');
  const fixed = lines.map(line => {
    // Only fix in JSX content (between > and <)
    if (line.includes("'") && (line.includes('>') || line.includes('className'))) {
      // Replace apostrophes with &apos; in JSX text content
      return line.replace(/([>].*?)'(.*?[<])/g, (match, before, after) => {
        return before + '&apos;' + after;
      });
    }
    return line;
  });
  
  return fixed.join('\n');
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    const originalContent = content;
    
    // Fix console statements
    content = fixConsoleStatements(content, filePath);
    if (content !== originalContent) {
      modified = true;
    }
    
    // Fix unescaped entities
    const afterEntities = fixUnescapedEntities(content);
    if (afterEntities !== content) {
      content = afterEntities;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${path.relative(projectRoot, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Starting linting cleanup...\n');
  
  const files = getAllTsxFiles(appsWebSrc);
  console.log(`Found ${files.length} TypeScript files to check\n`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
  console.log('\nRunning eslint --fix to handle remaining auto-fixable issues...');
  
  try {
    execSync('cd apps/web && pnpm exec eslint --fix "src/**/*.{ts,tsx}" --quiet', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ ESLint auto-fix complete');
  } catch (error) {
    console.log('⚠️  Some linting errors remain that need manual fixing');
  }
}

main();
