module.exports = {
  'apps/web/src/**/*.{ts,tsx}': (filenames) => [
    `node scripts/lint-staged-wrapper.js web-ts ${filenames.map((f) => `"${f}"`).join(' ')}`,
  ],
  '*.{json,md}': (filenames) => [
    `node scripts/lint-staged-wrapper.js format ${filenames.map((f) => `"${f}"`).join(' ')}`,
  ],
};
