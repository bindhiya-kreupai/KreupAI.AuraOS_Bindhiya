export interface CalendarConfig {
  provider: 'google' | 'outlook';
  credentials: Record<string, string>;
  calendarId?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface FindSlotsParams {
  startDate: string;
  endDate: string;
  duration: number; // minutes
  attendees?: string[];
  workingHoursOnly?: boolean;
}

export interface CreateEventParams {
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees?: EventAttendee[];
  location?: string;
  recurrence?: RecurrenceRule;
  reminders?: Reminder[];
}

export interface EventAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  count?: number;
  until?: string;
  daysOfWeek?: string[];
}

export interface Reminder {
  method: 'email' | 'popup';
  minutesBefore: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees: EventAttendee[];
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
}

export interface CreateEventResult {
  success: boolean;
  event?: CalendarEvent;
  error?: string;
}

export class CalendarService {
  private config: CalendarConfig | null = null;

  /**
   * Initialize the calendar service with provider credentials
   */
  initialize(config: CalendarConfig): void {
    this.config = config;
  }

  /**
   * Find available time slots across attendees
   */
  async findAvailableSlots(params: FindSlotsParams): Promise<TimeSlot[]> {
    this.ensureInitialized();

    // TODO: Implement with Google Calendar API / Microsoft Graph API
    // Fetch free/busy information for all attendees
    // Calculate overlapping available slots
    // Filter by working hours if requested

    const slots: TimeSlot[] = [];
    return slots;
  }

  /**
   * Create a calendar event
   */
  async createEvent(params: CreateEventParams): Promise<CreateEventResult> {
    this.ensureInitialized();

    try {
      // TODO: Implement with Google Calendar API / Microsoft Graph API
      const event: CalendarEvent = {
        id: 'evt_' + Date.now().toString(),
        title: params.title,
        description: params.description,
        start: params.start,
        end: params.end,
        attendees: params.attendees || [],
        location: params.location,
        status: 'confirmed',
      };

      return { success: true, event };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, updates: Partial<CreateEventParams>): Promise<CreateEventResult> {
    this.ensureInitialized();

    // TODO: Implement with provider API
    return {
      success: true,
      event: {
        id: eventId,
        title: updates.title || '',
        start: updates.start || '',
        end: updates.end || '',
        attendees: updates.attendees || [],
        status: 'confirmed',
      },
    };
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    this.ensureInitialized();

    // TODO: Implement with provider API
    return true;
  }

  /**
   * List events in a date range
   */
  async listEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    this.ensureInitialized();

    // TODO: Implement with provider API
    return [];
  }

  private ensureInitialized(): void {
    if (!this.config) {
      throw new Error('CalendarService not initialized. Call initialize() first.');
    }
  }
}

export default new CalendarService();
