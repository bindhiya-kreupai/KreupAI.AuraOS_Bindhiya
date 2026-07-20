/**
 * Email Service
 *
 * Handles all email sending operations including password resets,
 * notifications, and transactional emails.
 */

import { logger } from '@/lib/logger';

// Email configuration from environment
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@auraos.com';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'AuraOS';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

/**
 * Send an email using SMTP
 *
 * Note: This is a basic implementation. For production, consider using:
 * - nodemailer
 * - SendGrid
 * - AWS SES
 * - Postmark
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    logger.warn(
      'Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD environment variables.'
    );

    // In development, log the email instead of failing
    if (process.env.NODE_ENV === 'development') {
      logger.info(
        {
          to: options.to,
          subject: options.subject,
          preview: options.text?.substring(0, 100) || 'HTML email',
        },
        'Email would be sent (dev mode)'
      );
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Dynamic import of nodemailer to avoid build issues if not installed
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: options.from || `${SMTP_FROM_NAME} <${SMTP_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(
      {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      },
      'Email sent successfully'
    );

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    logger.error({ error, to: options.to, subject: options.subject }, 'Failed to send email');
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
  const expiresIn = '1 hour';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #5a6fd6; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .code { background: #e5e7eb; padding: 10px 15px; border-radius: 4px; font-family: monospace; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          <p>We received a request to reset your password for your AuraOS account.</p>
          <p>Click the button below to reset your password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p class="code">${resetUrl}</p>

          <div class="warning">
            <strong>Important:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This link will expire in ${expiresIn}</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent by AuraOS</p>
          <p>If you have questions, contact support at support@auraos.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset Request

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your AuraOS account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiresIn}.

If you didn't request this reset, please ignore this email. Your password won't change until you create a new one.

---
This email was sent by AuraOS
If you have questions, contact support at support@auraos.com
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - AuraOS',
    html,
    text,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, userName: string): Promise<EmailResult> {
  const loginUrl = `${APP_URL}/auth/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AuraOS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AuraOS!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your AuraOS account has been created successfully. We're excited to have you on board!</p>
          <p>AuraOS is your comprehensive Human Capital Management platform that helps you manage:</p>
          <ul>
            <li>Employee records and profiles</li>
            <li>Leave and attendance</li>
            <li>Payroll and compensation</li>
            <li>Performance management</li>
            <li>And much more!</li>
          </ul>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </div>
        </div>
        <div class="footer">
          <p>Welcome to the AuraOS family!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to AuraOS!',
    html,
  });
}

/**
 * Send MFA setup confirmation email
 */
export async function sendMFASetupEmail(email: string, userName: string): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Two-Factor Authentication Enabled</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Two-Factor Authentication Enabled</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Two-factor authentication has been successfully enabled on your AuraOS account.</p>
          <p>From now on, you'll need to enter a verification code from your authenticator app when logging in.</p>
          <p><strong>Important:</strong> Keep your backup codes safe. You'll need them if you lose access to your authenticator app.</p>
          <p>If you didn't enable two-factor authentication, please contact support immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated security notification from AuraOS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Two-Factor Authentication Enabled - AuraOS',
    html,
  });
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedEmail(
  email: string,
  userName: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Changed</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your AuraOS account password has been changed successfully.</p>
          <p><strong>When:</strong> ${new Date().toLocaleString()}</p>

          <div class="warning">
            <strong>Didn't make this change?</strong>
            <p style="margin: 10px 0 0 0;">If you didn't change your password, please contact support immediately as your account may have been compromised.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated security notification from AuraOS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Changed - AuraOS',
    html,
  });
}

/**
 * Send new device login notification email
 */
export async function sendNewDeviceLoginEmail(
  email: string,
  userName: string,
  device: string,
  ipAddress: string,
  location: string,
  timestamp: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Sign-In to Your Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
        .details th { text-align: left; padding: 4px 8px; color: #666; }
        .details td { padding: 4px 8px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Sign-In</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>We detected a new sign-in to your AuraOS account from a device we haven't seen before.</p>

          <div class="details">
            <table>
              <tr><th>Device:</th><td>${device}</td></tr>
              <tr><th>IP Address:</th><td>${ipAddress}</td></tr>
              <tr><th>Location:</th><td>${location}</td></tr>
              <tr><th>Time:</th><td>${timestamp}</td></tr>
            </table>
          </div>

          <div class="warning">
            <strong>Was this you?</strong>
            <p style="margin: 10px 0 0 0;">If yes, you can ignore this email. If not, please change your password immediately and contact your administrator.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated security notification from AuraOS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'New Sign-In to Your AuraOS Account',
    html,
  });
}

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendMFASetupEmail,
  sendPasswordChangedEmail,
  sendNewDeviceLoginEmail,
  isEmailConfigured,
};
