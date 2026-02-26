/**
 * @file global-teardown.ts
 * @description Playwright global teardown: cleanup test data after all tests.
 */

import path from 'path';
import fs   from 'fs';

async function globalTeardown() {
  // Optionally clean up auth state files
  if (process.env.CLEAN_AUTH_STATE === 'true') {
    const authDir = path.join(__dirname, '..', '.auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true });
      console.log('[global-teardown] Cleaned up auth state files.');
    }
  }

  console.log('[global-teardown] E2E test suite teardown complete.');
}

export default globalTeardown;
