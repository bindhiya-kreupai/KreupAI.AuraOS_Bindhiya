/**
 * Mobile App Type Definitions
 */

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: UserRole;
  department: string;
  designation: string;
  tenantId: string;
  entityId: string;
  permissions: string[];
  preferences: UserPreferences;
}

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';

export interface UserPreferences {
  language: 'en' | 'ar' | 'hi';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  biometricEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: {
    time: string;
    location?: GeoLocation;
    photo?: string;
    method: 'app' | 'biometric' | 'manual';
  };
  checkOut?: {
    time: string;
    location?: GeoLocation;
    photo?: string;
    method: 'app' | 'biometric' | 'manual';
  };
  status: AttendanceStatus;
  workHours?: number;
  overtime?: number;
  notes?: string;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'early_leave'
  | 'half_day'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface AttendanceSummary {
  month: string;
  year: number;
  workingDays: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  holidays: number;
  totalHours: number;
  overtime: number;
}

// ============================================================================
// LEAVE TYPES
// ============================================================================

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  comments?: string;
  attachments?: string[];
}

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'emergency'
  | 'maternity'
  | 'paternity'
  | 'hajj'
  | 'compassionate'
  | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  leaveType: LeaveType;
  entitled: number;
  used: number;
  pending: number;
  available: number;
  carryForward?: number;
}

// ============================================================================
// PAYROLL TYPES
// ============================================================================

export interface Payslip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  earnings: PayComponent[];
  deductions: PayComponent[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  paymentDate?: string;
  paymentMethod?: 'bank' | 'cash' | 'cheque';
  status: 'draft' | 'processed' | 'paid';
  currency: string;
  pdfUrl?: string;
}

export interface PayComponent {
  code: string;
  name: string;
  nameAr?: string;
  amount: number;
  ytd?: number;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: 'business' | 'development' | 'behavior';
  weight: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  comments?: string[];
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewPeriod: string;
  reviewerName: string;
  selfRating?: number;
  managerRating?: number;
  finalRating?: number;
  status: 'self_review' | 'manager_review' | 'calibration' | 'completed';
  goals: PerformanceGoal[];
  feedback?: string;
  developmentPlan?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType =
  | 'leave_request'
  | 'leave_approved'
  | 'leave_rejected'
  | 'attendance_reminder'
  | 'payslip_ready'
  | 'task_assigned'
  | 'announcement'
  | 'birthday'
  | 'work_anniversary'
  | 'approval_pending'
  | 'document_expiry';

// ============================================================================
// TEAM TYPES (FOR MANAGERS)
// ============================================================================

export interface TeamMember {
  id: string;
  employeeId: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  designation: string;
  email: string;
  phone?: string;
  status: 'present' | 'absent' | 'on_leave' | 'remote';
  pendingApprovals?: number;
}

export interface TeamDashboard {
  totalMembers: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  pendingLeaves: number;
  pendingTimesheets: number;
  upcomingReviews: number;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Biometric: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Leave: undefined;
  Payroll: undefined;
  More: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Notifications: undefined;
  Announcements: undefined;
  TeamView: undefined;
};

export type AttendanceStackParamList = {
  AttendanceHome: undefined;
  AttendanceHistory: undefined;
  AttendanceDetails: { recordId: string };
  CheckIn: undefined;
};

export type LeaveStackParamList = {
  LeaveHome: undefined;
  LeaveHistory: undefined;
  LeaveDetails: { requestId: string };
  ApplyLeave: undefined;
  LeaveApprovals: undefined;
};

export type PayrollStackParamList = {
  PayrollHome: undefined;
  PayslipDetails: { payslipId: string };
  PayslipDownload: { payslipId: string };
  TaxSummary: undefined;
};

export type BenefitsStackParamList = {
  BenefitsHome: undefined;
  ClaimDetails: { claimId: string };
  SubmitClaim: undefined;
};

export type ExpenseStackParamList = {
  ExpenseHome: undefined;
  SubmitExpense: undefined;
  ExpenseApprovals: undefined;
};

export type OnboardingStackParamList = {
  OnboardingTasks: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Performance: undefined;
  GoalDetails: { goalId: string };
  Documents: undefined;
  Settings: undefined;
  Language: undefined;
  Security: undefined;
  Help: undefined;
  About: undefined;
};
