#!/usr/bin/env node
/**
 * @reference docs/aura-master-instructions.md
 * Lightweight navigation smoke check:
 * - Reads paths from super-admin menu config
 * - Verifies a Next.js route file exists for each path (supports dynamic segments)
 */

const fs = require("fs");
const path = require("path");

const menuFile = path.join(__dirname, "..", "packages/@aura/config/src/super-admin-menu.ts");
const appRoot = path.join(__dirname, "..", "apps/web/src/app");

const text = fs.readFileSync(menuFile, "utf8");
const pathMatches = [...text.matchAll(/path:\s*'([^']+)'/g)];
const routes = Array.from(new Set(pathMatches.map((m) => m[1])));

const routeFiles = ["page.tsx", "page.ts", "route.tsx", "route.ts"];

function resolveRoute(route) {
  const segments = route.replace(/^\/+/, "").split("/").filter(Boolean);
  let current = appRoot;

  for (const seg of segments) {
    const direct = path.join(current, seg);
    if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
      current = direct;
      continue;
    }

    const dynamicDir = fs
      .readdirSync(current)
      .find((name) => name.startsWith("[") && name.endsWith("]") && fs.statSync(path.join(current, name)).isDirectory());

    if (dynamicDir) {
      current = path.join(current, dynamicDir);
      continue;
    }

    return null;
  }

  for (const file of routeFiles) {
    const candidate = path.join(current, file);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

const missing = [];
for (const route of routes) {
  const found = resolveRoute(route);
  if (!found) {
    missing.push(route);
  }
}

if (missing.length) {
  console.error("Navigation check failed. Missing route files for:");
  missing.forEach((r) => console.error(" -", r));
  process.exit(1);
}

console.log(`Navigation check passed (${routes.length} routes).`);
