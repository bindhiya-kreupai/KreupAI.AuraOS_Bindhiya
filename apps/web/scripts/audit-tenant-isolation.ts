#!/usr/bin/env ts-node
/**
 * Tenant Isolation Audit Script
 *
 * Scans API routes to identify potential tenant isolation issues
 *
 * Usage:
 *   pnpm audit:tenant-isolation
 */

import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  file: string;
  line: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  message: string;
  code?: string;
}

const issues: Issue[] = [];

// Patterns that indicate potential issues
const PATTERNS = {
  // Database queries without tenant filter
  unsafeFindMany: /prisma\.\w+\.findMany\(\s*\{(?![^}]*tenantId)/g,
  unsafeFindFirst: /prisma\.\w+\.findFirst\(\s*\{(?![^}]*tenantId)/g,
  unsafeUpdate: /prisma\.\w+\.update\(\s*\{(?![^}]*where.*tenantId)/g,
  unsafeUpdateMany: /prisma\.\w+\.updateMany\(\s*\{(?![^}]*where.*tenantId)/g,
  unsafeDelete: /prisma\.\w+\.delete\(\s*\{(?![^}]*where.*tenantId)/g,
  unsafeDeleteMany: /prisma\.\w+\.deleteMany\(\s*\{(?![^}]*where.*tenantId)/g,

  // Missing validation
  noValidation: /findUnique\([^)]+\)(?![^;]*validateTenantAccess)/g,

  // Trusting client tenant ID
  clientTenantId: /tenantId\s*:\s*(body\.tenantId|data\.tenantId|input\.tenantId)/g,
};

function scanFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for unsafe queries
  Object.entries(PATTERNS).forEach(([patternName, pattern]) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];

      // Skip if commented out
      if (line.trim().startsWith('//')) {
        continue;
      }

      let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      let message = '';

      switch (patternName) {
        case 'unsafeFindMany':
          severity = 'HIGH';
          message = 'findMany() without tenant filter - may return cross-tenant data';
          break;
        case 'unsafeFindFirst':
          severity = 'HIGH';
          message = 'findFirst() without tenant filter - may return cross-tenant data';
          break;
        case 'unsafeUpdate':
          severity = 'HIGH';
          message = 'update() without tenant check - may modify cross-tenant data';
          break;
        case 'unsafeUpdateMany':
          severity = 'HIGH';
          message = 'updateMany() without tenant filter - may modify cross-tenant data';
          break;
        case 'unsafeDelete':
          severity = 'HIGH';
          message = 'delete() without tenant check - may delete cross-tenant data';
          break;
        case 'unsafeDeleteMany':
          severity = 'HIGH';
          message = 'deleteMany() without tenant filter - may delete cross-tenant data';
          break;
        case 'noValidation':
          severity = 'MEDIUM';
          message = 'findUnique() without validateTenantAccess() - should validate before returning';
          break;
        case 'clientTenantId':
          severity = 'HIGH';
          message = 'Using client-provided tenant ID - must use authenticated user\'s tenant ID';
          break;
      }

      issues.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNumber,
        severity,
        type: patternName,
        message,
        code: line.trim(),
      });
    }
  });
}

function scanDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      // Only scan API routes
      if (fullPath.includes('/api/')) {
        scanFile(fullPath);
      }
    }
  }
}

function generateReport(): void {
  console.log('\n🔍 Tenant Isolation Audit Report\n');
  console.log('='.repeat(80));

  if (issues.length === 0) {
    console.log('\n✅ No tenant isolation issues found!\n');
    return;
  }

  // Group by severity
  const highSeverity = issues.filter((i) => i.severity === 'HIGH');
  const mediumSeverity = issues.filter((i) => i.severity === 'MEDIUM');
  const lowSeverity = issues.filter((i) => i.severity === 'LOW');

  console.log(`\n📊 Summary:`);
  console.log(`   Total Issues: ${issues.length}`);
  console.log(`   🔴 High:   ${highSeverity.length}`);
  console.log(`   🟡 Medium: ${mediumSeverity.length}`);
  console.log(`   🟢 Low:    ${lowSeverity.length}`);
  console.log('');

  // Print issues by severity
  if (highSeverity.length > 0) {
    console.log('\n🔴 HIGH SEVERITY ISSUES (IMMEDIATE ACTION REQUIRED)\n');
    printIssues(highSeverity);
  }

  if (mediumSeverity.length > 0) {
    console.log('\n🟡 MEDIUM SEVERITY ISSUES\n');
    printIssues(mediumSeverity);
  }

  if (lowSeverity.length > 0) {
    console.log('\n🟢 LOW SEVERITY ISSUES\n');
    printIssues(lowSeverity);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Recommendations:\n');
  console.log('   1. Review all HIGH severity issues immediately');
  console.log('   2. Add tenant filters to all database queries');
  console.log('   3. Validate tenant access before returning/modifying resources');
  console.log('   4. Never trust client-provided tenant IDs');
  console.log('   5. Use addTenantFilter() helper for consistent filtering');
  console.log('   6. Run integration tests to verify tenant isolation');
  console.log('\n   See: src/lib/middleware/TENANT_ISOLATION.md for guidance\n');
}

function printIssues(issueList: Issue[]): void {
  issueList.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    if (issue.code) {
      console.log(`   Code: ${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}`);
    }
    console.log('');
  });
}

// Main execution
console.log('🚀 Starting tenant isolation audit...\n');

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

if (!fs.existsSync(apiDir)) {
  console.error('❌ Error: API directory not found:', apiDir);
  process.exit(1);
}

scanDirectory(apiDir);
generateReport();

// Exit with error code if high severity issues found
const highSeverityCount = issues.filter((i) => i.severity === 'HIGH').length;
if (highSeverityCount > 0) {
  console.log(`\n❌ Audit failed: ${highSeverityCount} high severity issue(s) found\n`);
  process.exit(1);
} else {
  console.log('\n✅ Audit passed!\n');
  process.exit(0);
}
