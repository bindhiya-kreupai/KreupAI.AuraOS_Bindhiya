const fs = require('fs');
const { execSync } = require('child_process');

function resolveFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('<<<<<<<')) {
      const headLines = [];
      const otherLines = [];
      let side = 'head';
      i++;
      
      while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
        const subLine = lines[i];
        if (subLine.startsWith('=======')) {
          side = 'other';
        } else {
          if (side === 'head') {
            headLines.push(subLine);
          } else {
            otherLines.push(subLine);
          }
        }
        i++;
      }
      i++;
      
      // For schema.prisma, if both sides just have formatting differences, picking head is fine.
      // If it's imports, maybe we could keep both, but picking head is safest to not break user's code.
      result.push(...headLines);
      
    } else {
      result.push(line);
      i++;
    }
  }
  
  fs.writeFileSync(filePath, result.join('\n'));
  console.log(`Resolved ${filePath}`);
}

try {
  const files = execSync('git diff --name-only --diff-filter=U').toString().trim().split('\n').filter(Boolean);
  for (const file of files) {
    if (fs.existsSync(file)) {
      resolveFile(file);
    }
  }
} catch (e) {
  console.error(e.message);
}
