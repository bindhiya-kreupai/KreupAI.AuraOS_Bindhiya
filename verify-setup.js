#!/usr/bin/env node

/**
 * AuraOS Setup Verification Script
 * Run this script to verify that your development environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}
╔═══════════════════════════════════════════════════════════╗
║         AuraOS Setup Verification Script                  ║
║         KreupAI Technologies                              ║
╚═══════════════════════════════════════════════════════════╝
${RESET}\n`);

const checks = [];

// Helper function to run checks
function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`${GREEN}✓${RESET} ${name}`);
      checks.push({ name, status: 'pass' });
      return true;
    } else {
      console.log(`${YELLOW}⚠${RESET} ${name}: ${result}`);
      checks.push({ name, status: 'warning', message: result });
      return false;
    }
  } catch (error) {
    console.log(`${RED}✗${RESET} ${name}: ${error.message}`);
    checks.push({ name, status: 'fail', message: error.message });
    return false;
  }
}

console.log(`${BLUE}1. System Requirements${RESET}\n`);

// Check Node.js version
check('Node.js >= 20.0.0', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major >= 20) return true;
  return `Found ${version}, need >= 20.0.0`;
});

// Check pnpm
check('pnpm installed', () => {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    const major = parseInt(version.split('.')[0]);
    if (major >= 8) return true;
    return `Found ${version}, need >= 8.15.0`;
  } catch {
    throw new Error('pnpm not found. Install with: npm install -g pnpm');
  }
});

console.log(`\n${BLUE}2. Project Configuration${RESET}\n`);

// Check .env file
check('.env file exists', () => {
  if (!fs.existsSync('.env')) {
    throw new Error('Run: cp .env.example .env');
  }
  return true;
});

// Check .env configuration
check('.env properly configured', () => {
  const env = fs.readFileSync('.env', 'utf8');
  const issues = [];

  if (env.includes('user:password@host:port')) {
    issues.push('DATABASE_URL needs to be updated');
  }

  if (env.includes('your-super-secret-jwt-key')) {
    issues.push('JWT_SECRET should be changed for production');
  }

  if (issues.length > 0) {
    return `Update: ${issues.join(', ')}`;
  }
  return true;
});

// Check pnpm-workspace.yaml
check('pnpm workspace configured', () => {
  if (!fs.existsSync('pnpm-workspace.yaml')) {
    throw new Error('pnpm-workspace.yaml not found');
  }
  return true;
});

// Check turbo.json
check('Turborepo configured', () => {
  if (!fs.existsSync('turbo.json')) {
    throw new Error('turbo.json not found');
  }
  return true;
});

console.log(`\n${BLUE}3. Dependencies${RESET}\n`);

// Check node_modules
check('Dependencies installed', () => {
  if (!fs.existsSync('node_modules')) {
    throw new Error('Run: pnpm install --force --ignore-scripts');
  }
  return true;
});

// Check Prisma client
check('Prisma client generated', () => {
  const prismaClientPath = path.join('node_modules', '.pnpm', '@prisma+client@5.22.0_prisma@5.22.0', 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error('Run: cd packages/@aura/database && pnpm prisma generate');
  }
  return true;
});

console.log(`\n${BLUE}4. Workspace Structure${RESET}\n`);

// Check apps
check('apps/ directory', () => {
  const apps = ['web', 'mobile', 'admin'];
  const existing = fs.readdirSync('apps');
  const missing = apps.filter(app => !existing.includes(app));
  if (missing.length > 0 && !missing.includes('admin')) {
    return `Missing: ${missing.join(', ')}`;
  }
  return true;
});

// Check packages
check('packages/@aura/ directory', () => {
  const packages = ['database', 'ui', 'auth', 'config', 'types'];
  const existing = fs.readdirSync('packages/@aura');
  const missing = packages.filter(pkg => !existing.includes(pkg));
  if (missing.length > 0) {
    return `Missing: ${missing.join(', ')}`;
  }
  return true;
});

// Check services
check('services/ directory', () => {
  const services = ['auth-service', 'employee-service', 'notification-service', 'document-service', 'payroll-service'];
  const existing = fs.readdirSync('services');
  const found = services.filter(svc => existing.includes(svc));
  if (found.length >= 3) return true;
  return `Found ${found.length}/5 services`;
});

console.log(`\n${BLUE}5. Database Configuration${RESET}\n`);

// Check Prisma schema
check('Prisma schema exists', () => {
  const schemaPath = path.join('packages', '@aura', 'database', 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('Prisma schema not found');
  }
  return true;
});

console.log(`\n${BLUE}═══════════════════════════════════════════════════════════${RESET}\n`);

// Summary
const passed = checks.filter(c => c.status === 'pass').length;
const warnings = checks.filter(c => c.status === 'warning').length;
const failed = checks.filter(c => c.status === 'fail').length;

console.log(`${BLUE}Summary:${RESET}`);
console.log(`  ${GREEN}✓ Passed:${RESET} ${passed}`);
if (warnings > 0) console.log(`  ${YELLOW}⚠ Warnings:${RESET} ${warnings}`);
if (failed > 0) console.log(`  ${RED}✗ Failed:${RESET} ${failed}`);

console.log(`\n${BLUE}Next Steps:${RESET}\n`);

if (failed > 0) {
  console.log(`${RED}Some checks failed. Please fix the issues above before proceeding.${RESET}\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`${YELLOW}Some warnings detected. The project should run, but review the warnings.${RESET}\n`);
  console.log('1. Update .env with your database credentials');
  console.log('2. Run: cd packages/@aura/database && pnpm prisma db push');
  console.log('3. Run: pnpm dev (from root directory)');
  console.log('4. Open: http://localhost:3000\n');
} else {
  console.log(`${GREEN}All checks passed! Your environment is ready.${RESET}\n`);
  console.log('1. Update .env with your database credentials (if not done)');
  console.log('2. Run: cd packages/@aura/database && pnpm prisma db push');
  console.log('3. Run: pnpm dev (from root directory)');
  console.log('4. Open: http://localhost:3000\n');
}

console.log(`${BLUE}For detailed setup instructions, see SETUP.md${RESET}\n`);
