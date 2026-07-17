const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, '../src/app/api/automotive'), (filePath) => {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add import if not exists
    if (!content.includes('createProtectedRoute')) {
      // Find the last import
      const importRegex = /import .* from '.*';\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      const importStatement = `import { createProtectedRoute } from '@/lib/api/route-wrapper';\n`;
      content = content.substring(0, lastIndex) + importStatement + content.substring(lastIndex);
    }

    // Wrap GET
    content = content.replace(/export async function GET\((.*?)\)\s*{/g, 'export const GET = createProtectedRoute(async ($1) => {');
    // Wrap POST
    content = content.replace(/export async function POST\((.*?)\)\s*{/g, 'export const POST = createProtectedRoute(async ($1) => {');
    // Wrap PUT
    content = content.replace(/export async function PUT\((.*?)\)\s*{/g, 'export const PUT = createProtectedRoute(async ($1) => {');
    // Wrap DELETE
    content = content.replace(/export async function DELETE\((.*?)\)\s*{/g, 'export const DELETE = createProtectedRoute(async ($1) => {');

    // Close the wrapper
    // Because we're replacing `export async function METHOD(...) {` with `export const METHOD = createProtectedRoute(async (...) => {`,
    // the closing brace `}` at the end of the function needs to become `});`.
    // It's hard to find the matching brace. But we can assume the functions are at the top level, 
    // so a closing brace on a new line `}\n` that's followed by nothing, or another export, is the end.
    // Instead of regex for closing brace, let's just do a simple trick: replace `}\n\nexport` with `});\n\nexport`, and the last `}` with `});`.
    
    // Better way:
    content = content.replace(/^}(\r?\n|$)/gm, '});$1');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
