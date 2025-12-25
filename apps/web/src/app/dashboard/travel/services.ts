// Travel Management Services - API-integrated using APIClient
import { APIClient } from '@/lib/api-client';
import type { TravelRequest, TravelBooking, TravelPolicy, TravelMetrics, TravelSettings } from './types';

export class TravelRequestService {
  static async getRequests(filters?: { employeeId?: string; status?: string }): Promise<TravelRequest[]> {
    return APIClient.get<TravelRequest[]>('/travel/requests', filters);
  }

  static async submitRequest(request: TravelRequest): Promise<TravelRequest> {
    return APIClient.post<TravelRequest>('/travel/requests', request);
  }

  static async updateRequest(id: string, updates: Partial<TravelRequest>): Promise<TravelRequest> {
    return APIClient.put<TravelRequest>(`/travel/requests/${id}`, updates);
  }

  static async approveRequest(id: string, approverId: string): Promise<TravelRequest> {
    return APIClient.post<TravelRequest>(`/travel/requests/${id}/approve`, { approverId });
  }

  static async rejectRequest(id: string, approverId: string, reason: string): Promise<TravelRequest> {
    return APIClient.post<TravelRequest>(`/travel/requests/${id}/reject`, { approverId, reason });
  }

  static async cancelRequest(id: string, reason: string): Promise<TravelRequest> {
    return APIClient.post<TravelRequest>(`/travel/requests/${id}/cancel`, { reason });
  }
}

export class TravelBookingService {
  static async createBooking(booking: TravelBooking): Promise<TravelBooking> {
    return APIClient.post<TravelBooking>('/travel/bookings', booking);
  }

  static async confirmBooking(id: string, reference: string): Promise<TravelBooking> {
    return APIClient.post<TravelBooking>(`/travel/bookings/${id}/confirm`, { reference });
  }
}

export class TravelAnalyticsService {
  static async getMetrics(): Promise<TravelMetrics> {
    return APIClient.get<TravelMetrics>('/travel/analytics');
  }
}

export class TravelSettingsService {
  static async getSettings(): Promise<TravelSettings> {
    return APIClient.get<TravelSettings>('/travel/settings');
  }

  static async updateSettings(updates: Partial<TravelSettings>): Promise<TravelSettings> {
    return APIClient.put<TravelSettings>('/travel/settings', updates);
  }
}
