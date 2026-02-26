/**
 * Cookie & Consent Management
 *
 * Implements GDPR Article 7 / ePrivacy Directive consent management for
 * cookie categories, preference storage, withdrawal tracking, analytics,
 * and purpose-based processing checks.
 *
 * @module @aura/security
 * @see https://gdpr-info.eu/art-7-gdpr/
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConsentCategory =
  | 'necessary'     // Always on; strictly required for service operation
  | 'analytics'     // Usage statistics and performance monitoring
  | 'marketing'     // Targeted advertising and remarketing
  | 'preferences'   // Personalisation and UI preferences
  | 'third_party';  // Third-party integrations (chat, maps, etc.)

export type ConsentPurpose =
  | 'session_management'
  | 'security'
  | 'analytics_processing'
  | 'ab_testing'
  | 'email_marketing'
  | 'user_profiling'
  | 'personalisation'
  | 'third_party_sharing';

export interface ConsentCategoryConfig {
  id: ConsentCategory;
  label: string;
  description: string;
  mandatory: boolean;
  cookies: string[];
  purposes: ConsentPurpose[];
  retentionDays: number;
}

export interface TenantConsentConfig {
  tenantId: string;
  categories: ConsentCategoryConfig[];
  policyVersion: string;
  updatedAt: string;
  defaultLocale: string;
  requireExplicitConsent: boolean;
}

export interface UserConsentRecord {
  id: string;
  userId: string;
  tenantId: string;
  sessionId?: string;
  consentedAt: string;
  policyVersion: string;
  ipAddress?: string;
  userAgent?: string;
  choices: Record<ConsentCategory, boolean>;
  withdrawals: ConsentWithdrawal[];
}

export interface ConsentWithdrawal {
  id: string;
  category: ConsentCategory;
  withdrawnAt: string;
  reason?: string;
}

export interface ConsentReport {
  period: { from: string; to: string };
  tenantId: string;
  totalUsers: number;
  consentedUsers: number;
  optInRates: Record<ConsentCategory, number>;      // 0-1
  withdrawalRates: Record<ConsentCategory, number>; // 0-1
  topWithdrawalReasons: Array<{ reason: string; count: number }>;
  averageConsentAge: number; // days
}

// ---------------------------------------------------------------------------
// Default consent category definitions
// ---------------------------------------------------------------------------

const DEFAULT_CATEGORIES: ConsentCategoryConfig[] = [
  {
    id: 'necessary',
    label: 'Strictly Necessary',
    description: 'Required for the website to function and cannot be switched off.',
    mandatory: true,
    cookies: ['session', 'csrf_token', 'auth_token'],
    purposes: ['session_management', 'security'],
    retentionDays: 1,
  },
  {
    id: 'analytics',
    label: 'Performance & Analytics',
    description: 'Help us understand how visitors interact with our website.',
    mandatory: false,
    cookies: ['_ga', '_gid', 'amplitude_id', 'mixpanel_id'],
    purposes: ['analytics_processing', 'ab_testing'],
    retentionDays: 365,
  },
  {
    id: 'marketing',
    label: 'Targeting & Advertising',
    description: 'Set by advertising partners to build a profile of your interests.',
    mandatory: false,
    cookies: ['_fbp', 'li_at', 'ads_id'],
    purposes: ['email_marketing', 'user_profiling'],
    retentionDays: 90,
  },
  {
    id: 'preferences',
    label: 'Functional Preferences',
    description: 'Enable enhanced functionality and personalisation.',
    mandatory: false,
    cookies: ['locale', 'theme', 'user_prefs'],
    purposes: ['personalisation'],
    retentionDays: 365,
  },
  {
    id: 'third_party',
    label: 'Third-Party Integrations',
    description: 'Enable embedded content and features from third-party services.',
    mandatory: false,
    cookies: ['intercom-session', 'zendesk'],
    purposes: ['third_party_sharing'],
    retentionDays: 180,
  },
];

// ---------------------------------------------------------------------------
// Consent Manager
// ---------------------------------------------------------------------------

export class ConsentManager {
  private readonly tenantConfigs: Map<string, TenantConsentConfig> = new Map();
  private readonly userConsents: Map<string, UserConsentRecord> = new Map();

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  /**
   * Get the consent configuration for a tenant.
   * Returns default config if none has been customised.
   */
  getConsentConfig(tenantId: string): TenantConsentConfig {
    return (
      this.tenantConfigs.get(tenantId) ?? {
        tenantId,
        categories: DEFAULT_CATEGORIES,
        policyVersion: '1.0.0',
        updatedAt: new Date().toISOString(),
        defaultLocale: 'en',
        requireExplicitConsent: true,
      }
    );
  }

  /**
   * Set a custom consent configuration for a tenant.
   */
  setConsentConfig(config: TenantConsentConfig): void {
    this.tenantConfigs.set(config.tenantId, config);
  }

  // -------------------------------------------------------------------------
  // Record consent
  // -------------------------------------------------------------------------

  /**
   * Record a user's consent choices.
   *
   * Mandatory categories (e.g. 'necessary') are always set to true regardless
   * of the user's input.
   */
  recordConsent(params: {
    userId: string;
    tenantId: string;
    choices: Partial<Record<ConsentCategory, boolean>>;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): UserConsentRecord {
    const config = this.getConsentConfig(params.tenantId);

    // Enforce mandatory categories
    const finalChoices = { ...params.choices } as Record<ConsentCategory, boolean>;
    for (const cat of config.categories) {
      if (cat.mandatory) {
        finalChoices[cat.id] = true;
      }
      if (!(cat.id in finalChoices)) {
        finalChoices[cat.id] = false;
      }
    }

    const existing = this._findUserConsent(params.userId, params.tenantId);
    const now = new Date().toISOString();

    const record: UserConsentRecord = {
      id: existing?.id ?? randomUUID(),
      userId: params.userId,
      tenantId: params.tenantId,
      sessionId: params.sessionId,
      consentedAt: now,
      policyVersion: config.policyVersion,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      choices: finalChoices,
      withdrawals: existing?.withdrawals ?? [],
    };

    this.userConsents.set(this._consentKey(params.userId, params.tenantId), record);
    return record;
  }

  // -------------------------------------------------------------------------
  // Get consent
  // -------------------------------------------------------------------------

  /**
   * Return the current consent record for a user, or null if none exists.
   */
  getConsent(userId: string, tenantId: string): UserConsentRecord | null {
    return this._findUserConsent(userId, tenantId) ?? null;
  }

  // -------------------------------------------------------------------------
  // Withdraw consent
  // -------------------------------------------------------------------------

  /**
   * Withdraw consent for a specific category.
   * Mandatory categories cannot be withdrawn.
   */
  withdrawConsent(
    userId: string,
    tenantId: string,
    category: ConsentCategory,
    reason?: string
  ): UserConsentRecord {
    const record = this._findUserConsent(userId, tenantId);
    if (!record) {
      throw new Error(`No consent record found for user ${userId}`);
    }

    const config = this.getConsentConfig(tenantId);
    const categoryConfig = config.categories.find((c) => c.id === category);
    if (categoryConfig?.mandatory) {
      throw new Error(`Category "${category}" is mandatory and cannot be withdrawn`);
    }

    const withdrawal: ConsentWithdrawal = {
      id: randomUUID(),
      category,
      withdrawnAt: new Date().toISOString(),
      reason,
    };

    const updated: UserConsentRecord = {
      ...record,
      choices: { ...record.choices, [category]: false },
      withdrawals: [...record.withdrawals, withdrawal],
    };

    this.userConsents.set(this._consentKey(userId, tenantId), updated);
    return updated;
  }

  // -------------------------------------------------------------------------
  // Consent check
  // -------------------------------------------------------------------------

  /**
   * Verify that a user has consented to a specific purpose before data
   * processing. Returns false if no consent record exists or consent was
   * withdrawn.
   */
  checkConsent(userId: string, tenantId: string, purpose: ConsentPurpose): boolean {
    const record = this._findUserConsent(userId, tenantId);
    if (!record) return false;

    const config = this.getConsentConfig(tenantId);

    // Find which category covers this purpose
    const category = config.categories.find((c) => c.purposes.includes(purpose));
    if (!category) return false;

    // Necessary category is always consented
    if (category.mandatory) return true;

    return record.choices[category.id] === true;
  }

  // -------------------------------------------------------------------------
  // Analytics report
  // -------------------------------------------------------------------------

  /**
   * Generate a consent analytics report for a period.
   */
  getConsentReport(tenantId: string, period: { from: string; to: string }): ConsentReport {
    const fromDate = new Date(period.from);
    const toDate = new Date(period.to);

    const tenantRecords = Array.from(this.userConsents.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        new Date(r.consentedAt) >= fromDate &&
        new Date(r.consentedAt) <= toDate
    );

    const totalUsers = tenantRecords.length;
    const consentedUsers = tenantRecords.filter((r) =>
      Object.values(r.choices).some(Boolean)
    ).length;

    const categories: ConsentCategory[] = [
      'necessary', 'analytics', 'marketing', 'preferences', 'third_party',
    ];

    const optInRates: Record<ConsentCategory, number> = {} as Record<ConsentCategory, number>;
    const withdrawalRates: Record<ConsentCategory, number> = {} as Record<ConsentCategory, number>;

    for (const cat of categories) {
      const opted = tenantRecords.filter((r) => r.choices[cat] === true).length;
      optInRates[cat] = totalUsers > 0 ? opted / totalUsers : 0;

      const withdrawn = tenantRecords.filter((r) =>
        r.withdrawals.some((w) => w.category === cat)
      ).length;
      withdrawalRates[cat] = totalUsers > 0 ? withdrawn / totalUsers : 0;
    }

    // Aggregate withdrawal reasons
    const reasonCounts: Record<string, number> = {};
    for (const record of tenantRecords) {
      for (const w of record.withdrawals) {
        if (w.reason) {
          reasonCounts[w.reason] = (reasonCounts[w.reason] ?? 0) + 1;
        }
      }
    }
    const topWithdrawalReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    // Average consent age in days
    const now = Date.now();
    const avgAge =
      totalUsers > 0
        ? tenantRecords.reduce((sum, r) => {
            const ageMs = now - new Date(r.consentedAt).getTime();
            return sum + ageMs / 86_400_000;
          }, 0) / totalUsers
        : 0;

    return {
      period,
      tenantId,
      totalUsers,
      consentedUsers,
      optInRates,
      withdrawalRates,
      topWithdrawalReasons,
      averageConsentAge: Math.round(avgAge * 10) / 10,
    };
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private _consentKey(userId: string, tenantId: string): string {
    return `${tenantId}::${userId}`;
  }

  private _findUserConsent(
    userId: string,
    tenantId: string
  ): UserConsentRecord | undefined {
    return this.userConsents.get(this._consentKey(userId, tenantId));
  }

  /**
   * Delete all consent records for a user (right to erasure / GDPR Art. 17).
   */
  deleteUserConsent(userId: string, tenantId: string): boolean {
    return this.userConsents.delete(this._consentKey(userId, tenantId));
  }
}
