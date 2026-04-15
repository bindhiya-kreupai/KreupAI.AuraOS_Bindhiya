/**
 * @api POST /api/v1/benefits/life-event
 * @description Qualifying life event trigger for special enrollment
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

interface QualifyingLifeEvent {
  id: string;
  employeeId: string;
  eventType: string;
  eventDate: string;
  reportedDate: string;
  enrollmentWindowStart: string;
  enrollmentWindowEnd: string;
  daysRemaining: number;
  status: 'pending_verification' | 'approved' | 'rejected' | 'expired';
  allowedChanges: string[];
  requiredDocuments: string[];
  documentSubmitted: boolean;
  notes?: string;
}

const QUALIFYING_EVENT_TYPES = [
  'marriage',
  'divorce',
  'birth_adoption',
  'death_of_dependent',
  'loss_of_coverage',
  'gain_of_coverage',
  'relocation',
  'employment_status_change',
  'legal_guardianship',
  'court_order',
] as const;

const EVENT_WINDOWS: Record<string, number> = {
  marriage: 30,
  divorce: 30,
  birth_adoption: 30,
  death_of_dependent: 30,
  loss_of_coverage: 60,
  gain_of_coverage: 30,
  relocation: 30,
  employment_status_change: 30,
  legal_guardianship: 30,
  court_order: 30,
};

const EVENT_ALLOWED_CHANGES: Record<string, string[]> = {
  marriage: ['add_spouse', 'change_coverage_level', 'add_plan', 'change_plan'],
  divorce: ['remove_spouse', 'change_coverage_level', 'drop_plan'],
  birth_adoption: ['add_dependent', 'change_coverage_level', 'add_plan'],
  death_of_dependent: ['remove_dependent', 'change_coverage_level', 'drop_plan'],
  loss_of_coverage: ['add_plan', 'change_plan', 'change_coverage_level'],
  gain_of_coverage: ['drop_plan', 'change_coverage_level'],
  relocation: ['change_plan', 'add_plan', 'drop_plan'],
  employment_status_change: ['add_plan', 'drop_plan', 'change_coverage_level'],
  legal_guardianship: ['add_dependent', 'change_coverage_level', 'add_plan'],
  court_order: ['add_dependent', 'remove_dependent', 'change_coverage_level'],
};

const EVENT_REQUIRED_DOCS: Record<string, string[]> = {
  marriage: ['Marriage certificate'],
  divorce: ['Divorce decree or court order'],
  birth_adoption: ['Birth certificate or adoption papers'],
  death_of_dependent: ['Death certificate'],
  loss_of_coverage: ['Loss of coverage letter or COBRA notice'],
  gain_of_coverage: ['Proof of new coverage'],
  relocation: ['Proof of new address'],
  employment_status_change: ['Employment status change letter'],
  legal_guardianship: ['Court order for guardianship'],
  court_order: ['Court order documentation'],
};

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  try {
    const body = await request.json();
    const { eventType, eventDate, _dependentName, _dependentRelationship, notes, documentUrl } =
      body;

    if (!eventType || !eventDate) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Fields eventType and eventDate are required',
        },
        { status: 400 }
      );
    }

    if (!QUALIFYING_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Invalid eventType. Must be one of: ${QUALIFYING_EVENT_TYPES.join(', ')}`,
          validTypes: QUALIFYING_EVENT_TYPES,
        },
        { status: 422 }
      );
    }

    // Check if event date is within allowable reporting window (60 days from event)
    const eventDateParsed = new Date(eventDate);
    const now = new Date();
    const daysSinceEvent = Math.floor(
      (now.getTime() - eventDateParsed.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceEvent > 60) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Qualifying life event must be reported within 60 days of the event date',
          daysSinceEvent,
          maxReportingDays: 60,
        },
        { status: 422 }
      );
    }

    if (eventDateParsed > now) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Event date cannot be in the future',
        },
        { status: 422 }
      );
    }

    // Calculate enrollment window
    const windowDays = EVENT_WINDOWS[eventType] || 30;
    const enrollmentWindowEnd = new Date(eventDateParsed);
    enrollmentWindowEnd.setDate(enrollmentWindowEnd.getDate() + windowDays);
    const daysRemaining = Math.max(
      0,
      Math.floor((enrollmentWindowEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const lifeEvent: QualifyingLifeEvent = {
      id: 'qle-' + Date.now().toString(36),
      employeeId: 'emp-001',
      eventType,
      eventDate,
      reportedDate: now.toISOString(),
      enrollmentWindowStart: eventDateParsed.toISOString(),
      enrollmentWindowEnd: enrollmentWindowEnd.toISOString(),
      daysRemaining,
      status: documentUrl ? 'pending_verification' : 'pending_verification',
      allowedChanges: EVENT_ALLOWED_CHANGES[eventType] || [],
      requiredDocuments: EVENT_REQUIRED_DOCS[eventType] || [],
      documentSubmitted: !!documentUrl,
      notes,
    };

    return NextResponse.json(
      {
        data: lifeEvent,
        message: `Qualifying life event "${eventType}" has been reported. You have ${daysRemaining} days remaining to make benefit changes.`,
        nextSteps: [
          ...(documentUrl
            ? []
            : [
                `Upload required documentation: ${(EVENT_REQUIRED_DOCS[eventType] || []).join(', ')}`,
              ]),
          'Review and update your benefit elections',
          'Changes will take effect on the event date or the first of the following month',
        ],
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
});
