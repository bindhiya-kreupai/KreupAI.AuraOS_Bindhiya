// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
// Travel Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  TravelRequest, TravelBooking, TravelPolicy, TravelMetrics, TravelSettings,
  TravelItinerary, AccommodationRequest, TransportRequest, TravelAdvance, TravelExpense
} from '../types';
import {
  TravelRequestService, TravelBookingService, TravelAnalyticsService, TravelSettingsService
} from '../services';
import { travelData } from '../data';
import { useToast } from '../components/Toast';

interface UseTravelReturn {
  // State
  requests: TravelRequest[];
  bookings: TravelBooking[];
  policies: TravelPolicy[];
  metrics: TravelMetrics | null;
  settings: TravelSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;

  // Travel Request Methods
  loadRequests: (filters?: { employeeId?: string; status?: string }) => Promise<void>;
  getRequestById: (id: string) => TravelRequest | undefined;
  submitRequest: (request: TravelRequest) => Promise<TravelRequest>;
  updateRequest: (id: string, updates: Partial<TravelRequest>) => Promise<TravelRequest>;
  approveRequest: (id: string, approverId: string) => Promise<TravelRequest>;
  rejectRequest: (id: string, approverId: string, reason: string) => Promise<TravelRequest>;
  cancelRequest: (id: string, reason: string) => Promise<TravelRequest>;

  // Itinerary Methods
  addItinerary: (requestId: string, itinerary: TravelItinerary) => Promise<TravelRequest>;
  updateItinerary: (requestId: string, itineraryId: string, updates: Partial<TravelItinerary>) => Promise<TravelRequest>;
  removeItinerary: (requestId: string, itineraryId: string) => Promise<TravelRequest>;

  // Accommodation Methods
  addAccommodation: (requestId: string, accommodation: AccommodationRequest) => Promise<TravelRequest>;
  updateAccommodation: (requestId: string, accommodationId: string, updates: Partial<AccommodationRequest>) => Promise<TravelRequest>;
  removeAccommodation: (requestId: string, accommodationId: string) => Promise<TravelRequest>;

  // Transport Methods
  addTransport: (requestId: string, transport: TransportRequest) => Promise<TravelRequest>;
  updateTransport: (requestId: string, transportId: string, updates: Partial<TransportRequest>) => Promise<TravelRequest>;
  removeTransport: (requestId: string, transportId: string) => Promise<TravelRequest>;

  // Advance Methods
  requestAdvance: (requestId: string, advance: TravelAdvance) => Promise<TravelRequest>;
  updateAdvance: (requestId: string, updates: Partial<TravelAdvance>) => Promise<TravelRequest>;
  disburseAdvance: (requestId: string, disbursedAmount: number) => Promise<TravelRequest>;
  settleAdvance: (requestId: string, settlementAmount: number) => Promise<TravelRequest>;

  // Booking Methods
  loadBookings: () => Promise<void>;
  createBooking: (booking: TravelBooking) => Promise<TravelBooking>;
  confirmBooking: (id: string, reference: string) => Promise<TravelBooking>;
  cancelBooking: (id: string) => Promise<TravelBooking>;

  // Expense Methods
  addExpense: (requestId: string, expense: TravelExpense) => Promise<TravelRequest>;
  updateExpense: (requestId: string, expenseId: string, updates: Partial<TravelExpense>) => Promise<TravelRequest>;
  removeExpense: (requestId: string, expenseId: string) => Promise<TravelRequest>;

  // Analytics Methods
  loadMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;

  // Settings Methods
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<TravelSettings>) => Promise<void>;

  // Policy Methods
  loadPolicies: () => Promise<void>;
  getApplicablePolicy: (employeeGrade: string) => TravelPolicy | undefined;

  // Helper Methods
  calculateEstimatedCost: (request: TravelRequest) => number;
  calculateActualCost: (request: TravelRequest) => number;
  getTripDuration: (departureDate: string, returnDate: string) => number;
  validateRequest: (request: TravelRequest) => { isValid: boolean; errors: string[] };
  initializeSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useTravel = (): UseTravelReturn => {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [policies, setPolicies] = useState<TravelPolicy[]>([]);
  const [metrics, setMetrics] = useState<TravelMetrics | null>(null);
  const [settings, setSettings] = useState<TravelSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toast = useToast();

  // Travel Request Methods
  const loadRequests = useCallback(async (filters?: { employeeId?: string; status?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TravelRequestService.getRequests(filters);
      setRequests(data);
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to load travel requests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRequestById = useCallback((id: string): TravelRequest | undefined => {
    return requests.find(r => r.id === id);
  }, [requests]);

  const submitRequest = useCallback(async (request: TravelRequest): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      setError(null);
      const created = await TravelRequestService.submitRequest(request);
      setRequests((prev) => [...prev, created]);
      await loadMetrics();
      toast.success('Travel request submitted successfully');
      return created;
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to submit request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateRequest = useCallback(async (id: string, updates: Partial<TravelRequest>): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await TravelRequestService.updateRequest(id, updates);
      setRequests((prev) => prev.map(r => r.id === id ? updated : r));
      await loadMetrics();
      toast.success('Travel request updated successfully');
      return updated;
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to update request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveRequest = useCallback(async (id: string, approverId: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      setError(null);
      const approved = await TravelRequestService.approveRequest(id, approverId);
      setRequests((prev) => prev.map(r => r.id === id ? approved : r));
      await loadMetrics();
      toast.success('Travel request approved successfully');
      return approved;
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to approve request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const rejectRequest = useCallback(async (id: string, approverId: string, reason: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      setError(null);
      const rejected = await TravelRequestService.rejectRequest(id, approverId, reason);
      setRequests((prev) => prev.map(r => r.id === id ? rejected : r));
      await loadMetrics();
      toast.success('Travel request rejected');
      return rejected;
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to reject request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const cancelRequest = useCallback(async (id: string, reason: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      setError(null);
      const cancelled = await TravelRequestService.cancelRequest(id, reason);
      setRequests((prev) => prev.map(r => r.id === id ? cancelled : r));
      await loadMetrics();
      toast.success('Travel request cancelled');
      return cancelled;
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to cancel request: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Itinerary Methods
  const addItinerary = useCallback(async (requestId: string, itinerary: TravelItinerary): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedItinerary = [...request.itinerary, itinerary];
      return await updateRequest(requestId, { itinerary: updatedItinerary });
    } catch (error: any) {
      toast.error(`Failed to add itinerary: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const updateItinerary = useCallback(async (
    requestId: string,
    itineraryId: string,
    updates: Partial<TravelItinerary>
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedItinerary = request.itinerary.map(i =>
        i.id === itineraryId ? { ...i, ...updates } : i
      );
      return await updateRequest(requestId, { itinerary: updatedItinerary });
    } catch (error: any) {
      toast.error(`Failed to update itinerary: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const removeItinerary = useCallback(async (requestId: string, itineraryId: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedItinerary = request.itinerary.filter(i => i.id !== itineraryId);
      return await updateRequest(requestId, { itinerary: updatedItinerary });
    } catch (error: any) {
      toast.error(`Failed to remove itinerary: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  // Accommodation Methods
  const addAccommodation = useCallback(async (
    requestId: string,
    accommodation: AccommodationRequest
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedAccommodation = [...request.accommodation, accommodation];
      return await updateRequest(requestId, { accommodation: updatedAccommodation });
    } catch (error: any) {
      toast.error(`Failed to add accommodation: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const updateAccommodation = useCallback(async (
    requestId: string,
    accommodationId: string,
    updates: Partial<AccommodationRequest>
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedAccommodation = request.accommodation.map(a =>
        a.id === accommodationId ? { ...a, ...updates } : a
      );
      return await updateRequest(requestId, { accommodation: updatedAccommodation });
    } catch (error: any) {
      toast.error(`Failed to update accommodation: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const removeAccommodation = useCallback(async (requestId: string, accommodationId: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedAccommodation = request.accommodation.filter(a => a.id !== accommodationId);
      return await updateRequest(requestId, { accommodation: updatedAccommodation });
    } catch (error: any) {
      toast.error(`Failed to remove accommodation: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  // Transport Methods
  const addTransport = useCallback(async (requestId: string, transport: TransportRequest): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedTransport = [...request.transport, transport];
      return await updateRequest(requestId, { transport: updatedTransport });
    } catch (error: any) {
      toast.error(`Failed to add transport: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const updateTransport = useCallback(async (
    requestId: string,
    transportId: string,
    updates: Partial<TransportRequest>
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedTransport = request.transport.map(t =>
        t.id === transportId ? { ...t, ...updates } : t
      );
      return await updateRequest(requestId, { transport: updatedTransport });
    } catch (error: any) {
      toast.error(`Failed to update transport: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const removeTransport = useCallback(async (requestId: string, transportId: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedTransport = request.transport.filter(t => t.id !== transportId);
      return await updateRequest(requestId, { transport: updatedTransport });
    } catch (error: any) {
      toast.error(`Failed to remove transport: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  // Advance Methods
  const requestAdvance = useCallback(async (requestId: string, advance: TravelAdvance): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      return await updateRequest(requestId, { advance });
    } catch (error: any) {
      toast.error(`Failed to request advance: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [updateRequest, toast]);

  const updateAdvance = useCallback(async (
    requestId: string,
    updates: Partial<TravelAdvance>
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request || !request.advance) throw new Error('Advance not found');

      const updatedAdvance = { ...request.advance, ...updates };
      return await updateRequest(requestId, { advance: updatedAdvance });
    } catch (error: any) {
      toast.error(`Failed to update advance: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const disburseAdvance = useCallback(async (requestId: string, disbursedAmount: number): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request || !request.advance) throw new Error('Advance not found');

      const updatedAdvance: TravelAdvance = {
        ...request.advance,
        approvedAmount: disbursedAmount,
        status: 'disbursed',
        disbursedDate: new Date().toISOString()
      };

      return await updateRequest(requestId, { advance: updatedAdvance });
    } catch (error: any) {
      toast.error(`Failed to disburse advance: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const settleAdvance = useCallback(async (requestId: string, settlementAmount: number): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request || !request.advance) throw new Error('Advance not found');

      const advancedAmount = request.advance.approvedAmount || 0;
      const excess = settlementAmount > advancedAmount ? settlementAmount - advancedAmount : 0;
      const shortfall = settlementAmount < advancedAmount ? advancedAmount - settlementAmount : 0;

      const updatedAdvance: TravelAdvance = {
        ...request.advance,
        status: 'settled',
        settlementDate: new Date().toISOString(),
        settlementAmount,
        excessAmount: excess,
        shortfallAmount: shortfall
      };

      return await updateRequest(requestId, { advance: updatedAdvance });
    } catch (error: any) {
      toast.error(`Failed to settle advance: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  // Booking Methods
  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from an API
      // For now, extract bookings from all requests
      const allBookings = requests.flatMap(r => r.bookings);
      setBookings(allBookings);
    } catch (error: any) {
      setError(error);
      toast.error(`Failed to load bookings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [requests, toast]);

  const createBooking = useCallback(async (booking: TravelBooking): Promise<TravelBooking> => {
    try {
      setIsSaving(true);
      const created = await TravelBookingService.createBooking(booking);
      setBookings((prev) => [...prev, created]);
      toast.success('Booking created successfully');
      return created;
    } catch (error: any) {
      toast.error(`Failed to create booking: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const confirmBooking = useCallback(async (id: string, reference: string): Promise<TravelBooking> => {
    try {
      setIsSaving(true);
      const confirmed = await TravelBookingService.confirmBooking(id, reference);
      setBookings((prev) => prev.map(b => b.id === id ? confirmed : b));
      toast.success('Booking confirmed successfully');
      return confirmed;
    } catch (error: any) {
      toast.error(`Failed to confirm booking: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const cancelBooking = useCallback(async (id: string): Promise<TravelBooking> => {
    try {
      setIsSaving(true);
      // This would call a service method in a real implementation
      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');

      const cancelled: TravelBooking = { ...booking, status: 'cancelled' };
      setBookings((prev) => prev.map(b => b.id === id ? cancelled : b));
      toast.success('Booking cancelled');
      return cancelled;
    } catch (error: any) {
      toast.error(`Failed to cancel booking: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [bookings, toast]);

  // Expense Methods
  const addExpense = useCallback(async (requestId: string, expense: TravelExpense): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedExpenses = [...request.expenses, expense];
      return await updateRequest(requestId, { expenses: updatedExpenses });
    } catch (error: any) {
      toast.error(`Failed to add expense: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const updateExpense = useCallback(async (
    requestId: string,
    expenseId: string,
    updates: Partial<TravelExpense>
  ): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedExpenses = request.expenses.map(e =>
        e.id === expenseId ? { ...e, ...updates } : e
      );
      return await updateRequest(requestId, { expenses: updatedExpenses });
    } catch (error: any) {
      toast.error(`Failed to update expense: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  const removeExpense = useCallback(async (requestId: string, expenseId: string): Promise<TravelRequest> => {
    try {
      setIsSaving(true);
      const request = getRequestById(requestId);
      if (!request) throw new Error('Request not found');

      const updatedExpenses = request.expenses.filter(e => e.id !== expenseId);
      return await updateRequest(requestId, { expenses: updatedExpenses });
    } catch (error: any) {
      toast.error(`Failed to remove expense: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [getRequestById, updateRequest, toast]);

  // Analytics Methods
  const loadMetrics = useCallback(async () => {
    try {
      const data = await TravelAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      toast.error(`Failed to load metrics: ${error.message}`);
    }
  }, [toast]);

  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
    toast.success('Metrics refreshed');
  }, [loadMetrics, toast]);

  // Settings Methods
  const loadSettings = useCallback(async () => {
    try {
      const data = await TravelSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error(`Failed to load settings: ${error.message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<TravelSettings>) => {
    try {
      setIsSaving(true);
      const updated = await TravelSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Policy Methods
  const loadPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from an API
      setPolicies(travelData.policies);
    } catch (error: any) {
      toast.error(`Failed to load policies: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getApplicablePolicy = useCallback((employeeGrade: string): TravelPolicy | undefined => {
    return policies.find(policy =>
      policy.isActive && policy.applicableGrades.includes(employeeGrade)
    );
  }, [policies]);

  // Helper Methods
  const calculateEstimatedCost = useCallback((request: TravelRequest): number => {
    const accommodationCost = request.accommodation.reduce(
      (sum, acc) => sum + (acc.estimatedCostPerNight * acc.nights), 0
    );
    const transportCost = request.transport.reduce(
      (sum, trans) => sum + trans.estimatedCost, 0
    );
    return accommodationCost + transportCost;
  }, []);

  const calculateActualCost = useCallback((request: TravelRequest): number => {
    const bookingCost = request.bookings.reduce((sum, booking) => sum + booking.amount, 0);
    const expenseCost = request.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return bookingCost + expenseCost;
  }, []);

  const getTripDuration = useCallback((departureDate: string, returnDate: string): number => {
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD.getTime() - departure.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const validateRequest = useCallback((request: TravelRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!request.employeeId) errors.push('Employee is required');
    if (!request.fromLocation) errors.push('From location is required');
    if (!request.toLocation) errors.push('To location is required');
    if (!request.departureDate) errors.push('Departure date is required');
    if (!request.returnDate) errors.push('Return date is required');
    if (!request.purpose) errors.push('Travel purpose is required');

    if (request.departureDate && request.returnDate) {
      const departure = new Date(request.departureDate);
      const returnD = new Date(request.returnDate);
      if (returnD < departure) {
        errors.push('Return date must be after departure date');
      }
    }

    if (request.itinerary.length === 0) {
      errors.push('At least one itinerary item is required');
    }

    if (request.estimatedCost <= 0) {
      errors.push('Estimated cost must be greater than zero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Load sample data
      for (const request of travelData.requests) {
        await TravelRequestService.submitRequest(request);
      }

      await loadRequests();
      await loadPolicies();
      await loadMetrics();
      await loadSettings();

      toast.success('Sample data initialized successfully');
    } catch (error: any) {
      toast.error(`Failed to initialize sample data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const clearAllData = useCallback(async () => {
    try {
      setIsSaving(true);

      localStorage.removeItem('travel_requests');
      localStorage.removeItem('travel_bookings');
      localStorage.removeItem('travel_policies');
      localStorage.removeItem('travel_metrics');
      localStorage.removeItem('travel_settings');

      setRequests([]);
      setBookings([]);
      setPolicies([]);
      setMetrics(null);
      setSettings(null);

      toast.success('All travel data cleared');
    } catch (error: any) {
      toast.error(`Failed to clear data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Load initial data
  useEffect(() => {
    loadRequests();
    loadPolicies();
    loadMetrics();
    loadSettings();
  }, []);

  return {
    // State
    requests,
    bookings,
    policies,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Travel Request Methods
    loadRequests,
    getRequestById,
    submitRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,

    // Itinerary Methods
    addItinerary,
    updateItinerary,
    removeItinerary,

    // Accommodation Methods
    addAccommodation,
    updateAccommodation,
    removeAccommodation,

    // Transport Methods
    addTransport,
    updateTransport,
    removeTransport,

    // Advance Methods
    requestAdvance,
    updateAdvance,
    disburseAdvance,
    settleAdvance,

    // Booking Methods
    loadBookings,
    createBooking,
    confirmBooking,
    cancelBooking,

    // Expense Methods
    addExpense,
    updateExpense,
    removeExpense,

    // Analytics Methods
    loadMetrics,
    refreshMetrics,

    // Settings Methods
    loadSettings,
    updateSettings,

    // Policy Methods
    loadPolicies,
    getApplicablePolicy,

    // Helper Methods
    calculateEstimatedCost,
    calculateActualCost,
    getTripDuration,
    validateRequest,
    initializeSampleData,
    clearAllData
  };
};
