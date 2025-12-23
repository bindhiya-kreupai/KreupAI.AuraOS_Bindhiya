/**
 * Attendance Service
 * Handles attendance check-in/out and records
 */

import { apiService } from './api.service';
import { AttendanceRecord, AttendanceSummary, GeoLocation } from '@/types';

interface CheckInRequest {
  location?: GeoLocation;
  photo?: string;
  method?: 'app' | 'biometric' | 'manual';
  notes?: string;
}

interface CheckInResponse {
  success: boolean;
  record: AttendanceRecord;
  message: string;
}

class AttendanceService {
  /**
   * Get today's attendance record
   */
  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    const response = await apiService.get<{ data: AttendanceRecord | null }>('/attendance/today');
    return response.data;
  }

  /**
   * Check in
   */
  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    return apiService.post<CheckInResponse>('/attendance/check-in', data);
  }

  /**
   * Check out
   */
  async checkOut(data: CheckInRequest): Promise<CheckInResponse> {
    return apiService.post<CheckInResponse>('/attendance/check-out', data);
  }

  /**
   * Get attendance history
   */
  async getHistory(params: {
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: AttendanceRecord[];
    total: number;
    page: number;
    pages: number;
  }> {
    return apiService.get('/attendance/history', params);
  }

  /**
   * Get attendance summary for a month
   */
  async getSummary(month: number, year: number): Promise<AttendanceSummary> {
    return apiService.get('/attendance/summary', { month, year });
  }

  /**
   * Get attendance record by ID
   */
  async getRecord(recordId: string): Promise<AttendanceRecord> {
    return apiService.get(`/attendance/${recordId}`);
  }

  /**
   * Request attendance correction
   */
  async requestCorrection(
    recordId: string,
    data: {
      correctionType: 'check_in' | 'check_out' | 'both';
      requestedTime: string;
      reason: string;
    }
  ): Promise<{ message: string; requestId: string }> {
    return apiService.post(`/attendance/${recordId}/correction`, data);
  }

  /**
   * Get team attendance (for managers)
   */
  async getTeamAttendance(date: string): Promise<{
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    records: AttendanceRecord[];
  }> {
    return apiService.get('/attendance/team', { date });
  }

  /**
   * Get work locations for geo-fencing
   */
  async getWorkLocations(): Promise<{
    locations: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
    }[];
  }> {
    return apiService.get('/attendance/locations');
  }

  /**
   * Validate location for check-in
   */
  async validateLocation(location: GeoLocation): Promise<{
    valid: boolean;
    locationName?: string;
    distance?: number;
  }> {
    return apiService.post('/attendance/validate-location', location);
  }
}

export const attendanceService = new AttendanceService();
