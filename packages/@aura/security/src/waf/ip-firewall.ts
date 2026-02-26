/**
 * IPFirewall
 *
 * IP-based access control with allow/block lists, CIDR support,
 * country-based blocking, and GeoIP stub.
 *
 * @module @aura/security
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IPFirewallOptions {
  /** IPs or CIDR ranges on the allow list */
  allowList?: string[];
  /** IPs or CIDR ranges on the block list */
  blockList?: string[];
  /** ISO 3166-1 alpha-2 country codes to block */
  blockedCountries?: string[];
  /** ISO 3166-1 alpha-2 country codes allowed (if set, all others are blocked) */
  allowedCountries?: string[];
  /** Default action when no rule matches: 'allow' (default) or 'block' */
  defaultAction?: 'allow' | 'block';
}

export type FirewallDecision = 'allow' | 'block';

export interface FirewallCheckResult {
  decision: FirewallDecision;
  reason: string;
  ip: string;
  country?: string;
}

export interface GeoIPResult {
  ip: string;
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  isp?: string;
}

// ---------------------------------------------------------------------------
// IPFirewall
// ---------------------------------------------------------------------------

export class IPFirewall {
  private allowList: Set<string>  = new Set();
  private blockList: Set<string>  = new Set();
  private allowCIDRs: CIDRRange[] = [];
  private blockCIDRs: CIDRRange[] = [];
  private blockedCountries: Set<string> = new Set();
  private allowedCountries: Set<string> = new Set();
  private readonly defaultAction: FirewallDecision;

  constructor(options: IPFirewallOptions = {}) {
    this.defaultAction = options.defaultAction ?? 'allow';

    if (options.allowList) {
      for (const entry of options.allowList) {
        this.addToAllowList(entry);
      }
    }

    if (options.blockList) {
      for (const entry of options.blockList) {
        this.addToBlockList(entry);
      }
    }

    if (options.blockedCountries) {
      for (const code of options.blockedCountries) {
        this.blockedCountries.add(code.toUpperCase());
      }
    }

    if (options.allowedCountries) {
      for (const code of options.allowedCountries) {
        this.allowedCountries.add(code.toUpperCase());
      }
    }
  }

  // -------------------------------------------------------------------------
  // List management
  // -------------------------------------------------------------------------

  addToAllowList(ipOrCIDR: string): void {
    if (this.isCIDR(ipOrCIDR)) {
      this.allowCIDRs.push(new CIDRRange(ipOrCIDR));
    } else {
      this.allowList.add(this.normalizeIP(ipOrCIDR));
    }
  }

  addToBlockList(ipOrCIDR: string): void {
    if (this.isCIDR(ipOrCIDR)) {
      this.blockCIDRs.push(new CIDRRange(ipOrCIDR));
    } else {
      this.blockList.add(this.normalizeIP(ipOrCIDR));
    }
  }

  removeFromAllowList(ipOrCIDR: string): void {
    if (this.isCIDR(ipOrCIDR)) {
      this.allowCIDRs = this.allowCIDRs.filter((r) => r.range !== ipOrCIDR);
    } else {
      this.allowList.delete(this.normalizeIP(ipOrCIDR));
    }
  }

  removeFromBlockList(ipOrCIDR: string): void {
    if (this.isCIDR(ipOrCIDR)) {
      this.blockCIDRs = this.blockCIDRs.filter((r) => r.range !== ipOrCIDR);
    } else {
      this.blockList.delete(this.normalizeIP(ipOrCIDR));
    }
  }

  blockCountry(code: string): void {
    this.blockedCountries.add(code.toUpperCase());
  }

  allowCountry(code: string): void {
    this.allowedCountries.add(code.toUpperCase());
  }

  // -------------------------------------------------------------------------
  // IP checking
  // -------------------------------------------------------------------------

  /**
   * Determine whether an IP address should be allowed or blocked.
   * Evaluation order:
   *   1. Allow list (explicit allow wins over everything)
   *   2. Block list
   *   3. Block CIDR ranges
   *   4. Allow CIDR ranges
   *   5. Country-based rules
   *   6. Default action
   */
  checkIP(ip: string): FirewallCheckResult {
    const normalizedIP = this.normalizeIP(ip);

    // 1. Explicit allow list
    if (this.allowList.has(normalizedIP)) {
      return { decision: 'allow', reason: 'IP on allow list', ip };
    }

    // 2. Explicit block list
    if (this.blockList.has(normalizedIP)) {
      return { decision: 'block', reason: 'IP on block list', ip };
    }

    // 3. Block CIDR ranges
    for (const cidr of this.blockCIDRs) {
      if (cidr.contains(normalizedIP)) {
        return { decision: 'block', reason: `IP in blocked CIDR: ${cidr.range}`, ip };
      }
    }

    // 4. Allow CIDR ranges
    for (const cidr of this.allowCIDRs) {
      if (cidr.contains(normalizedIP)) {
        return { decision: 'allow', reason: `IP in allowed CIDR: ${cidr.range}`, ip };
      }
    }

    // 5. Country-based rules (using GeoIP stub)
    if (this.blockedCountries.size > 0 || this.allowedCountries.size > 0) {
      const geo = this.geoIPLookup(normalizedIP);
      const cc  = geo.countryCode;

      if (this.blockedCountries.has(cc)) {
        return { decision: 'block', reason: `Country "${cc}" is blocked`, ip, country: cc };
      }

      if (this.allowedCountries.size > 0 && !this.allowedCountries.has(cc)) {
        return {
          decision: 'block',
          reason: `Country "${cc}" not in allowed list`,
          ip,
          country: cc,
        };
      }
    }

    // 6. Default
    return {
      decision: this.defaultAction,
      reason: `Default action: ${this.defaultAction}`,
      ip,
    };
  }

  // -------------------------------------------------------------------------
  // GeoIP stub
  // -------------------------------------------------------------------------

  /**
   * GeoIP lookup stub.
   * In production, replace with maxmind/node-maxmind or ipapi.co integration.
   */
  geoIPLookup(ip: string): GeoIPResult {
    // Private / RFC1918 ranges → treat as internal
    if (
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') ||
      ip === '127.0.0.1' ||
      ip === '::1'
    ) {
      return { ip, country: 'Internal', countryCode: 'INTERNAL' };
    }

    // Stub: In production integrate with:
    //   - MaxMind GeoIP2 database (offline, fast)
    //   - ipapi.co (online)
    //   - ip-api.com (online)
    console.debug(`[IPFirewall] GeoIP lookup stub for IP: ${ip}`);
    return { ip, country: 'Unknown', countryCode: 'XX' };
  }

  // -------------------------------------------------------------------------
  // Stats / introspection
  // -------------------------------------------------------------------------

  getStats() {
    return {
      allowListSize:  this.allowList.size + this.allowCIDRs.length,
      blockListSize:  this.blockList.size + this.blockCIDRs.length,
      blockedCountries: Array.from(this.blockedCountries),
      allowedCountries: Array.from(this.allowedCountries),
      defaultAction: this.defaultAction,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private normalizeIP(ip: string): string {
    // Strip IPv6-mapped IPv4 prefix
    if (ip.startsWith('::ffff:')) return ip.slice(7);
    return ip.trim();
  }

  private isCIDR(entry: string): boolean {
    return entry.includes('/');
  }
}

// ---------------------------------------------------------------------------
// CIDR Range
// ---------------------------------------------------------------------------

class CIDRRange {
  readonly range: string;
  private readonly networkInt: number;
  private readonly mask: number;

  constructor(cidr: string) {
    this.range = cidr;
    const [ip, prefix] = cidr.split('/');
    const prefixLen = parseInt(prefix, 10);
    this.networkInt = ipToInt(ip);
    this.mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  }

  contains(ip: string): boolean {
    try {
      const ipInt = ipToInt(ip);
      return (ipInt & this.mask) === (this.networkInt & this.mask);
    } catch {
      return false;
    }
  }
}

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
