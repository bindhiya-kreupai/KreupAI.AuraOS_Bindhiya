const fs = require('fs');
const path = require('path');

const isMerging = fs.existsSync(path.join(__dirname, '.git/MERGE_HEAD'));

module.exports = isMerging
  ? {}
  : {
      'apps/web/src/**/*.{ts,tsx}': (filenames) => [
        `node scripts/lint-staged-wrapper.js web-ts ${filenames.map((f) => `"${f}"`).join(' ')}`,
      ],
      '*.{json,md}': (filenames) => [
        `node scripts/lint-staged-wrapper.js format ${filenames.map((f) => `"${f}"`).join(' ')}`,
      ],
    };

