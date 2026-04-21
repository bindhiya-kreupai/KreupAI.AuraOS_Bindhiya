import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use vi.hoisted to define mock functions that can be used in vi.mock factories
const {
  mockNotifyUser,
  mockNotifyCompany,
  mockBroadcast,
  mockGetConnectedClientCount,
  mockGetConnectedUsers,
  mockIsUserOnline,
} = vi.hoisted(() => ({
  mockNotifyUser: vi.fn().mockResolvedValue(undefined),
  mockNotifyCompany: vi.fn().mockResolvedValue(undefined),
  mockBroadcast: vi.fn().mockResolvedValue(undefined),
  mockGetConnectedClientCount: vi.fn().mockReturnValue(5),
  mockGetConnectedUsers: vi.fn().mockReturnValue(['user-1', 'user-2']),
  mockIsUserOnline: vi.fn().mockReturnValue(true),
}));

// Mock socket.io before any imports that depend on it
vi.mock('socket.io', () => ({
  Server: vi.fn(),
}));

// Mock redis before websocket server imports it
vi.mock('@/lib/cache/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock the websocket server module
vi.mock('@/lib/websocket/server', () => ({
  wsServer: {
    notifyUser: mockNotifyUser,
    notifyCompany: mockNotifyCompany,
    broadcast: mockBroadcast,
    getConnectedClientCount: mockGetConnectedClientCount,
    getConnectedUsers: mockGetConnectedUsers,
    isUserOnline: mockIsUserOnline,
  },
  NotificationType: {
    PAYROLL_RUN_STARTED: 'PAYROLL_RUN_STARTED',
    PAYROLL_RUN_COMPLETED: 'PAYROLL_RUN_COMPLETED',
    PAYROLL_RUN_FAILED: 'PAYROLL_RUN_FAILED',
    PAYSLIP_GENERATED: 'PAYSLIP_GENERATED',
    LEAVE_REQUEST_SUBMITTED: 'LEAVE_REQUEST_SUBMITTED',
    LEAVE_REQUEST_APPROVED: 'LEAVE_REQUEST_APPROVED',
    LEAVE_REQUEST_REJECTED: 'LEAVE_REQUEST_REJECTED',
    LEAVE_BALANCE_LOW: 'LEAVE_BALANCE_LOW',
    ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
    LATE_ARRIVAL: 'LATE_ARRIVAL',
    MISSING_ATTENDANCE: 'MISSING_ATTENDANCE',
    REGULARIZATION_APPROVED: 'REGULARIZATION_APPROVED',
    REPORT_GENERATION_STARTED: 'REPORT_GENERATION_STARTED',
    REPORT_READY: 'REPORT_READY',
    REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    SYSTEM_UPDATE: 'SYSTEM_UPDATE',
    EMPLOYEE_ONBOARDED: 'EMPLOYEE_ONBOARDED',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after all mocks are set up
import { NotificationService, notificationService } from '../../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationService();
  });

  describe('Payroll Notifications', () => {
    it('should send payroll run started notification', async () => {
      await service.notifyPayrollRunStarted('user-1', {
        runId: 'run-1',
        month: 'June 2024',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'PAYROLL_RUN_STARTED',
          title: 'Payroll Processing Started',
          priority: 'medium',
        })
      );
    });

    it('should send payroll run completed notification', async () => {
      await service.notifyPayrollRunCompleted('user-1', {
        runId: 'run-1',
        month: 'June 2024',
        employeeCount: 50,
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'PAYROLL_RUN_COMPLETED',
          title: 'Payroll Processing Completed',
          priority: 'high',
        })
      );
    });

    it('should send payroll run failed notification with urgent priority', async () => {
      await service.notifyPayrollRunFailed('user-1', {
        runId: 'run-1',
        month: 'June 2024',
        error: 'Database timeout',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'PAYROLL_RUN_FAILED',
          title: 'Payroll Processing Failed',
          priority: 'urgent',
        })
      );
    });

    it('should send payslip generated notification', async () => {
      await service.notifyPayslipGenerated('user-1', {
        month: 'June 2024',
        fileUrl: '/files/payslip-june.pdf',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'PAYSLIP_GENERATED',
          title: 'Payslip Available',
          priority: 'high',
        })
      );
    });
  });

  describe('Leave Notifications', () => {
    it('should send leave request submitted notification to manager', async () => {
      await service.notifyLeaveRequestSubmitted('manager-1', {
        requestId: 'req-1',
        employeeName: 'Ahmed Al-Rashid',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        leaveType: 'Annual Leave',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'manager-1',
        expect.objectContaining({
          type: 'LEAVE_REQUEST_SUBMITTED',
          title: 'New Leave Request',
          priority: 'medium',
        })
      );
    });

    it('should send leave request approved notification', async () => {
      await service.notifyLeaveRequestApproved('emp-1', {
        requestId: 'req-1',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        approverName: 'Manager One',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'LEAVE_REQUEST_APPROVED',
          title: 'Leave Request Approved',
          priority: 'high',
        })
      );
    });

    it('should send leave request rejected notification with reason', async () => {
      await service.notifyLeaveRequestRejected('emp-1', {
        requestId: 'req-1',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        approverName: 'Manager One',
        reason: 'Insufficient coverage',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'LEAVE_REQUEST_REJECTED',
          title: 'Leave Request Rejected',
          priority: 'high',
        })
      );
    });

    it('should send leave balance low notification', async () => {
      await service.notifyLeaveBalanceLow('emp-1', {
        leaveType: 'Annual Leave',
        remainingDays: 2,
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'LEAVE_BALANCE_LOW',
          title: 'Low Leave Balance',
          priority: 'low',
        })
      );
    });
  });

  describe('Attendance Notifications', () => {
    it('should send attendance marked notification', async () => {
      await service.notifyAttendanceMarked('emp-1', {
        date: '2024-06-15',
        clockIn: '09:00',
        status: 'PRESENT',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'ATTENDANCE_MARKED',
          title: 'Attendance Marked',
          priority: 'low',
        })
      );
    });

    it('should send late arrival notification', async () => {
      await service.notifyLateArrival('emp-1', {
        date: '2024-06-15',
        clockIn: '09:30',
        expectedTime: '09:00',
        lateMinutes: 30,
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'LATE_ARRIVAL',
          title: 'Late Arrival',
          priority: 'medium',
        })
      );
    });

    it('should send missing attendance notification', async () => {
      await service.notifyMissingAttendance('emp-1', {
        date: '2024-06-15',
        action: 'submit a regularization request',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'MISSING_ATTENDANCE',
          title: 'Missing Attendance',
          priority: 'high',
        })
      );
    });

    it('should send regularization approved notification', async () => {
      await service.notifyRegularizationApproved('emp-1', {
        date: '2024-06-15',
        approverName: 'Manager One',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({
          type: 'REGULARIZATION_APPROVED',
          title: 'Attendance Regularization Approved',
          priority: 'medium',
        })
      );
    });
  });

  describe('Report Notifications', () => {
    it('should send report generation started notification', async () => {
      await service.notifyReportGenerationStarted('user-1', {
        reportType: 'Payroll Summary',
        requestId: 'req-1',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'REPORT_GENERATION_STARTED',
          title: 'Report Generation Started',
          priority: 'low',
        })
      );
    });

    it('should send report ready notification', async () => {
      await service.notifyReportReady('user-1', {
        reportType: 'Payroll Summary',
        fileUrl: '/reports/payroll-summary.xlsx',
        recordCount: 150,
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'REPORT_READY',
          title: 'Report Ready',
          priority: 'high',
        })
      );
    });

    it('should send report generation failed notification', async () => {
      await service.notifyReportGenerationFailed('user-1', {
        reportType: 'Payroll Summary',
        error: 'Timeout',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          type: 'REPORT_GENERATION_FAILED',
          title: 'Report Generation Failed',
          priority: 'high',
        })
      );
    });
  });

  describe('System Notifications', () => {
    it('should send system maintenance notification to company', async () => {
      await service.notifySystemMaintenance('company-1', {
        startTime: '2024-06-15T22:00:00Z',
        endTime: '2024-06-16T02:00:00Z',
        message: 'Database migration',
      });

      expect(mockNotifyCompany).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          type: 'SYSTEM_MAINTENANCE',
          title: 'Scheduled Maintenance',
          priority: 'urgent',
        })
      );
    });

    it('should send system update notification to company', async () => {
      await service.notifySystemUpdate('company-1', {
        version: '2.5.0',
        features: ['Leave balance dashboard', 'Mobile attendance'],
      });

      expect(mockNotifyCompany).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          type: 'SYSTEM_UPDATE',
          title: 'System Update',
          priority: 'medium',
        })
      );
    });

    it('should send employee onboarded notification to company', async () => {
      await service.notifyEmployeeOnboarded('company-1', {
        employeeId: 'emp-1',
        employeeName: 'Ahmed Al-Rashid',
        department: 'Engineering',
      });

      expect(mockNotifyCompany).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          type: 'EMPLOYEE_ONBOARDED',
          title: 'New Employee Onboarded',
          priority: 'low',
        })
      );
    });
  });

  describe('Custom Notification', () => {
    it('should send custom notification to user', async () => {
      await service.sendCustomNotification('user-1', {
        type: 'CUSTOM' as any,
        title: 'Custom Alert',
        message: 'Something happened',
        data: {},
        priority: 'medium',
      });

      expect(mockNotifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          title: 'Custom Alert',
        })
      );
    });
  });

  describe('Statistics and Status', () => {
    it('should return server statistics', () => {
      const stats = service.getStatistics();

      expect(stats.connectedClients).toBe(5);
      expect(stats.connectedUsers).toEqual(['user-1', 'user-2']);
    });

    it('should check if user is online', () => {
      const online = service.isUserOnline('user-1');

      expect(online).toBe(true);
      expect(mockIsUserOnline).toHaveBeenCalledWith('user-1');
    });
  });

  describe('Singleton export', () => {
    it('should export a singleton instance', () => {
      expect(notificationService).toBeInstanceOf(NotificationService);
    });
  });
});
