/**
 * Data Breach Notification Automation
 *
 * Orchestrates the breach response lifecycle from initial detection through
 * regulatory notifications (GDPR 72h, CCPA expedient, UAE PDPL) and
 * individual subject notifications.
 *
 * @module @aura/security
 * @see https://gdpr-info.eu/art-33-gdpr/
 * @see https://oag.ca.gov/privacy/ccpa
 * @see https://u.ae/en/information-and-services/justice-safety-and-the-law/cyber-safety-and-security/personal-data-protection-law
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BreachSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DataCategory =
  | 'personal_identification'
  | 'financial'
  | 'health'
  | 'biometric'
  | 'credentials'
  | 'location'
  | 'communications'
  | 'sensitive_special_category';

export type Jurisdiction = 'GDPR' | 'CCPA' | 'UAE_PDPL' | 'KSA_PDPL' | 'INDIA_PDPB';

export interface BreachIncident {
  title: string;
  description: string;
  discoveredAt: string;
  attackVector?: string;
  estimatedAffectedSubjects: number;
  affectedDataCategories: DataCategory[];
  severity: BreachSeverity;
  tenantId: string;
  reportedBy: string;
  affectedSystems: string[];
  jurisdictions: Jurisdiction[];
}

export interface BreachRecord {
  id: string;
  status: 'open' | 'investigating' | 'contained' | 'closed';
  incident: BreachIncident;
  createdAt: string;
  timeline: BreachTimelineEntry[];
  notificationsSent: BreachNotificationRecord[];
  containmentMeasures: string[];
  impactAssessment?: ImpactAssessment;
}

export interface ImpactAssessment {
  confirmedAffectedSubjects: number;
  dataCategories: DataCategory[];
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  likelyhoodOfHarm: string;
  potentialConsequences: string[];
  containmentStatus: 'contained' | 'ongoing' | 'unknown';
  assessedAt: string;
  assessedBy: string;
}

export interface BreachTimelineEntry {
  timestamp: string;
  event: string;
  actor?: string;
  details?: Record<string, unknown>;
}

export interface BreachNotificationRecord {
  id: string;
  type: 'dpa' | 'data_subject' | 'internal' | 'media';
  jurisdiction: Jurisdiction;
  recipient: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'failed';
  content: string;
}

export interface DPANotification {
  breachId: string;
  authority: string;
  jurisdiction: Jurisdiction;
  notificationDeadline: string;
  hoursRemaining: number;
  template: string;
}

export interface SubjectNotification {
  breachId: string;
  subjectCount: number;
  channels: string[];
  template: string;
  notificationDeadline: string;
}

export interface NotificationDeadlines {
  jurisdiction: Jurisdiction;
  dpaDeadline?: string;
  dpaHoursAllowed?: number;
  subjectDeadline?: string;
  subjectDeadlineDescription: string;
  isOverdue: boolean;
}

// ---------------------------------------------------------------------------
// Breach Notification Manager
// ---------------------------------------------------------------------------

export class BreachNotificationManager {
  private readonly breaches: Map<string, BreachRecord> = new Map();

  // -------------------------------------------------------------------------
  // Initiate breach response
  // -------------------------------------------------------------------------

  /**
   * Record a new data breach and start the response clock.
   */
  initiateBreachResponse(incident: BreachIncident): BreachRecord {
    const id = randomUUID();
    const now = new Date().toISOString();

    const record: BreachRecord = {
      id,
      status: 'open',
      incident,
      createdAt: now,
      containmentMeasures: [],
      notificationsSent: [],
      timeline: [
        {
          timestamp: now,
          event: 'Breach incident recorded',
          actor: incident.reportedBy,
          details: {
            severity: incident.severity,
            estimatedAffected: incident.estimatedAffectedSubjects,
          },
        },
      ],
    };

    this.breaches.set(id, record);
    return record;
  }

  // -------------------------------------------------------------------------
  // Impact assessment
  // -------------------------------------------------------------------------

  /**
   * Perform impact assessment for the breach.
   */
  assessImpact(
    breachId: string,
    assessment: Omit<ImpactAssessment, 'assessedAt'>
  ): BreachRecord {
    const record = this._getOrThrow(breachId);
    const now = new Date().toISOString();

    const fullAssessment: ImpactAssessment = { ...assessment, assessedAt: now };

    const updated: BreachRecord = {
      ...record,
      status: 'investigating',
      impactAssessment: fullAssessment,
      timeline: [
        ...record.timeline,
        {
          timestamp: now,
          event: 'Impact assessment completed',
          actor: assessment.assessedBy,
          details: {
            confirmedAffected: assessment.confirmedAffectedSubjects,
            riskLevel: assessment.riskLevel,
            containmentStatus: assessment.containmentStatus,
          },
        },
      ],
    };

    this.breaches.set(breachId, updated);
    return updated;
  }

  // -------------------------------------------------------------------------
  // DPA notification
  // -------------------------------------------------------------------------

  /**
   * Generate a GDPR Article 33 / UAE PDPL DPA notification.
   *
   * GDPR: Must notify the supervisory authority within 72 hours of discovery
   * unless the breach is unlikely to result in a risk to individuals' rights.
   */
  generateNotification(breachId: string, jurisdiction: Jurisdiction): DPANotification {
    const record = this._getOrThrow(breachId);
    const discoveredAt = new Date(record.incident.discoveredAt);
    const now = new Date();
    const elapsedHours = (now.getTime() - discoveredAt.getTime()) / 3_600_000;

    const deadlineHours = this._getDPADeadlineHours(jurisdiction);
    const deadlineDate = new Date(discoveredAt.getTime() + deadlineHours * 3_600_000);
    const hoursRemaining = Math.max(0, (deadlineDate.getTime() - now.getTime()) / 3_600_000);

    const authority = this._getAuthorityName(jurisdiction);

    const template = this._buildDPATemplate(record, jurisdiction, authority, deadlineDate);

    return {
      breachId,
      authority,
      jurisdiction,
      notificationDeadline: deadlineDate.toISOString(),
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      template,
    };
  }

  // -------------------------------------------------------------------------
  // Subject notification
  // -------------------------------------------------------------------------

  /**
   * Generate individual data subject notifications per GDPR Article 34 /
   * equivalent regulations.
   */
  generateSubjectNotification(breachId: string): SubjectNotification {
    const record = this._getOrThrow(breachId);
    const discoveredAt = new Date(record.incident.discoveredAt);
    const now = new Date();
    const elapsedHours = (now.getTime() - discoveredAt.getTime()) / 3_600_000;

    // Subject notification deadlines vary by jurisdiction
    const primaryJurisdiction = record.incident.jurisdictions[0] ?? 'GDPR';
    const deadlineHours = primaryJurisdiction === 'CCPA' ? 168 /* CCPA: ~expedient, 7 days */ : 720; // 30 days
    const deadlineDate = new Date(discoveredAt.getTime() + deadlineHours * 3_600_000);

    const template = `Dear Data Subject,

We are writing to inform you of a personal data breach that may affect you.

WHAT HAPPENED:
${record.incident.description}

WHAT DATA WAS INVOLVED:
${record.incident.affectedDataCategories.join(', ')}

WHAT WE ARE DOING:
We have initiated a full investigation and taken the following containment measures:
${record.containmentMeasures.map((m) => `- ${m}`).join('\n') || '- Investigation ongoing'}

WHAT YOU CAN DO:
- Monitor your accounts for suspicious activity
- Change your passwords if credentials may be affected
- Contact our Data Protection Officer at: dpo@auraos.app

Date of discovery: ${record.incident.discoveredAt}
Estimated affected individuals: ${record.incident.estimatedAffectedSubjects}

Yours sincerely,
AuraOS Data Protection Team
`;

    return {
      breachId,
      subjectCount: record.incident.estimatedAffectedSubjects,
      channels: ['email', 'in_app', 'postal'],
      template,
      notificationDeadline: deadlineDate.toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // Timeline
  // -------------------------------------------------------------------------

  getBreachTimeline(breachId: string): BreachTimelineEntry[] {
    return this._getOrThrow(breachId).timeline;
  }

  // -------------------------------------------------------------------------
  // Regulatory deadlines
  // -------------------------------------------------------------------------

  /**
   * Return notification deadlines for all applicable jurisdictions.
   */
  getNotificationDeadlines(breachId: string): NotificationDeadlines[] {
    const record = this._getOrThrow(breachId);
    const discoveredAt = new Date(record.incident.discoveredAt);
    const now = new Date();

    return record.incident.jurisdictions.map((jurisdiction): NotificationDeadlines => {
      const dpaHours = this._getDPADeadlineHours(jurisdiction);
      const dpaDeadline = dpaHours
        ? new Date(discoveredAt.getTime() + dpaHours * 3_600_000)
        : null;

      const isOverdue = dpaDeadline ? now > dpaDeadline : false;

      return {
        jurisdiction,
        dpaDeadline: dpaDeadline?.toISOString(),
        dpaHoursAllowed: dpaHours ?? undefined,
        subjectDeadlineDescription: this._getSubjectDeadlineDescription(jurisdiction),
        isOverdue,
      };
    });
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private _getOrThrow(breachId: string): BreachRecord {
    const record = this.breaches.get(breachId);
    if (!record) throw new Error(`Breach record ${breachId} not found`);
    return record;
  }

  private _getDPADeadlineHours(jurisdiction: Jurisdiction): number | null {
    const deadlines: Partial<Record<Jurisdiction, number>> = {
      GDPR:      72,    // Art. 33 GDPR
      CCPA:      72,    // AG notification (varies; using 72h as safe default)
      UAE_PDPL:  72,    // UAE PDPL Article 12
      KSA_PDPL:  72,    // KSA PDPL implementing regulations
      INDIA_PDPB: 72,   // DPDP Act 2023 (proposed)
    };
    return deadlines[jurisdiction] ?? null;
  }

  private _getSubjectDeadlineDescription(jurisdiction: Jurisdiction): string {
    const descriptions: Record<Jurisdiction, string> = {
      GDPR:       'Without undue delay when high risk to rights and freedoms (GDPR Art. 34)',
      CCPA:       'Expedient and without unreasonable delay (Cal. Civ. Code 1798.82)',
      UAE_PDPL:   'As soon as reasonably practicable after containment (UAE PDPL)',
      KSA_PDPL:   'Within 72 hours of discovery (KSA PDPL Implementing Regulations)',
      INDIA_PDPB: 'As soon as possible and within 72 hours (DPDP Act 2023)',
    };
    return descriptions[jurisdiction];
  }

  private _getAuthorityName(jurisdiction: Jurisdiction): string {
    const authorities: Record<Jurisdiction, string> = {
      GDPR:       'Lead Supervisory Authority (Competent DPA)',
      CCPA:       'California Attorney General',
      UAE_PDPL:   'UAE Data Office (UDO)',
      KSA_PDPL:   'Saudi Data & AI Authority (SDAIA)',
      INDIA_PDPB: 'Data Protection Board of India',
    };
    return authorities[jurisdiction];
  }

  private _buildDPATemplate(
    record: BreachRecord,
    jurisdiction: Jurisdiction,
    authority: string,
    deadline: Date
  ): string {
    return `PERSONAL DATA BREACH NOTIFICATION
To: ${authority}
Re: Data Breach Notification — ${jurisdiction}
Notification Deadline: ${deadline.toISOString()}

1. NATURE OF BREACH:
${record.incident.description}

2. DATA SUBJECTS AFFECTED (estimated):
${record.incident.estimatedAffectedSubjects} individuals

3. DATA CATEGORIES AFFECTED:
${record.incident.affectedDataCategories.join(', ')}

4. LIKELY CONSEQUENCES:
${record.impactAssessment?.potentialConsequences?.join('\n') ?? 'Under assessment'}

5. MEASURES TAKEN:
${record.containmentMeasures.map((m) => `- ${m}`).join('\n') || '- Investigation initiated, containment in progress'}

6. CONTACT:
Data Protection Officer: dpo@auraos.app
Incident Reference: ${record.id}
Discovery Date: ${record.incident.discoveredAt}

Signed,
AuraOS Data Protection Officer
`;
  }

  /**
   * Return all breach records (for audit purposes).
   */
  getAllBreaches(): BreachRecord[] {
    return Array.from(this.breaches.values());
  }

  getBreachById(breachId: string): BreachRecord | null {
    return this.breaches.get(breachId) ?? null;
  }
}
