// Travel Management Module Types
export type TravelType = 'domestic' | 'international';
export type TravelPurpose = 'client_meeting' | 'conference' | 'training' | 'site_visit' | 'recruitment' | 'team_building' | 'other';
export type TravelClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type AccommodationType = 'hotel' | 'guest_house' | 'service_apartment' | 'hostel';
export type TransportMode = 'flight' | 'train' | 'bus' | 'car' | 'taxi' | 'own_vehicle';
export type TravelStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'modified';
export type AdvanceStatus = 'requested' | 'approved' | 'disbursed' | 'settled';

export interface TravelRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  managerId: string;
  managerName: string;
  travelType: TravelType;
  purpose: TravelPurpose;
  purposeDetails: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  returnDate: string;
  duration: number;
  estimatedCost: number;
  currency: string;
  status: TravelStatus;
  itinerary: TravelItinerary[];
  accommodation: AccommodationRequest[];
  transport: TransportRequest[];
  advance?: TravelAdvance;
  approvers: TravelApprover[];
  bookings: TravelBooking[];
  expenses: TravelExpense[];
  submittedDate: string;
  approvedDate?: string;
  completedDate?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface TravelItinerary {
  id: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  departureTime?: string;
  arrivalTime?: string;
  mode: TransportMode;
  notes?: string;
}

export interface AccommodationRequest {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  city: string;
  accommodationType: AccommodationType;
  preferredHotels?: string[];
  roomType: 'single' | 'double' | 'suite';
  nights: number;
  estimatedCostPerNight: number;
  specialRequirements?: string;
}

export interface TransportRequest {
  id: string;
  date: string;
  from: string;
  to: string;
  mode: TransportMode;
  class?: TravelClass;
  estimatedCost: number;
  bookingRequired: boolean;
  preferredTime?: string;
}

export interface TravelAdvance {
  id: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: AdvanceStatus;
  disbursedDate?: string;
  settlementDate?: string;
  settlementAmount?: number;
  excessAmount?: number;
  shortfallAmount?: number;
}

export interface TravelApprover {
  id: string;
  approverLevel: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: string;
  comments?: string;
}

export interface TravelBooking {
  id: string;
  bookingType: 'flight' | 'train' | 'hotel' | 'car';
  bookingReference: string;
  vendor: string;
  bookingDate: string;
  travelDate: string;
  from?: string;
  to?: string;
  amount: number;
  status: BookingStatus;
  bookingUrl?: string;
  cancellationPolicy?: string;
}

export interface TravelExpense {
  id: string;
  expenseDate: string;
  category: 'transport' | 'accommodation' | 'meals' | 'local_conveyance' | 'communication' | 'miscellaneous';
  description: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  isReimbursable: boolean;
}

export interface TravelPolicy {
  id: string;
  policyName: string;
  isActive: boolean;
  applicableGrades: string[];
  domesticFlightClass: TravelClass;
  internationalFlightClass: TravelClass;
  hotelBudgetPerNight: { [key: string]: number };
  perDiemRates: { [key: string]: number };
  advancePercentage: number;
  requiresApproval: boolean;
  approvalLevels: number;
  bookingLeadTime: number;
  createdBy: string;
  createdDate: string;
}

export interface TravelMetrics {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalTravelCost: number;
  averageTravelCost: number;
  travelByPurpose: { purpose: TravelPurpose; count: number; cost: number }[];
  travelByDepartment: { departmentId: string; departmentName: string; count: number; cost: number }[];
  topTravelers: { employeeId: string; employeeName: string; trips: number; cost: number }[];
}

export interface TravelSettings {
  requireApproval: boolean;
  approvalLevels: number;
  allowSelfBooking: boolean;
  advanceAllowed: boolean;
  maxAdvancePercentage: number;
  travelAgencyIntegration: boolean;
  notificationEmail: string;
}
