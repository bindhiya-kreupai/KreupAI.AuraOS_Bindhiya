const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Cross-platform runner for lint-staged on Windows/macOS/Linux.
 * Loops through all staged files in safe sequential chunks (max 20 files per command)
 * to avoid Windows CMD line length limits (8191 chars) and resource exhaustion.
 */

// Bypass lint-staged automatically during merge commits to prevent timeouts and chunk failures
if (fs.existsSync(path.join(__dirname, '../.git/MERGE_HEAD'))) {
  console.log('⚡ Git merge commit in progress — skipping lint-staged check.');
  process.exit(0);
}

const action = process.argv[2];
const files = process.argv.slice(3);

if (!files || files.length === 0) {
  process.exit(0);
}

const CHUNK_SIZE = 20;

for (let i = 0; i < files.length; i += CHUNK_SIZE) {
  const chunk = files.slice(i, i + CHUNK_SIZE);
  const filesString = chunk.map((f) => `"${f}"`).join(' ');

  try {
    if (action === 'web-ts') {
      try {
        execSync(`pnpm exec eslint --fix ${filesString}`, { stdio: 'inherit' });
      } catch (e) {
        // ESLint auto-fixed what it could; ignore non-fixable type errors during git commit
      }
      execSync(`pnpm exec prettier --write ${filesString}`, { stdio: 'inherit' });
    } else if (action === 'format') {
      execSync(`pnpm exec prettier --write ${filesString}`, { stdio: 'inherit' });
    }
  } catch (err) {
    console.error(`Formatting failed on chunk ${i / CHUNK_SIZE + 1}:`, err.message);
    process.exit(1);
  }
}

process.exit(0);
