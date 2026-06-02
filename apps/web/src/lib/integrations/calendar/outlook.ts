import type { AxiosInstance } from 'axios';
import axios from 'axios';

export type OutlookEvent = {
  id: string;
  subject: string;
  body?: { contentType: string; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { emailAddress: { address: string; name: string }; type: string; status: { response: string } }[];
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
};

export class OutlookCalendarClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
  }

  async listEvents(startDateTime: string, endDateTime: string): Promise<OutlookEvent[]> {
    const { data } = await this.client.get('/me/calendarView', {
      params: { startDateTime, endDateTime, $orderby: 'start/dateTime' },
    });
    return data.value;
  }

  async createEvent(event: { subject: string; start: { dateTime: string; timeZone: string }; end: { dateTime: string; timeZone: string }; attendees?: { emailAddress: { address: string; name: string }; type: string }[]; isOnlineMeeting?: boolean; body?: { contentType: string; content: string } }): Promise<OutlookEvent> {
    const { data } = await this.client.post('/me/events', event);
    return data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.client.delete(`/me/events/${eventId}`);
  }

  async getFreeBusy(emails: string[], startTime: string, endTime: string): Promise<Record<string, { start: string; end: string }[]>> {
    const { data } = await this.client.post('/me/calendar/getSchedule', {
      schedules: emails,
      startTime: { dateTime: startTime, timeZone: 'UTC' },
      endTime: { dateTime: endTime, timeZone: 'UTC' },
      availabilityViewInterval: 30,
    });
    const result: Record<string, { start: string; end: string }[]> = {};
    for (const schedule of data.value) {
      result[schedule.scheduleId] = schedule.scheduleItems
        .filter((item: any) => item.status !== 'free')
        .map((item: any) => ({ start: item.start.dateTime, end: item.end.dateTime }));
    }
    return result;
  }

  async createOnlineMeeting(subject: string, startTime: string, endTime: string, attendees: string[]): Promise<OutlookEvent> {
    return this.createEvent({
      subject,
      start: { dateTime: startTime, timeZone: 'UTC' },
      end: { dateTime: endTime, timeZone: 'UTC' },
      attendees: attendees.map((email) => ({ emailAddress: { address: email, name: '' }, type: 'required' })),
      isOnlineMeeting: true,
      body: { contentType: 'html', content: `<p>Online meeting: ${subject}</p>` },
    });
  }
}
