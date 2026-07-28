// @ts-nocheck — Stub service with schema drift; not wired to any API route. Tracked under #29 for rewrite.
/**
 * Notification Service
 * High-level API for sending real-time notifications
 */

import type { NotificationPayload } from '../websocket/server';
import { wsServer, NotificationType } from '../websocket/server';
import { logger } from '../logger';

export class NotificationService {
  /**
   * Send payroll notification
   */
  async notifyPayrollRunStarted(
    userId: string,
    data: { runId: string; month: string }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.PAYROLL_RUN_STARTED,
      title: 'Payroll Processing Started',
      message: `Payroll processing for ${data.month} has started`,
      data,
      priority: 'medium',
    });
  }

  async notifyPayrollRunCompleted(
    userId: string,
    data: { runId: string; month: string; employeeCount: number }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.PAYROLL_RUN_COMPLETED,
      title: 'Payroll Processing Completed',
      message: `Payroll for ${data.month} completed successfully. ${data.employeeCount} employees processed.`,
      data,
      priority: 'high',
    });
  }

  async notifyPayrollRunFailed(
    userId: string,
    data: { runId: string; month: string; error: string }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.PAYROLL_RUN_FAILED,
      title: 'Payroll Processing Failed',
      message: `Payroll processing for ${data.month} failed: ${data.error}`,
      data,
      priority: 'urgent',
    });
  }

  async notifyPayslipGenerated(
    userId: string,
    data: { month: string; fileUrl: string }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.PAYSLIP_GENERATED,
      title: 'Payslip Available',
      message: `Your payslip for ${data.month} is now available`,
      data,
      priority: 'high',
    });
  }

  /**
   * Send leave notification
   */
  async notifyLeaveRequestSubmitted(
    managerId: string,
    data: {
      requestId: string;
      employeeName: string;
      startDate: string;
      endDate: string;
      leaveType: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(managerId, {
      type: NotificationType.LEAVE_REQUEST_SUBMITTED,
      title: 'New Leave Request',
      message: `${data.employeeName} has requested leave from ${data.startDate} to ${data.endDate}`,
      data,
      priority: 'medium',
    });
  }

  async notifyLeaveRequestApproved(
    employeeId: string,
    data: {
      requestId: string;
      startDate: string;
      endDate: string;
      approverName: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.LEAVE_REQUEST_APPROVED,
      title: 'Leave Request Approved',
      message: `Your leave request from ${data.startDate} to ${data.endDate} has been approved by ${data.approverName}`,
      data,
      priority: 'high',
    });
  }

  async notifyLeaveRequestRejected(
    employeeId: string,
    data: {
      requestId: string;
      startDate: string;
      endDate: string;
      approverName: string;
      reason: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.LEAVE_REQUEST_REJECTED,
      title: 'Leave Request Rejected',
      message: `Your leave request from ${data.startDate} to ${data.endDate} was rejected by ${data.approverName}. Reason: ${data.reason}`,
      data,
      priority: 'high',
    });
  }

  async notifyLeaveBalanceLow(
    employeeId: string,
    data: { leaveType: string; remainingDays: number }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.LEAVE_BALANCE_LOW,
      title: 'Low Leave Balance',
      message: `Your ${data.leaveType} balance is low (${data.remainingDays} days remaining)`,
      data,
      priority: 'low',
    });
  }

  /**
   * Send attendance notification
   */
  async notifyAttendanceMarked(
    employeeId: string,
    data: { date: string; clockIn: string; status: string }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.ATTENDANCE_MARKED,
      title: 'Attendance Marked',
      message: `Your attendance for ${data.date} has been marked at ${data.clockIn}`,
      data,
      priority: 'low',
    });
  }

  async notifyLateArrival(
    employeeId: string,
    data: { date: string; clockIn: string; expectedTime: string; lateMinutes: number }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.LATE_ARRIVAL,
      title: 'Late Arrival',
      message: `You arrived ${data.lateMinutes} minutes late on ${data.date}. Expected: ${data.expectedTime}, Actual: ${data.clockIn}`,
      data,
      priority: 'medium',
    });
  }

  async notifyMissingAttendance(
    employeeId: string,
    data: { date: string; action: string }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.MISSING_ATTENDANCE,
      title: 'Missing Attendance',
      message: `Your attendance for ${data.date} is missing. Please ${data.action}`,
      data,
      priority: 'high',
    });
  }

  async notifyRegularizationApproved(
    employeeId: string,
    data: { date: string; approverName: string }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.REGULARIZATION_APPROVED,
      title: 'Attendance Regularization Approved',
      message: `Your attendance regularization for ${data.date} has been approved by ${data.approverName}`,
      data,
      priority: 'medium',
    });
  }

  /**
   * Send report notification
   */
  async notifyReportGenerationStarted(
    userId: string,
    data: { reportType: string; requestId: string }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.REPORT_GENERATION_STARTED,
      title: 'Report Generation Started',
      message: `Your ${data.reportType} report is being generated`,
      data,
      priority: 'low',
    });
  }

  async notifyReportReady(
    userId: string,
    data: { reportType: string; fileUrl: string; recordCount: number }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.REPORT_READY,
      title: 'Report Ready',
      message: `Your ${data.reportType} report is ready (${data.recordCount} records)`,
      data,
      priority: 'high',
    });
  }

  async notifyReportGenerationFailed(
    userId: string,
    data: { reportType: string; error: string }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.REPORT_GENERATION_FAILED,
      title: 'Report Generation Failed',
      message: `Failed to generate ${data.reportType} report: ${data.error}`,
      data,
      priority: 'high',
    });
  }

  /**
   * Send system notification to company
   */
  async notifySystemMaintenance(
    companyId: string,
    data: { startTime: string; endTime: string; message: string }
  ): Promise<void> {
    await wsServer.notifyCompany(companyId, {
      type: NotificationType.SYSTEM_MAINTENANCE,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled from ${data.startTime} to ${data.endTime}. ${data.message}`,
      data,
      priority: 'urgent',
    });
  }

  async notifySystemUpdate(
    companyId: string,
    data: { version: string; features: string[] }
  ): Promise<void> {
    await wsServer.notifyCompany(companyId, {
      type: NotificationType.SYSTEM_UPDATE,
      title: 'System Update',
      message: `AuraOS has been updated to version ${data.version}`,
      data,
      priority: 'medium',
    });
  }

  /**
   * Send employee notification
   */
  async notifyEmployeeOnboarded(
    companyId: string,
    data: { employeeId: string; employeeName: string; department: string }
  ): Promise<void> {
    await wsServer.notifyCompany(companyId, {
      type: NotificationType.EMPLOYEE_ONBOARDED,
      title: 'New Employee Onboarded',
      message: `Welcome ${data.employeeName} to ${data.department}!`,
      data,
      priority: 'low',
    });
  }

  // ==================== SHIFT NOTIFICATIONS ====================

  async notifyShiftSwapRequested(
    userId: string,
    data: {
      requestorId: string;
      requestorName: string;
      requestorDate: string;
      swapWithDate: string;
      reason: string;
      swapId: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.SHIFT_SWAP_REQUESTED,
      title: 'New Shift Swap Request',
      message: `${data.requestorName} has requested a shift swap with you`,
      data,
      priority: 'medium',
    });
  }

  async notifyShiftSwapPeerApproved(
    userId: string,
    data: {
      swapWithId: string;
      swapWithName: string;
      requestorDate: string;
      swapWithDate: string;
      swapId: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.SHIFT_SWAP_PEER_APPROVED,
      title: 'Swap Peer Approved',
      message: `${data.swapWithName} has approved your swap request. Awaiting manager approval.`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftSwapCompleted(
    userId: string,
    data: {
      otherPartyId: string;
      otherPartyName: string;
      requestorDate: string;
      swapWithDate: string;
      swapId: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.SHIFT_SWAP_COMPLETED,
      title: 'Shift Swap Completed',
      message: 'Your shift swap has been approved and completed.',
      data,
      priority: 'high',
    });
  }

  async notifyShiftSwapCancelled(
    userId: string,
    data: {
      cancelledBy: string;
      cancelledByName: string;
      reason?: string;
      swapId: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.SHIFT_SWAP_CANCELLED,
      title: 'Shift Swap Cancelled',
      message: `A shift swap request was cancelled by ${data.cancelledByName}.`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftSwapRejected(
    userId: string,
    data: {
      rejectedBy: string;
      rejectedByName: string;
      reason: string;
      swapId: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(userId, {
      type: NotificationType.SHIFT_SWAP_REJECTED,
      title: 'Shift Swap Rejected',
      message: `Your shift swap request was rejected by ${data.rejectedByName}. Reason: ${data.reason}`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftAssigned(
    employeeId: string,
    data: {
      shiftId: string;
      shiftName: string;
      shiftCode: string;
      effectiveFrom: string;
      effectiveTo?: string | null;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ASSIGNED,
      title: 'Shift Assigned',
      message: `You have been assigned to shift "${data.shiftName}" (${data.shiftCode}) effective ${data.effectiveFrom}`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftAssignmentRemoved(
    employeeId: string,
    data: {
      shiftId: string;
      shiftName: string;
      effectiveFrom: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ASSIGNMENT_REMOVED,
      title: 'Shift Assignment Removed',
      message: `Your assignment to shift "${data.shiftName}" has been removed`,
      data,
      priority: 'medium',
    });
  }

  async notifyShiftRosterAssigned(
    employeeId: string,
    data: {
      shiftId: string;
      shiftName: string;
      rosterDate: string;
      customStartTime?: string;
      customEndTime?: string;
      isWeekOff?: boolean;
      isHoliday?: boolean;
    }
  ): Promise<void> {
    let message: string;
    if (data.isWeekOff) {
      message = `You are scheduled for a week off on ${data.rosterDate}`;
    } else if (data.isHoliday) {
      message = `You are scheduled for a holiday on ${data.rosterDate}`;
    } else {
      message = `You have been rostered for shift "${data.shiftName}" on ${data.rosterDate}`;
    }

    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ROSTER_ASSIGNED,
      title: 'Roster Updated',
      message,
      data,
      priority: 'medium',
    });
  }

  async notifyShiftRosterConfirmed(
    employeeId: string,
    data: {
      shiftId: string;
      shiftName: string;
      rosterDate: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ROSTER_CONFIRMED,
      title: 'Roster Confirmed',
      message: `Your roster entry for shift "${data.shiftName}" on ${data.rosterDate} has been confirmed`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftRosterCancelled(
    employeeId: string,
    data: {
      shiftId: string;
      shiftName: string;
      rosterDate: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ROSTER_CANCELLED,
      title: 'Roster Cancelled',
      message: `Your roster entry for shift "${data.shiftName}" on ${data.rosterDate} has been cancelled`,
      data,
      priority: 'medium',
    });
  }

  async notifyShiftOpenClaimed(
    employeeId: string,
    data: {
      rosterId: string;
      shiftId: string;
      shiftName: string;
      rosterDate: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_OPEN_CLAIMED,
      title: 'Open Shift Claimed',
      message: `You have successfully claimed the open shift "${data.shiftName}" on ${data.rosterDate}`,
      data,
      priority: 'high',
    });
  }

  async notifyShiftRosterPublished(
    employeeId: string,
    data: {
      dateFrom: string;
      dateTo: string;
    }
  ): Promise<void> {
    await wsServer.notifyUser(employeeId, {
      type: NotificationType.SHIFT_ROSTER_CONFIRMED,
      title: 'Roster Published',
      message: `Your roster for ${data.dateFrom} to ${data.dateTo} has been published and is now active`,
      data,
      priority: 'high',
    });
  }

  /**
   * Broadcast notification to all subscribers of a type
   */
  async broadcast(type: NotificationType, payload: NotificationPayload): Promise<void> {
    await wsServer.broadcast(type, payload);
    logger.info({ type }, 'Broadcasted notification');
  }

  /**
   * Custom notification
   */
  async sendCustomNotification(userId: string, notification: NotificationPayload): Promise<void> {
    await wsServer.notifyUser(userId, notification);
  }

  /**
   * Get server statistics
   */
  getStatistics(): {
    connectedClients: number;
    connectedUsers: string[];
  } {
    return {
      connectedClients: wsServer.getConnectedClientCount(),
      connectedUsers: wsServer.getConnectedUsers(),
    };
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return wsServer.isUserOnline(userId);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
