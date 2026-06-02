import type { AxiosInstance } from 'axios';
import axios from 'axios';

export type GoogleCalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string; responseStatus: string }[];
  status: 'confirmed' | 'tentative' | 'cancelled';
};

export type FreeBusySlot = {
  start: string;
  end: string;
};

export class GoogleCalendarClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/calendar/v3',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
  }

  async listEvents(calendarId: string = 'primary', timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> {
    const { data } = await this.client.get(`/calendars/${calendarId}/events`, {
      params: { timeMin, timeMax, singleEvents: true, orderBy: 'startTime' },
    });
    return data.items;
  }

  async createEvent(calendarId: string = 'primary', event: Omit<GoogleCalendarEvent, 'id' | 'status'>): Promise<GoogleCalendarEvent> {
    const { data } = await this.client.post(`/calendars/${calendarId}/events`, event);
    return data;
  }

  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    await this.client.delete(`/calendars/${calendarId}/events/${eventId}`);
  }

  async getFreeBusy(emails: string[], timeMin: string, timeMax: string): Promise<Record<string, FreeBusySlot[]>> {
    const { data } = await this.client.post('/freeBusy', {
      timeMin,
      timeMax,
      items: emails.map((email) => ({ id: email })),
    });
    const result: Record<string, FreeBusySlot[]> = {};
    for (const [email, calendar] of Object.entries(data.calendars as Record<string, { busy: FreeBusySlot[] }>)) {
      result[email] = calendar.busy;
    }
    return result;
  }

  async findAvailableSlots(emails: string[], date: string, duration: number, workStart: string = '09:00', workEnd: string = '18:00'): Promise<{ start: string; end: string }[]> {
    const timeMin = `${date}T${workStart}:00.000Z`;
    const timeMax = `${date}T${workEnd}:00.000Z`;
    const busySlots = await this.getFreeBusy(emails, timeMin, timeMax);
    const allBusy = Object.values(busySlots).flat().sort((a, b) => a.start.localeCompare(b.start));
    const available: { start: string; end: string }[] = [];
    let current = new Date(timeMin);
    const endOfDay = new Date(timeMax);
    for (const slot of allBusy) {
      const busyStart = new Date(slot.start);
      if (busyStart.getTime() - current.getTime() >= duration * 60000) {
        available.push({ start: current.toISOString(), end: new Date(current.getTime() + duration * 60000).toISOString() });
      }
      current = new Date(Math.max(current.getTime(), new Date(slot.end).getTime()));
    }
    if (endOfDay.getTime() - current.getTime() >= duration * 60000) {
      available.push({ start: current.toISOString(), end: new Date(current.getTime() + duration * 60000).toISOString() });
    }
    return available;
  }
}
