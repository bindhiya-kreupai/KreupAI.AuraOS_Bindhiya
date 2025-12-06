
const fs = require('fs');
const path = require('path');

// 1. Parse Menu
const menuContent = fs.readFileSync('packages/@aura/config/src/super-admin-menu.ts', 'utf8');

const featureRegex = /features:\s*\[([\s\S]*?)\]/g;
let match;
const allFeatures = [];

while ((match = featureRegex.exec(menuContent)) !== null) {
    const block = match[1];
    const lines = block.split('\n');
    lines.forEach(line => {
        const clean = line.trim().replace(/'/g, '').replace(/,/g, '');
        if (clean && !clean.startsWith('//')) {
            allFeatures.push(clean);
        }
    });
}

console.log(`Found ${allFeatures.length} features in menu.`);

// 2. Scan Files
function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            if (file === 'page.tsx') {
                arrayOfFiles.push(path.join(dirPath, "/"));
            }
        }
    })

    return arrayOfFiles
}

const existingPages = getAllFiles('apps/web/src/app/dashboard');
console.log(`Found ${existingPages.length} existing pages.`);

// 3. Match
const missing = [];
const found = [];

// Heuristic: convert feature to kebab-case and check if it exists in any path
allFeatures.forEach(search => {
    // "Job Requisition" -> "job-requisition"
    const slug = search.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/\//g, '-');

    // Also try checking for just the last word or first word if exact match fails, 
    // but for now let's stick to slug match in the path
    const isFound = existingPages.some(p => p.includes(slug));

    if (isFound) {
        found.push(search);
    } else {
        missing.push({ name: search, slug: slug });
    }
});

console.log(`\nMatched: ${found.length}`);
console.log(`Potentially Missing: ${missing.length}`);

console.log('\n--- Missing Features (Analysis) ---');
missing.forEach(m => console.log(`[Missing] ${m.name} (Expected slug: ${m.slug})`));
