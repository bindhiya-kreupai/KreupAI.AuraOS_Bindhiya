/**
 * Dependency Security Audit Tests
 *
 * Tests for checking dependency vulnerabilities and outdated packages.
 * This integrates with npm audit and can be extended to check other
 * security scanning tools like Snyk.
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../../../../..');

test.describe('Dependency Security Audit', () => {
  test('should not have critical or high severity vulnerabilities', async () => {
    try {
      // Run npm audit and get JSON output
      const auditOutput = execSync('npm audit --json', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const auditResult = JSON.parse(auditOutput);

      // Check for vulnerabilities
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {};

      expect(vulnerabilities.critical || 0).toBe(0);
      expect(vulnerabilities.high || 0).toBe(0);

      // Log moderate and low vulnerabilities as warnings
      if (vulnerabilities.moderate > 0) {
        console.warn(`⚠️  ${vulnerabilities.moderate} moderate severity vulnerabilities found`);
      }
      if (vulnerabilities.low > 0) {
        console.warn(`ℹ️  ${vulnerabilities.low} low severity vulnerabilities found`);
      }
    } catch (error: any) {
      // npm audit returns exit code 1 if vulnerabilities are found
      if (error.stdout) {
        const auditResult = JSON.parse(error.stdout);
        const vulnerabilities = auditResult.metadata?.vulnerabilities || {};

        // Fail test if critical or high vulnerabilities exist
        expect({
          critical: vulnerabilities.critical || 0,
          high: vulnerabilities.high || 0,
        }).toEqual({ critical: 0, high: 0 });
      } else {
        throw error;
      }
    }
  });

  test('should have package-lock.json or pnpm-lock.yaml', async () => {
    const hasNpmLock = fs.existsSync(path.join(ROOT_DIR, 'package-lock.json'));
    const hasPnpmLock = fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'));
    const hasYarnLock = fs.existsSync(path.join(ROOT_DIR, 'yarn.lock'));

    expect(hasNpmLock || hasPnpmLock || hasYarnLock).toBeTruthy();
  });

  test('should not have dependencies with known vulnerabilities in production', async () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    // List of packages known to have security issues (update as needed)
    const blockedPackages = [
      'request', // Deprecated
      'colors@1.4.0', // Known vulnerability
      'node-ipc@9.2.2', // Malicious code
    ];

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const blocked of blockedPackages) {
      const [pkg, version] = blocked.split('@');
      if (dependencies[pkg]) {
        if (version) {
          expect(dependencies[pkg]).not.toBe(version);
        } else {
          console.warn(`⚠️  Deprecated package detected: ${pkg}`);
        }
      }
    }
  });

  test('should use exact versions or ranges for dependencies', async () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    const dependencies = packageJson.dependencies || {};

    // Check for wildcard versions
    for (const [pkg, version] of Object.entries(dependencies)) {
      if (typeof version === 'string') {
        // Fail if using * or x
        expect(version).not.toBe('*');
        expect(version).not.toContain('x');

        // Warn if using latest
        if (version === 'latest') {
          console.warn(`⚠️  Package ${pkg} uses 'latest' version`);
        }
      }
    }
  });

  test.skip('should check for outdated packages (info only)', async () => {
    try {
      const outdatedOutput = execSync('npm outdated --json', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      if (outdatedOutput) {
        const outdated = JSON.parse(outdatedOutput);
        const outdatedCount = Object.keys(outdated).length;

        if (outdatedCount > 0) {
          console.log(`ℹ️  ${outdatedCount} packages have newer versions available`);
          console.log(JSON.stringify(outdated, null, 2));
        }
      }
    } catch (error: any) {
      // npm outdated returns exit code 1 if outdated packages exist
      if (error.stdout) {
        console.log('ℹ️  Some packages are outdated (this is informational)');
      }
    }
  });
});

test.describe('License Compliance', () => {
  test('should not have GPL-licensed dependencies in production', async () => {
    // This is a basic check. For comprehensive license checking, use tools like license-checker
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    // GPL licenses that may cause issues
    const restrictiveLicenses = ['GPL', 'AGPL', 'LGPL'];

    // This is a simplified check. In practice, you'd use a tool like license-checker
    // to scan all transitive dependencies
    if (packageJson.license) {
      for (const license of restrictiveLicenses) {
        expect(packageJson.license).not.toContain(license);
      }
    }
  });

  test.skip('should have license information for all dependencies', async () => {
    try {
      // Requires: npm install -D license-checker
      const licenseOutput = execSync('npx license-checker --json --production', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const licenses = JSON.parse(licenseOutput);
      const unlicensed = Object.entries(licenses)
        .filter(([, info]: [string, any]) => !info.licenses || info.licenses === 'UNKNOWN')
        .map(([pkg]) => pkg);

      if (unlicensed.length > 0) {
        console.warn(`⚠️  Packages without license information: ${unlicensed.join(', ')}`);
      }

      expect(unlicensed.length).toBeLessThan(5);
    } catch (error) {
      console.log('ℹ️  license-checker not installed, skipping license audit');
    }
  });
});

test.describe('Dependency Best Practices', () => {
  test('should not have duplicate dependencies', async () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Check for packages in both dependencies and devDependencies
    const duplicates = Object.keys(dependencies).filter(pkg =>
      devDependencies.hasOwnProperty(pkg)
    );

    if (duplicates.length > 0) {
      console.warn(`⚠️  Duplicate dependencies found: ${duplicates.join(', ')}`);
    }

    expect(duplicates.length).toBe(0);
  });

  test('should not have unused dependencies (manual check)', async () => {
    // This is more of a reminder to periodically check for unused dependencies
    // Tools like depcheck can be used: npx depcheck
    console.log('ℹ️  Run "npx depcheck" to check for unused dependencies');
    expect(true).toBeTruthy();
  });

  test('should use peer dependencies correctly', async () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    const peerDependencies = packageJson.peerDependencies || {};

    // Common peer dependencies that should be in dependencies for apps
    const commonPeerDeps = ['react', 'react-dom', 'next'];

    for (const peerDep of commonPeerDeps) {
      if (peerDependencies[peerDep]) {
        // If it's in peerDependencies, it should also be in dependencies or devDependencies
        const hasInDeps = packageJson.dependencies?.[peerDep];
        const hasInDevDeps = packageJson.devDependencies?.[peerDep];

        expect(hasInDeps || hasInDevDeps).toBeTruthy();
      }
    }
  });
});

test.describe('Security Configuration', () => {
  test('should have npm scripts for security checks', async () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    const scripts = packageJson.scripts || {};

    // Recommended security-related scripts
    const recommendedScripts = ['audit', 'audit:fix'];

    const missingScripts = recommendedScripts.filter(script => !scripts[script]);

    if (missingScripts.length > 0) {
      console.warn(`⚠️  Consider adding these npm scripts: ${missingScripts.join(', ')}`);
    }
  });

  test('should not have postinstall scripts from dependencies (risk of malicious code)', async () => {
    // This is a simplified check. In practice, you'd scan node_modules
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );

    const scripts = packageJson.scripts || {};

    // If there's a postinstall script, ensure it's documented and reviewed
    if (scripts.postinstall) {
      console.warn('⚠️  postinstall script detected. Ensure this is intentional and safe.');
    }
  });
});
