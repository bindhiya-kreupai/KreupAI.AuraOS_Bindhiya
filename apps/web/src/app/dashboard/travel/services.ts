// Travel Management Services
import type { TravelRequest, TravelBooking, TravelPolicy, TravelMetrics, TravelSettings } from './types';

const STORAGE_KEYS = {
  REQUESTS: 'travel_requests',
  BOOKINGS: 'travel_bookings',
  POLICIES: 'travel_policies',
  METRICS: 'travel_metrics',
  SETTINGS: 'travel_settings',
};

export class TravelRequestService {
  static async getRequests(filters?: { employeeId?: string; status?: string }): Promise<TravelRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    let requests: TravelRequest[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.employeeId) requests = requests.filter(r => r.employeeId === filters.employeeId);
      if (filters.status) requests = requests.filter(r => r.status === filters.status);
    }
    return requests;
  }

  static async submitRequest(request: TravelRequest): Promise<TravelRequest> {
    const requests = await this.getRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return request;
  }

  static async updateRequest(id: string, updates: Partial<TravelRequest>): Promise<TravelRequest> {
    const requests = await this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');
    requests[index] = { ...requests[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return requests[index];
  }

  static async approveRequest(id: string, approverId: string): Promise<TravelRequest> {
    return this.updateRequest(id, { status: 'approved', approvedDate: new Date().toISOString() });
  }

  static async rejectRequest(id: string, approverId: string, reason: string): Promise<TravelRequest> {
    return this.updateRequest(id, { status: 'rejected' });
  }

  static async cancelRequest(id: string, reason: string): Promise<TravelRequest> {
    return this.updateRequest(id, { status: 'cancelled' });
  }
}

export class TravelBookingService {
  static async createBooking(booking: TravelBooking): Promise<TravelBooking> {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const bookings: TravelBooking[] = data ? JSON.parse(data) : [];
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return booking;
  }

  static async confirmBooking(id: string, reference: string): Promise<TravelBooking> {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const bookings: TravelBooking[] = data ? JSON.parse(data) : [];
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    bookings[index] = { ...bookings[index], status: 'confirmed', bookingReference: reference };
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return bookings[index];
  }
}

export class TravelAnalyticsService {
  static async getMetrics(): Promise<TravelMetrics> {
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalRequests: 0, approvedRequests: 0, rejectedRequests: 0, totalTravelCost: 0,
      averageTravelCost: 0, travelByPurpose: [], travelByDepartment: [], topTravelers: []
    };
  }
}

export class TravelSettingsService {
  static async getSettings(): Promise<TravelSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      requireApproval: true, approvalLevels: 2, allowSelfBooking: false,
      advanceAllowed: true, maxAdvancePercentage: 80, travelAgencyIntegration: false,
      notificationEmail: 'travel@company.com'
    };
  }

  static async updateSettings(updates: Partial<TravelSettings>): Promise<TravelSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
