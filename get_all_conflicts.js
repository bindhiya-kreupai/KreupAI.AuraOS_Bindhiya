const fs = require('fs');
const { execSync } = require('child_process');

try {
  const files = execSync('git diff --name-only --diff-filter=U').toString().trim().split('\n').filter(Boolean);
  
  let output = '';
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let inConflict = false;
    let conflictText = '';
    let hasConflicts = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('<<<<<<<')) {
        inConflict = true;
        hasConflicts = true;
        conflictText += `\n--- CONFLICT IN ${file} at line ${i + 1} ---\n`;
      }
      if (inConflict) {
        conflictText += lines[i] + '\n';
      }
      if (lines[i].startsWith('>>>>>>>')) {
        inConflict = false;
        conflictText += '-------------------------------------------------\n';
      }
    }
    
    if (hasConflicts) {
      output += conflictText + '\n';
    }
  }
  
  fs.writeFileSync('all_conflicts.txt', output);
  console.log(`Saved conflicts for ${files.length} files to all_conflicts.txt`);
} catch (e) {
  console.error(e.message);
}
