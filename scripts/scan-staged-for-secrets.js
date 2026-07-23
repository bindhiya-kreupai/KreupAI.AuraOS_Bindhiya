#!/usr/bin/env node
/**
 * Pre-commit guard against committing real secrets.
 * Cross-platform Node.js script.
 */

const { execSync } = require('child_process');

function run() {
  let against = 'HEAD';
  try {
    execSync('git rev-parse --verify HEAD', { stdio: 'ignore' });
  } catch (e) {
    try {
      against = execSync('git hash-object -t tree /dev/null').toString().trim();
    } catch (err) {
      against = 'HEAD';
    }
  }

  let stagedOutput = '';
  try {
    stagedOutput = execSync(`git diff --cached --name-only --diff-filter=ACMRT "${against}"`).toString();
  } catch (e) {
    process.exit(0);
  }

  const stagedFiles = stagedOutput
    .split(/\r?\n/)
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => !/^(node_modules|dist|\.next|coverage|\.turbo)\//.test(f))
    .filter((f) => !/\.env\.(example|template|test)$/.test(f))
    .filter((f) => !/\.(lock|map)$/.test(f));

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  const patterns = [
    { regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, desc: 'JWT-shaped token' },
    { regex: /AKIA[0-9A-Z]{16}/g, desc: 'AWS access key ID' },
    { regex: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g, desc: 'private key' },
    { regex: /gh[pousr]_[A-Za-z0-9]{36,}/g, desc: 'GitHub personal access token' },
    { regex: /xox[abp]-[A-Za-z0-9-]{10,}/g, desc: 'Slack token' },
    { regex: /postgres(ql)?:\/\/[^:]+:[^@\s]{8,}@[^\/\s]+/g, desc: 'Postgres connection string with embedded password' },
  ];

  const placeholderRegex = /REPLACE_WITH|your-.*-here|your-.*-token|your-.*-key|change-this-in-production|test_password|test-jwt-secret|e2e-jwt|integration-test-|aura_redis_2024|auraos_rabbit_2024|NEW_PASS|EXAMPLE|<example>|placeholder|password@host|PASSWORD|<your|your_|SAML_SP_PRIVATE_KEY|BEGIN PRIVATE KEY-----.../;
  const upperConnRegex = /postgres(ql)?:\/\/[A-Z_]+:[A-Z_]+@[A-Z_]+/;

  let fail = false;

  for (const file of stagedFiles) {
    let content = '';
    try {
      content = execSync(`git show :"${file}"`, { maxBuffer: 10 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    } catch (e) {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { regex, desc } of patterns) {
        regex.lastIndex = 0;
        if (regex.test(line)) {
          if (placeholderRegex.test(line) || upperConnRegex.test(line)) {
            continue;
          }
          console.error(`::error file=${file}::Possible secret committed — ${desc}`);
          console.error(`    ${file}:${i + 1}: ${line.trim()}`);
          fail = true;
        }
      }
    }
  }

  if (fail) {
    console.error('\nPre-commit secret scan FAILED.');
    console.error('If this is a placeholder, add it to the allow-list in scripts/scan-staged-for-secrets.js.');
    console.error('If it is a real secret, remove it and store it in your secrets manager (see docs/SECRETS.md).');
    console.error('To intentionally bypass (rare; document why in the commit message):');
    console.error('  git commit --no-verify');
    process.exit(1);
  }

  process.exit(0);
}

run();
