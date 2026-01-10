import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '../notification.service';

// Mock email and SMS services
vi.mock('@/lib/email/email.service', () => ({
  EmailService: {
    send: vi.fn(),
  },
}));

vi.mock('@/lib/sms/sms.service', () => ({
  SMSService: {
    send: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEmployee = {
    id: 'emp-1',
    email: 'john.doe@example.com',
    phoneNumber: '+966501234567',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockNotification = {
    id: 'notif-1',
    tenantId: 'tenant-1',
    employeeId: 'emp-1',
    type: 'LEAVE_APPROVED',
    title: 'Leave Approved',
    message: 'Your leave request has been approved',
    status: 'SENT',
    createdAt: new Date(),
  };

  describe('sendNotification', () => {
    it('should send email notification', async () => {
      const { EmailService } = await import('@/lib/email/email.service');
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      vi.mocked(EmailService.send).mockResolvedValue({ success: true });

      const result = await NotificationService.sendNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'LEAVE_APPROVED',
        title: 'Leave Approved',
        message: 'Your leave request has been approved',
        channels: ['EMAIL'],
      });

      expect(result.sent).toBe(true);
      expect(EmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john.doe@example.com',
          subject: 'Leave Approved',
        })
      );
    });

    it('should send SMS notification', async () => {
      const { SMSService } = await import('@/lib/sms/sms.service');
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      vi.mocked(SMSService.send).mockResolvedValue({ success: true });

      await NotificationService.sendNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'PAYSLIP_READY',
        title: 'Payslip Ready',
        message: 'Your payslip for June is ready',
        channels: ['SMS'],
      });

      expect(SMSService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+966501234567',
          message: expect.stringContaining('Payslip Ready'),
        })
      );
    });

    it('should send both email and SMS', async () => {
      const { EmailService } = await import('@/lib/email/email.service');
      const { SMSService } = await import('@/lib/sms/sms.service');
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      vi.mocked(EmailService.send).mockResolvedValue({ success: true });
      vi.mocked(SMSService.send).mockResolvedValue({ success: true });

      await NotificationService.sendNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'URGENT_ANNOUNCEMENT',
        title: 'Urgent',
        message: 'Important announcement',
        channels: ['EMAIL', 'SMS'],
      });

      expect(EmailService.send).toHaveBeenCalled();
      expect(SMSService.send).toHaveBeenCalled();
    });

    it('should create in-app notification', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      await NotificationService.sendNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'LEAVE_APPROVED',
        title: 'Leave Approved',
        message: 'Your leave has been approved',
        channels: ['IN_APP'],
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'LEAVE_APPROVED',
          title: 'Leave Approved',
          status: 'SENT',
        }),
      });
    });

    it('should handle email send failure gracefully', async () => {
      const { EmailService } = await import('@/lib/email/email.service');
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.notification.create).mockResolvedValue({
        ...mockNotification,
        status: 'FAILED',
      } as any);
      vi.mocked(EmailService.send).mockRejectedValue(new Error('SMTP error'));

      const result = await NotificationService.sendNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'LEAVE_APPROVED',
        title: 'Leave Approved',
        message: 'Test',
        channels: ['EMAIL'],
      });

      expect(result.sent).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should throw error if employee not found', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      await expect(
        NotificationService.sendNotification({
          tenantId: 'tenant-1',
          employeeId: 'invalid',
          type: 'TEST',
          title: 'Test',
          message: 'Test',
          channels: ['EMAIL'],
        })
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('sendBulkNotification', () => {
    it('should send notification to multiple employees', async () => {
      const employees = [
        mockEmployee,
        { ...mockEmployee, id: 'emp-2', email: 'jane@example.com' },
        { ...mockEmployee, id: 'emp-3', email: 'bob@example.com' },
      ];

      vi.mocked(prisma.employee.findMany).mockResolvedValue(employees as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await NotificationService.sendBulkNotification({
        tenantId: 'tenant-1',
        employeeIds: ['emp-1', 'emp-2', 'emp-3'],
        type: 'ANNOUNCEMENT',
        title: 'Company Update',
        message: 'Important update for all employees',
        channels: ['IN_APP'],
      });

      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures', async () => {
      const { EmailService } = await import('@/lib/email/email.service');
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee,
        { ...mockEmployee, id: 'emp-2', email: 'invalid' },
      ] as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      vi.mocked(EmailService.send)
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Invalid email'));

      const result = await NotificationService.sendBulkNotification({
        tenantId: 'tenant-1',
        employeeIds: ['emp-1', 'emp-2'],
        type: 'ANNOUNCEMENT',
        title: 'Test',
        message: 'Test',
        channels: ['EMAIL'],
      });

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('getNotifications', () => {
    it('should return employee notifications', async () => {
      const notifications = [mockNotification, { ...mockNotification, id: 'notif-2' }];
      vi.mocked(prisma.notification.count).mockResolvedValue(2);
      vi.mocked(prisma.notification.findMany).mockResolvedValue(notifications as any);

      const result = await NotificationService.getNotifications('emp-1', 'tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(1);
      vi.mocked(prisma.notification.findMany).mockResolvedValue([mockNotification] as any);

      await NotificationService.getNotifications('emp-1', 'tenant-1', {
        status: 'UNREAD',
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'UNREAD',
          }),
        })
      );
    });

    it('should filter by type', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(1);
      vi.mocked(prisma.notification.findMany).mockResolvedValue([mockNotification] as any);

      await NotificationService.getNotifications('emp-1', 'tenant-1', {
        type: 'LEAVE_APPROVED',
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'LEAVE_APPROVED',
          }),
        })
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      vi.mocked(prisma.notification.update).mockResolvedValue({
        ...mockNotification,
        status: 'READ',
        readAt: new Date(),
      } as any);

      const result = await NotificationService.markAsRead('notif-1', 'tenant-1');

      expect(result.status).toBe('READ');
      expect(result.readAt).toBeDefined();
    });

    it('should mark all notifications as read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 });

      const result = await NotificationService.markAllAsRead('emp-1', 'tenant-1');

      expect(result.count).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(7);

      const result = await NotificationService.getUnreadCount('emp-1', 'tenant-1');

      expect(result).toBe(7);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      vi.mocked(prisma.notification.delete).mockResolvedValue(mockNotification as any);

      await NotificationService.deleteNotification('notif-1', 'tenant-1');

      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1', tenantId: 'tenant-1' },
      });
    });

    it('should delete old notifications', async () => {
      vi.mocked(prisma.notification.deleteMany).mockResolvedValue({ count: 100 });

      const result = await NotificationService.deleteOldNotifications('tenant-1', 90); // Older than 90 days

      expect(result.count).toBe(100);
    });
  });

  describe('getNotificationTemplates', () => {
    it('should return template for leave approval', () => {
      const template = NotificationService.getNotificationTemplate('LEAVE_APPROVED', {
        employeeName: 'John Doe',
        leaveType: 'Annual Leave',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
      });

      expect(template.title).toContain('Leave Approved');
      expect(template.message).toContain('John Doe');
      expect(template.message).toContain('Annual Leave');
    });

    it('should return template for payslip ready', () => {
      const template = NotificationService.getNotificationTemplate('PAYSLIP_READY', {
        month: 'June 2024',
      });

      expect(template.title).toContain('Payslip');
      expect(template.message).toContain('June 2024');
    });

    it('should support bilingual templates', () => {
      const templateEn = NotificationService.getNotificationTemplate(
        'LEAVE_APPROVED',
        { employeeName: 'John' },
        'en'
      );
      const templateAr = NotificationService.getNotificationTemplate(
        'LEAVE_APPROVED',
        { employeeName: 'أحمد' },
        'ar'
      );

      expect(templateEn.title).not.toBe(templateAr.title);
      expect(templateAr.message).toContain('أحمد');
    });
  });

  describe('sendScheduledNotification', () => {
    it('should schedule notification for future delivery', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1); // Tomorrow

      vi.mocked(prisma.notification.create).mockResolvedValue({
        ...mockNotification,
        status: 'SCHEDULED',
        scheduledFor: scheduledDate,
      } as any);

      const result = await NotificationService.sendScheduledNotification({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        type: 'REMINDER',
        title: 'Reminder',
        message: "Don't forget",
        channels: ['EMAIL'],
        scheduledFor: scheduledDate,
      });

      expect(result.status).toBe('SCHEDULED');
      expect(result.scheduledFor).toEqual(scheduledDate);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing email for email notification', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        ...mockEmployee,
        email: null,
      } as any);

      await expect(
        NotificationService.sendNotification({
          tenantId: 'tenant-1',
          employeeId: 'emp-1',
          type: 'TEST',
          title: 'Test',
          message: 'Test',
          channels: ['EMAIL'],
        })
      ).rejects.toThrow('Employee email not found');
    });

    it('should handle missing phone for SMS notification', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        ...mockEmployee,
        phoneNumber: null,
      } as any);

      await expect(
        NotificationService.sendNotification({
          tenantId: 'tenant-1',
          employeeId: 'emp-1',
          type: 'TEST',
          title: 'Test',
          message: 'Test',
          channels: ['SMS'],
        })
      ).rejects.toThrow('Employee phone number not found');
    });
  });
});
