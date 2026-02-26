/**
 * Software Bill of Materials (SBOM) Generator
 *
 * Generates CycloneDX-format SBOMs from package.json dependency trees,
 * enriches them with vulnerability data, and calculates a supply-chain
 * risk score.
 *
 * @module @aura/security
 * @see https://cyclonedx.org/specification/overview/
 */

import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Types — CycloneDX 1.5 (subset)
// ---------------------------------------------------------------------------

export type ComponentType = 'library' | 'framework' | 'application' | 'container' | 'device';

export interface CycloneDXLicense {
  id?: string;          // SPDX identifier
  name?: string;
  url?: string;
}

export interface CycloneDXComponent {
  type: ComponentType;
  name: string;
  version: string;
  purl?: string;        // Package URL (pkg:npm/...)
  description?: string;
  licenses: CycloneDXLicense[];
  hashes: Array<{ alg: 'SHA-256'; content: string }>;
  vulnerabilities?: SBOMVulnerability[];
}

export interface CycloneDXMetadata {
  timestamp: string;
  tools: Array<{ vendor: string; name: string; version: string }>;
  component: {
    type: ComponentType;
    name: string;
    version: string;
  };
}

export interface CycloneDXSBOM {
  bomFormat: 'CycloneDX';
  specVersion: '1.5';
  serialNumber: string;
  version: number;
  metadata: CycloneDXMetadata;
  components: CycloneDXComponent[];
}

export interface SBOMVulnerability {
  id: string;           // CVE-YYYY-XXXXX
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore?: number;
  description: string;
  fixedIn?: string;
  published: string;
}

export type SBOMFormat = 'json' | 'xml';

export interface SupplyChainScore {
  score: number;          // 0-100 (higher = safer)
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  componentCount: number;
  vulnerableComponents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  details: string[];
}

// ---------------------------------------------------------------------------
// Mock vulnerability database (in production: call OSV API / Snyk / etc.)
// ---------------------------------------------------------------------------

const MOCK_VULN_DB: Record<string, SBOMVulnerability[]> = {
  'lodash': [
    {
      id: 'CVE-2021-23337',
      severity: 'high',
      cvssScore: 7.2,
      description: 'Prototype Pollution in lodash before 4.17.21',
      fixedIn: '4.17.21',
      published: '2021-02-15T13:15:00Z',
    },
  ],
  'axios': [
    {
      id: 'CVE-2023-45857',
      severity: 'medium',
      cvssScore: 5.9,
      description: 'Axios Cross-Site Request Forgery vulnerability',
      fixedIn: '1.6.0',
      published: '2023-11-08T21:15:00Z',
    },
  ],
};

// ---------------------------------------------------------------------------
// SBOM Generator
// ---------------------------------------------------------------------------

export class SBOMGenerator {
  private readonly toolVersion = '1.0.0';

  /**
   * Parse a package.json at the given path and produce a CycloneDX SBOM.
   */
  generateSBOM(packageJsonPath: string): CycloneDXSBOM {
    if (!existsSync(packageJsonPath)) {
      throw new Error(`package.json not found at: ${packageJsonPath}`);
    }

    const rawContent = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(rawContent) as {
      name?: string;
      version?: string;
      description?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const allDeps: Record<string, string> = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };

    const components: CycloneDXComponent[] = Object.entries(allDeps).map(
      ([name, version]) => this._buildComponent(name, version)
    );

    return {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:${this._generateUUID()}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [
          { vendor: 'KreupAI', name: '@aura/security sbom-generator', version: this.toolVersion },
        ],
        component: {
          type: 'application',
          name: pkg.name ?? 'unknown',
          version: pkg.version ?? '0.0.0',
        },
      },
      components,
    };
  }

  /**
   * Enrich an SBOM with vulnerability data from the database.
   */
  enrichWithVulnerabilities(sbom: CycloneDXSBOM): CycloneDXSBOM {
    const enriched: CycloneDXComponent[] = sbom.components.map((component) => {
      const vulns = MOCK_VULN_DB[component.name];
      if (!vulns) return component;

      // Only include vulnerabilities not yet fixed in the installed version
      const relevant = vulns.filter((v) => {
        if (!v.fixedIn) return true;
        return !this._versionSatisfies(component.version, v.fixedIn);
      });

      return {
        ...component,
        vulnerabilities: relevant.length > 0 ? relevant : undefined,
      };
    });

    return { ...sbom, components: enriched };
  }

  /**
   * Return components with at least one known CVE.
   */
  getHighRiskDependencies(sbom: CycloneDXSBOM): CycloneDXComponent[] {
    return sbom.components.filter(
      (c) => c.vulnerabilities && c.vulnerabilities.length > 0
    );
  }

  /**
   * Export SBOM in JSON or XML format.
   */
  exportSBOM(sbom: CycloneDXSBOM, format: SBOMFormat): string {
    if (format === 'json') {
      return JSON.stringify(sbom, null, 2);
    }

    // Minimal CycloneDX XML serialisation
    const components = sbom.components
      .map((c) => {
        const vulnXml = (c.vulnerabilities ?? [])
          .map(
            (v) =>
              `      <vulnerability>
        <id>${v.id}</id>
        <severity>${v.severity}</severity>
        <description>${this._escapeXml(v.description)}</description>
      </vulnerability>`
          )
          .join('\n');

        return `    <component type="${c.type}">
      <name>${this._escapeXml(c.name)}</name>
      <version>${this._escapeXml(c.version)}</version>
      <purl>${this._escapeXml(c.purl ?? '')}</purl>
      ${vulnXml}
    </component>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.5"
     serialNumber="${sbom.serialNumber}"
     version="${sbom.version}">
  <metadata>
    <timestamp>${sbom.metadata.timestamp}</timestamp>
  </metadata>
  <components>
${components}
  </components>
</bom>`;
  }

  /**
   * Calculate an overall supply-chain risk score.
   *
   * Scoring: start at 100, deduct points per vulnerability by severity.
   */
  getSupplyChainScore(sbom: CycloneDXSBOM): SupplyChainScore {
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let vulnerableComponents = 0;
    const details: string[] = [];

    for (const component of sbom.components) {
      if (!component.vulnerabilities || component.vulnerabilities.length === 0) continue;
      vulnerableComponents++;

      for (const v of component.vulnerabilities) {
        switch (v.severity) {
          case 'critical': criticalCount++; break;
          case 'high':     highCount++;     break;
          case 'medium':   mediumCount++;   break;
          case 'low':      lowCount++;      break;
        }
      }

      details.push(
        `${component.name}@${component.version}: ` +
        `${component.vulnerabilities.map((v) => v.id).join(', ')}`
      );
    }

    // Deduction formula
    const deduction =
      criticalCount * 25 +
      highCount * 15 +
      mediumCount * 5 +
      lowCount * 2;

    const score = Math.max(0, 100 - deduction);

    const grade: SupplyChainScore['grade'] =
      score >= 90 ? 'A' :
      score >= 75 ? 'B' :
      score >= 60 ? 'C' :
      score >= 40 ? 'D' : 'F';

    return {
      score,
      grade,
      componentCount: sbom.components.length,
      vulnerableComponents,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      details,
    };
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private _buildComponent(name: string, versionRange: string): CycloneDXComponent {
    const version = versionRange.replace(/^[\^~>=<]/, '');
    const purl = `pkg:npm/${encodeURIComponent(name)}@${version}`;
    const hash = createHash('sha256')
      .update(`${name}@${version}`)
      .digest('hex');

    return {
      type: 'library',
      name,
      version,
      purl,
      licenses: [{ id: 'UNKNOWN' }],
      hashes: [{ alg: 'SHA-256', content: hash }],
    };
  }

  private _versionSatisfies(installed: string, fixedIn: string): boolean {
    // Very simplified: compare major.minor.patch numerically
    const parse = (v: string) =>
      v.replace(/^[^0-9]*/, '').split('.').map((n) => parseInt(n, 10) || 0);

    const inst = parse(installed);
    const fix = parse(fixedIn);

    for (let i = 0; i < Math.max(inst.length, fix.length); i++) {
      const a = inst[i] ?? 0;
      const b = fix[i] ?? 0;
      if (a > b) return true;  // installed > fixedIn → patched
      if (a < b) return false;
    }
    return true; // equal
  }

  private _generateUUID(): string {
    const bytes = randomHex(16);
    return [
      bytes.slice(0, 8),
      bytes.slice(8, 12),
      '4' + bytes.slice(13, 16),
      ((parseInt(bytes[16], 16) & 0x3) | 0x8).toString(16) + bytes.slice(17, 20),
      bytes.slice(20, 32),
    ].join('-');
  }

  private _escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

function randomHex(bytes: number): string {
  return createHash('sha256').update(Math.random().toString()).digest('hex').slice(0, bytes * 2);
}
