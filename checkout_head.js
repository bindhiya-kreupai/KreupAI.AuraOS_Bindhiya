const fs = require('fs');
const { execSync } = require('child_process');
const lines = fs.readFileSync('all_conflicts.txt', 'utf8').split('\n');
const files = new Set();
for (const l of lines) {
  if (l.startsWith('--- CONFLICT IN ')) {
    files.add(l.split('--- CONFLICT IN ')[1].split(' at line')[0]);
  }
}
for (const f of files) {
  console.log('Checking out HEAD for', f);
  execSync(`git checkout HEAD -- "${f}"`);
}
