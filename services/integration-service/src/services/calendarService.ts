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
   * Find available time slots across attendees.
   *
   * Not yet implemented — refuses rather than returning [] silently.
   * The previous behaviour ("return empty slots") looked like "no
   * availability found" to the caller, hiding the fact that the
   * provider integration is missing.
   */
  async findAvailableSlots(_params: FindSlotsParams): Promise<TimeSlot[]> {
    this.ensureInitialized();
    throw new Error(this.notImplemented('findAvailableSlots'));
  }

  /**
   * Create a calendar event.
   *
   * Previously returned { success: true } with a fabricated `evt_<timestamp>`
   * id without ever calling a provider. That caused calendar invites for
   * interviews / meetings to silently disappear — neither the host nor the
   * attendees saw anything on their calendars, but the caller assumed success.
   * Returns success: false instead until the provider client is wired.
   */
  async createEvent(_params: CreateEventParams): Promise<CreateEventResult> {
    this.ensureInitialized();
    return {
      success: false,
      error: this.notImplemented('createEvent'),
    };
  }

  /**
   * Update an existing calendar event.
   */
  async updateEvent(_eventId: string, _updates: Partial<CreateEventParams>): Promise<CreateEventResult> {
    this.ensureInitialized();
    return {
      success: false,
      error: this.notImplemented('updateEvent'),
    };
  }

  /**
   * Delete a calendar event.
   */
  async deleteEvent(_eventId: string): Promise<boolean> {
    this.ensureInitialized();
    throw new Error(this.notImplemented('deleteEvent'));
  }

  /**
   * List events in a date range.
   */
  async listEvents(_startDate: string, _endDate: string): Promise<CalendarEvent[]> {
    this.ensureInitialized();
    throw new Error(this.notImplemented('listEvents'));
  }

  private notImplemented(method: string): string {
    const provider = this.config?.provider ?? 'unknown';
    return (
      `CalendarService.${method} is not implemented for provider="${provider}". ` +
      'Wire the Google Calendar API / Microsoft Graph API client before enabling ' +
      'calendar-dependent features (interview scheduling, meeting invites). ' +
      'See issue #39.'
    );
  }

  private ensureInitialized(): void {
    if (!this.config) {
      throw new Error('CalendarService not initialized. Call initialize() first.');
    }
  }
}

export default new CalendarService();
