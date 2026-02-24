/**
 * @module LifeEventManager
 * @description ESS Life Event Manager — event type selector and status overview
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Heart,
  Baby,
  UserMinus,
  MapPin,
  ShieldOff,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Loader2,
  History,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LifeEventWizard } from './LifeEventWizard';

// ── Types ──────────────────────────────────────────────────────────────────────

export type LifeEventType =
  | 'marriage_divorce'
  | 'birth_adoption'
  | 'death_of_dependent'
  | 'address_change'
  | 'loss_of_coverage';

export interface LifeEventTypeConfig {
  type: LifeEventType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  benefitImpact: string;
  enrollmentWindow: string;
  requiredDocs: string[];
}

export interface SubmittedLifeEvent {
  id: string;
  type: LifeEventType;
  eventDate: string;
  submittedDate: string;
  status: 'pending' | 'verified' | 'processing' | 'completed' | 'denied';
  description: string;
}

// ── Event Type Configurations ─────────────────────────────────────────────────

export const LIFE_EVENT_CONFIGS: LifeEventTypeConfig[] = [
  {
    type: 'marriage_divorce',
    label: 'Marriage / Divorce',
    description:
      'Report a marriage or divorce. This triggers a special enrollment period for benefit changes.',
    icon: Heart,
    color: 'text-quantum-rose',
    bgColor: 'bg-quantum-rose/10',
    benefitImpact:
      'Add or remove spouse from benefits. Change coverage level. Update tax withholding.',
    enrollmentWindow: '30 days from event date',
    requiredDocs: [
      'Marriage certificate or divorce decree',
      'Spouse SSN (for adding)',
      'Updated W-4 form',
    ],
  },
  {
    type: 'birth_adoption',
    label: 'Birth / Adoption',
    description:
      'Report a birth or adoption of a child. Qualify for dependent coverage enrollment.',
    icon: Baby,
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/10',
    benefitImpact:
      'Add child to health, dental, and vision plans. Update coverage level. FSA/HSA changes.',
    enrollmentWindow: '30 days from birth/adoption date',
    requiredDocs: [
      'Birth certificate or adoption decree',
      'Child SSN (when available)',
      'Hospital verification letter',
    ],
  },
  {
    type: 'death_of_dependent',
    label: 'Death of Dependent',
    description: 'Report the passing of a covered dependent. Adjust coverage and beneficiaries.',
    icon: UserMinus,
    color: 'text-silver-mist',
    bgColor: 'bg-silver-mist/10',
    benefitImpact:
      'Remove dependent from plans. Adjust coverage level. Update life insurance beneficiaries.',
    enrollmentWindow: '30 days from event date',
    requiredDocs: ['Death certificate', 'Updated beneficiary designation form'],
  },
  {
    type: 'address_change',
    label: 'Address Change',
    description:
      'Report a change of address. May affect plan network availability and tax withholding.',
    icon: MapPin,
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
    benefitImpact:
      'May change available provider networks. Update state tax withholding. Verify plan availability.',
    enrollmentWindow: '60 days if moving out of service area',
    requiredDocs: [
      'Proof of new address (utility bill, lease agreement)',
      'Updated W-4 if changing state',
    ],
  },
  {
    type: 'loss_of_coverage',
    label: 'Loss of Coverage',
    description:
      "Report involuntary loss of other health coverage (e.g., spouse's plan termination).",
    icon: ShieldOff,
    color: 'text-sunset-amber',
    bgColor: 'bg-sunset-amber/10',
    benefitImpact: 'Enroll in or upgrade employer health plans. Add dependents who lost coverage.',
    enrollmentWindow: '60 days from loss of coverage date',
    requiredDocs: [
      'Loss of coverage letter from previous insurer',
      'COBRA notice (if applicable)',
      'Termination of coverage documentation',
    ],
  },
];

// ── Mock Past Events ──────────────────────────────────────────────────────────

const MOCK_PAST_EVENTS: SubmittedLifeEvent[] = [
  {
    id: 'le-001',
    type: 'birth_adoption',
    eventDate: '2024-09-03',
    submittedDate: '2024-09-05',
    status: 'completed',
    description: 'Birth of child — Max Doe',
  },
  {
    id: 'le-002',
    type: 'address_change',
    eventDate: '2024-06-15',
    submittedDate: '2024-06-16',
    status: 'completed',
    description: 'Relocation from Austin, TX to Denver, CO',
  },
];

// ── Status Helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SubmittedLifeEvent['status'],
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: { label: 'Pending Review', color: 'text-sunset-amber bg-sunset-amber/10', icon: Clock },
  verified: {
    label: 'Verified',
    color: 'text-celestial-indigo bg-celestial-indigo/10',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    color: 'text-nebula-purple bg-nebula-purple/10',
    icon: Loader2,
  },
  completed: {
    label: 'Completed',
    color: 'text-neural-mint bg-neural-mint/10',
    icon: CheckCircle2,
  },
  denied: { label: 'Denied', color: 'text-coral-alert bg-coral-alert/10', icon: AlertTriangle },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const LifeEventManager: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<LifeEventType | null>(null);
  const [pastEvents] = useState<SubmittedLifeEvent[]>(MOCK_PAST_EVENTS);

  const handleSelectEvent = useCallback((type: LifeEventType) => {
    setSelectedEvent(type);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // If a wizard is active, show it
  if (selectedEvent) {
    const config = LIFE_EVENT_CONFIGS.find((c) => c.type === selectedEvent)!;
    return (
      <LifeEventWizard
        eventConfig={config}
        onClose={handleCloseWizard}
        onSubmitted={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Type Cards */}
      <div>
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3">
          Report a Life Event
        </h3>
        <p className="text-xs text-silver-mist mb-4">
          Life events may qualify you for a special enrollment period to make changes to your
          benefits outside the annual open enrollment window.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {LIFE_EVENT_CONFIGS.map((config) => {
            const Icon = config.icon;
            return (
              <button
                key={config.type}
                onClick={() => handleSelectEvent(config.type)}
                className="flex items-start gap-3 p-4 rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/50 hover:shadow-sm text-left transition-all group"
              >
                <div className={`p-2.5 rounded-xl ${config.bgColor} shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {config.label}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-silver-mist/50 group-hover:text-celestial-indigo transition-colors shrink-0" />
                  </div>
                  <p className="text-[10px] text-silver-mist mt-1 leading-relaxed line-clamp-2">
                    {config.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-2.5 h-2.5 text-sunset-amber" />
                    <span className="text-[9px] text-sunset-amber font-medium">
                      {config.enrollmentWindow}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Past Life Events */}
      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-celestial-indigo" />
            Previous Life Events
          </h3>
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 divide-y divide-cloud/50 dark:divide-nebula-purple/20">
            {pastEvents.map((event) => {
              const config = LIFE_EVENT_CONFIGS.find((c) => c.type === event.type);
              const statusCfg = STATUS_CONFIG[event.status];
              const StatusIcon = statusCfg.icon;
              const EventIcon = config?.icon || FileText;

              return (
                <div key={event.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${config?.bgColor || 'bg-pearl'}`}>
                      <EventIcon className={`w-4 h-4 ${config?.color || 'text-silver-mist'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                        {config?.label || event.type}
                      </p>
                      <p className="text-[10px] text-silver-mist mt-0.5">{event.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[9px] text-silver-mist/70">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">Important</p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            Life events must be reported within the qualifying period shown above. Late submissions
            may not be eligible for benefit changes. Contact HR if you have questions about your
            specific situation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeEventManager;
