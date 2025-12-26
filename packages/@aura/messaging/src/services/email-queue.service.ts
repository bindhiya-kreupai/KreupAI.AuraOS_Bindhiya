/**
 * Email Queue Service
 * Handles async email notifications via RabbitMQ
 *
 * @module @aura/messaging
 */

import { getQueueManager, MessagePayload } from '../lib/queue-manager';
import { QUEUES } from '../config/queue.config';
import { randomUUID } from 'crypto';

export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  priority?: 'high' | 'normal' | 'low';
  template?: {
    name: string;
    data: Record<string, unknown>;
  };
}

export interface EmailQueueMessage extends MessagePayload {
  data: EmailMessage;
}

export class EmailQueueService {
  private queueManager = getQueueManager();

  /**
   * Queue an email for async sending
   */
  async queueEmail(
    tenantId: string,
    email: EmailMessage,
    userId?: string,
    correlationId?: string
  ): Promise<string> {
    const messageId = randomUUID();

    const message: EmailQueueMessage = {
      id: messageId,
      type: 'email.send',
      tenantId,
      userId,
      data: email,
      timestamp: new Date(),
      correlationId: correlationId || randomUUID(),
    };

    const published = await this.queueManager.publish(
      QUEUES.EMAIL_NOTIFICATIONS.name,
      message
    );

    if (!published) {
      throw new Error('Failed to queue email');
    }

    console.log(`Email queued successfully: ${messageId}`);
    return messageId;
  }

  /**
   * Queue a welcome email
   */
  async queueWelcomeEmail(
    tenantId: string,
    employeeEmail: string,
    employeeName: string,
    tempPassword: string,
    userId?: string
  ): Promise<string> {
    return this.queueEmail(
      tenantId,
      {
        to: employeeEmail,
        subject: 'Welcome to AuraOS',
        template: {
          name: 'welcome',
          data: {
            employeeName,
            tempPassword,
            loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.auraos.ai',
          },
        },
        priority: 'high',
      },
      userId
    );
  }

  /**
   * Queue a password reset email
   */
  async queuePasswordResetEmail(
    tenantId: string,
    employeeEmail: string,
    employeeName: string,
    resetToken: string,
    userId?: string
  ): Promise<string> {
    return this.queueEmail(
      tenantId,
      {
        to: employeeEmail,
        subject: 'Password Reset Request',
        template: {
          name: 'password-reset',
          data: {
            employeeName,
            resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`,
            expiresIn: '1 hour',
          },
        },
        priority: 'high',
      },
      userId
    );
  }

  /**
   * Queue a leave request notification
   */
  async queueLeaveRequestEmail(
    tenantId: string,
    managerEmail: string,
    managerName: string,
    employeeName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    leaveId: string,
    userId?: string
  ): Promise<string> {
    return this.queueEmail(
      tenantId,
      {
        to: managerEmail,
        subject: `Leave Request from ${employeeName}`,
        template: {
          name: 'leave-request',
          data: {
            managerName,
            employeeName,
            leaveType,
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            approveUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leave/approvals?id=${leaveId}&action=approve`,
            rejectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leave/approvals?id=${leaveId}&action=reject`,
          },
        },
        priority: 'normal',
      },
      userId
    );
  }

  /**
   * Queue a payslip email
   */
  async queuePayslipEmail(
    tenantId: string,
    employeeEmail: string,
    employeeName: string,
    month: string,
    year: number,
    payslipUrl: string,
    userId?: string
  ): Promise<string> {
    return this.queueEmail(
      tenantId,
      {
        to: employeeEmail,
        subject: `Payslip for ${month} ${year}`,
        template: {
          name: 'payslip',
          data: {
            employeeName,
            month,
            year,
            payslipUrl,
          },
        },
        priority: 'normal',
      },
      userId
    );
  }

  /**
   * Queue bulk emails
   */
  async queueBulkEmails(
    tenantId: string,
    emails: Array<{ email: string; name: string; data: Record<string, unknown> }>,
    template: string,
    subject: string,
    userId?: string
  ): Promise<string[]> {
    const messageIds: string[] = [];

    for (const recipient of emails) {
      const messageId = await this.queueEmail(
        tenantId,
        {
          to: recipient.email,
          subject,
          template: {
            name: template,
            data: {
              name: recipient.name,
              ...recipient.data,
            },
          },
          priority: 'low',
        },
        userId
      );
      messageIds.push(messageId);
    }

    return messageIds;
  }
}
