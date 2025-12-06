const fs = require('fs');
const path = require('path');

// 1. Path to super-admin-menu.ts
// We might need to read it as text and regex parse it because strict TS might not run in node directly without ts-node.
// Simpler approach: Read the file content and extract the config object using regex/eval or just basic parsing if the structure is simple.
// The structure is `export const superAdminMenu: MenuDefinition = { ... items: [...] }`

const CONFIG_PATH = path.join(__dirname, '../packages/@aura/config/src/super-admin-menu.ts');
const WEB_APP_ROOT = path.join(__dirname, '../apps/web/src/app');

// Helper to ensure directory exists
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// 2. Read Config
const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');

// We need to extract the `items` array. 
// A robust way without importing TS is to find the relevant array string.
// We'll do a simple regex extraction for the `items: [...]` block.
// Caveat: nested brackets. 
// Actually, let's just use a simpler regex to find each object definition since they are regular.
// Pattern: { code: '...', label: '...', path: '...', features: [...] }

// Let's iterate through the file line by line to build objects, it's safer.
// Or better, let's manually extract the array part and eval it (dangerous but effective in one-off script)
// Removing 'export const superAdminMenu: MenuDefinition =' and types.

console.log('Reading config from:', CONFIG_PATH);

// Simple parser for this specific file structure
const modules = [];

// Regex to capture feature blocks
// We look for code: 'CODE', label: 'Label', path: '/path', features: [ ... ]
const data = configContent;
const itemRegex = /{\s*code:\s*'([^']+)',\s*label:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*path:\s*'([^']+)',\s*features:\s*\[([\s\S]*?)\]/g;

let match;
while ((match = itemRegex.exec(data)) !== null) {
    const code = match[1];
    const label = match[2];
    const icon = match[3];
    const urlPath = match[4];
    const featuresRaw = match[5];

    // Clean features
    const features = featuresRaw
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith("'"))
        .map(line => line.replace(/'/g, '').replace(/,/g, ''));

    modules.push({ code, label, urlPath, features });
}

console.log(`Found ${modules.length} modules.`);

// 3. Generate Pages
let createdCount = 0;
let skippedCount = 0;

modules.forEach(mod => {
    if (!mod.urlPath.startsWith('/dashboard')) return;

    // Construct file system path
    // /dashboard/core-hr -> apps/web/src/app/dashboard/core-hr/page.tsx
    const fsPath = path.join(WEB_APP_ROOT, mod.urlPath.substring(1), 'page.tsx'); // remove leading /

    if (fs.existsSync(fsPath)) {
        console.log(`[SKIP] ${mod.label} - Page already exists at ${fsPath}`);
        skippedCount++;
        return;
    }

    console.log(`[CREATE] ${mod.label} - Creating page at ${fsPath}`);

    // Create directory if missing
    const dir = path.dirname(fsPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Generate Content
    const content = `"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ${mod.code.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')}Page() {
  const features = [
    ${mod.features.map(f => `'${f}'`).join(',\n    ')}
  ];

  return (
    <ModuleGrid
      title="${mod.label}"
      description="Manage your ${mod.label.toLowerCase()} operations and settings."
      features={features}
      basePath="${mod.urlPath}"
    />
  );
}
`;

    fs.writeFileSync(fsPath, content);
    createdCount++;
});

console.log('-----------------------------------');
console.log(`Job Complete.`);
console.log(`Pages Created: ${createdCount}`);
console.log(`Pages Skipped: ${skippedCount}`);
