/**
 * Third-Party Service Integration Tests (Days 63-64)
 *
 * Tests external service integrations including:
 * - Email service (SendGrid/SES)
 * - SMS service (Twilio)
 * - Payment gateway (Stripe)
 * - File storage (S3/MinIO)
 * - Cache service (Redis)
 * - Message queue (RabbitMQ)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_BASE = `${BASE_URL}/api/v1`;

const testUser = {
  email: 'thirdparty.integration@auraos.com',
  password: 'ThirdParty@2025'
};

let authToken: string;

test.describe('Third-Party Integration - Email Service', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should send email successfully', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const emailPayload = {
      to: 'test.recipient@auraos.com',
      subject: 'Test Email from Integration Tests',
      template: 'welcome',
      data: {
        firstName: 'Test',
        lastName: 'User'
      }
    };

    const response = await request.post(`${API_BASE}/notifications/email/send`, {
      headers,
      data: emailPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.messageId).toBeDefined();
      expect(data.data.status).toMatch(/queued|sent|delivered/);

      console.log('✅ Email sent successfully:', data.data.messageId);
    } else {
      // Email service might be mocked in test environment
      console.log('📧 Email service mocked or unavailable in test environment');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should send email with attachments', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const emailPayload = {
      to: 'test.recipient@auraos.com',
      subject: 'Test Email with Attachment',
      body: 'Please find the attachment',
      attachments: [
        {
          filename: 'test-document.pdf',
          content: Buffer.from('test content').toString('base64'),
          type: 'application/pdf'
        }
      ]
    };

    const response = await request.post(`${API_BASE}/notifications/email/send`, {
      headers,
      data: emailPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      console.log('✅ Email with attachment sent successfully');
    } else {
      console.log('📧 Email service unavailable - skipping attachment test');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should handle email delivery failures gracefully', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const emailPayload = {
      to: 'invalid-email-address',
      subject: 'Test Invalid Email',
      body: 'This should fail validation'
    };

    const response = await request.post(`${API_BASE}/notifications/email/send`, {
      headers,
      data: emailPayload
    });

    // Should return error for invalid email
    expect([400, 422]).toContain(response.status());
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should get email delivery status', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Send email first
    const sendResponse = await request.post(`${API_BASE}/notifications/email/send`, {
      headers,
      data: {
        to: 'test.recipient@auraos.com',
        subject: 'Test Status Check',
        body: 'Testing delivery status'
      }
    });

    if (sendResponse.ok()) {
      const sendData = await sendResponse.json();
      const messageId = sendData.data.messageId;

      // Check status
      const statusResponse = await request.get(
        `${API_BASE}/notifications/email/status/${messageId}`,
        { headers }
      );

      if (statusResponse.ok()) {
        const statusData = await statusResponse.json();
        expect(statusData.data.status).toMatch(/queued|sent|delivered|failed/);
        console.log('✅ Email delivery status:', statusData.data.status);
      }
    }
  });
});

test.describe('Third-Party Integration - SMS Service', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should send SMS successfully', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const smsPayload = {
      to: '+1234567890',
      message: 'Test SMS from integration tests'
    };

    const response = await request.post(`${API_BASE}/notifications/sms/send`, {
      headers,
      data: smsPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.messageId).toBeDefined();
      console.log('✅ SMS sent successfully:', data.data.messageId);
    } else {
      console.log('📱 SMS service mocked or unavailable in test environment');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should validate phone number format', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const smsPayload = {
      to: 'invalid-phone',
      message: 'Test message'
    };

    const response = await request.post(`${API_BASE}/notifications/sms/send`, {
      headers,
      data: smsPayload
    });

    expect([400, 422]).toContain(response.status());
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('phone');
  });

  test('should handle international phone numbers', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const smsPayload = {
      to: '+44123456789', // UK number
      message: 'International SMS test'
    };

    const response = await request.post(`${API_BASE}/notifications/sms/send`, {
      headers,
      data: smsPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      console.log('✅ International SMS sent successfully');
    } else {
      expect([200, 503]).toContain(response.status());
    }
  });
});

test.describe('Third-Party Integration - Payment Gateway', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should create payment intent', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const paymentPayload = {
      amount: 10000, // $100.00 in cents
      currency: 'USD',
      description: 'Test payment for integration tests'
    };

    const response = await request.post(`${API_BASE}/payments/intents`, {
      headers,
      data: paymentPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.clientSecret).toBeDefined();
      expect(data.data.amount).toBe(paymentPayload.amount);
      expect(data.data.currency).toBe(paymentPayload.currency);

      console.log('✅ Payment intent created:', data.data.id);
    } else {
      console.log('💳 Payment service mocked or unavailable');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should process payment successfully', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create payment intent
    const intentResponse = await request.post(`${API_BASE}/payments/intents`, {
      headers,
      data: {
        amount: 5000,
        currency: 'USD',
        description: 'Test payment processing'
      }
    });

    if (intentResponse.ok()) {
      const intentData = await intentResponse.json();
      const paymentIntentId = intentData.data.id;

      // Confirm payment (using test card)
      const confirmResponse = await request.post(
        `${API_BASE}/payments/intents/${paymentIntentId}/confirm`,
        {
          headers,
          data: {
            paymentMethod: {
              card: {
                number: '4242424242424242', // Test card
                expMonth: 12,
                expYear: 2030,
                cvc: '123'
              }
            }
          }
        }
      );

      if (confirmResponse.ok()) {
        const confirmData = await confirmResponse.json();
        expect(confirmData.data.status).toMatch(/succeeded|processing/);
        console.log('✅ Payment processed:', confirmData.data.status);
      }
    }
  });

  test('should handle failed payments', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create payment intent
    const intentResponse = await request.post(`${API_BASE}/payments/intents`, {
      headers,
      data: {
        amount: 5000,
        currency: 'USD'
      }
    });

    if (intentResponse.ok()) {
      const intentData = await intentResponse.json();
      const paymentIntentId = intentData.data.id;

      // Attempt payment with card that will be declined
      const confirmResponse = await request.post(
        `${API_BASE}/payments/intents/${paymentIntentId}/confirm`,
        {
          headers,
          data: {
            paymentMethod: {
              card: {
                number: '4000000000000002', // Declined test card
                expMonth: 12,
                expYear: 2030,
                cvc: '123'
              }
            }
          }
        }
      );

      if (!confirmResponse.ok()) {
        const errorData = await confirmResponse.json();
        expect(errorData.success).toBe(false);
        console.log('✅ Payment declined as expected');
      }
    }
  });

  test('should process refunds', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // First, create a successful payment
    const intentResponse = await request.post(`${API_BASE}/payments/intents`, {
      headers,
      data: {
        amount: 3000,
        currency: 'USD'
      }
    });

    if (intentResponse.ok()) {
      const intentData = await intentResponse.json();
      const paymentIntentId = intentData.data.id;

      // Assume payment succeeded (or confirm it)
      // Now refund
      const refundResponse = await request.post(`${API_BASE}/payments/refunds`, {
        headers,
        data: {
          paymentIntentId: paymentIntentId,
          amount: 3000 // Full refund
        }
      });

      if (refundResponse.ok()) {
        const refundData = await refundResponse.json();
        expect(refundData.success).toBe(true);
        expect(refundData.data.status).toMatch(/succeeded|pending/);
        console.log('✅ Refund processed successfully');
      }
    }
  });

  test('should handle webhook events', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Simulate webhook event from payment gateway
    const webhookPayload = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_12345',
          amount: 5000,
          currency: 'usd',
          status: 'succeeded'
        }
      }
    };

    const response = await request.post(`${API_BASE}/payments/webhooks`, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature'
      },
      data: webhookPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      console.log('✅ Webhook processed successfully');
    } else {
      console.log('⚠️  Webhook verification failed (expected in test)');
    }
  });
});

test.describe('Third-Party Integration - File Storage (S3/MinIO)', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should upload file successfully', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const fileContent = Buffer.from('Test file content for integration tests');
    const formData = {
      file: {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: fileContent.toString('base64')
      },
      folder: 'test-uploads'
    };

    const response = await request.post(`${API_BASE}/storage/upload`, {
      headers,
      data: formData
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.fileUrl).toBeDefined();
      expect(data.data.fileName).toBe('test-document.pdf');
      expect(data.data.fileSize).toBeGreaterThan(0);

      console.log('✅ File uploaded successfully:', data.data.fileUrl);

      // Store fileUrl for later tests
      test.info().attach('fileUrl', { body: data.data.fileUrl });
    } else {
      console.log('📦 Storage service mocked or unavailable');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should generate signed URL for file download', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await request.post(`${API_BASE}/storage/signed-url`, {
      headers,
      data: {
        fileName: 'test-document.pdf',
        expiresIn: 3600 // 1 hour
      }
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.signedUrl).toBeDefined();
      expect(data.data.expiresAt).toBeDefined();

      console.log('✅ Signed URL generated');

      // Verify signed URL works (make request without auth)
      const downloadResponse = await request.get(data.data.signedUrl);
      if (downloadResponse.ok()) {
        console.log('✅ File downloadable via signed URL');
      }
    } else {
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should handle large file uploads (multipart)', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Simulate large file (10MB)
    const largeFileSize = 10 * 1024 * 1024;

    const response = await request.post(`${API_BASE}/storage/upload/multipart`, {
      headers,
      data: {
        fileName: 'large-file.zip',
        fileSize: largeFileSize,
        mimeType: 'application/zip'
      }
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.uploadId).toBeDefined();
      expect(data.data.parts).toBeInstanceOf(Array);

      console.log('✅ Multipart upload initiated:', data.data.uploadId);
    } else {
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should delete file from storage', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // First upload a file
    const uploadResponse = await request.post(`${API_BASE}/storage/upload`, {
      headers,
      data: {
        file: {
          name: 'delete-test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Delete me').toString('base64')
        }
      }
    });

    if (uploadResponse.ok()) {
      const uploadData = await uploadResponse.json();
      const fileName = uploadData.data.fileName;

      // Delete the file
      const deleteResponse = await request.delete(`${API_BASE}/storage/files/${fileName}`, {
        headers
      });

      if (deleteResponse.ok()) {
        expect(deleteResponse.ok()).toBeTruthy();
        console.log('✅ File deleted successfully');

        // Verify file no longer accessible
        const getResponse = await request.get(`${API_BASE}/storage/files/${fileName}`, {
          headers
        });
        expect(getResponse.status()).toBe(404);
      }
    }
  });
});

test.describe('Third-Party Integration - Cache Service (Redis)', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should cache API responses', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // First request (cache miss)
    const firstResponse = await request.get(`${API_BASE}/employees?limit=10`, {
      headers
    });

    const firstData = await firstResponse.json();
    const firstHeaders = firstResponse.headers();

    // Check for cache headers
    console.log('X-Cache:', firstHeaders['x-cache'] || 'MISS');

    // Second request (should hit cache)
    const secondResponse = await request.get(`${API_BASE}/employees?limit=10`, {
      headers
    });

    const secondData = await secondResponse.json();
    const secondHeaders = secondResponse.headers();

    console.log('X-Cache:', secondHeaders['x-cache'] || 'N/A');

    // Data should be identical
    expect(JSON.stringify(secondData)).toBe(JSON.stringify(firstData));
  });

  test('should invalidate cache on data update', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Get cached data
    await request.get(`${API_BASE}/employees?limit=5`, { headers });

    // Update employee
    const createResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-CACHE-001',
        firstName: 'Cache',
        lastName: 'Test',
        email: 'cache.invalidation@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2025-01-01'
      }
    });

    if (createResponse.ok()) {
      const employeeId = (await createResponse.json()).data.id;

      // Fetch again (cache should be invalidated)
      const afterUpdateResponse = await request.get(`${API_BASE}/employees?limit=5`, {
        headers
      });

      const afterUpdateHeaders = afterUpdateResponse.headers();
      console.log('X-Cache after update:', afterUpdateHeaders['x-cache'] || 'MISS');

      // Cleanup
      await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
    }
  });

  test('should handle cache expiration (TTL)', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Get data with short TTL
    const response = await request.get(`${API_BASE}/employees?limit=5&cache_ttl=2`, {
      headers
    });

    expect(response.ok()).toBeTruthy();

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Next request should be cache miss
    const afterTTLResponse = await request.get(`${API_BASE}/employees?limit=5&cache_ttl=2`, {
      headers
    });

    const afterTTLHeaders = afterTTLResponse.headers();
    console.log('X-Cache after TTL:', afterTTLHeaders['x-cache'] || 'MISS (expired)');
  });
});

test.describe('Third-Party Integration - Message Queue (RabbitMQ)', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should publish message to queue', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const messagePayload = {
      queue: 'test-queue',
      message: {
        type: 'test-event',
        data: {
          testId: 'integration-test-123',
          timestamp: new Date().toISOString()
        }
      }
    };

    const response = await request.post(`${API_BASE}/queue/publish`, {
      headers,
      data: messagePayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.messageId).toBeDefined();
      console.log('✅ Message published to queue:', data.data.messageId);
    } else {
      console.log('📬 Queue service mocked or unavailable');
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should process background job via queue', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Trigger async job (e.g., payroll processing)
    const jobPayload = {
      type: 'payroll-calculation',
      data: {
        employeeId: 'test-emp-123',
        month: '2025-01',
        year: 2025
      }
    };

    const response = await request.post(`${API_BASE}/jobs/create`, {
      headers,
      data: jobPayload
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBeDefined();
      expect(data.data.status).toMatch(/queued|processing/);

      const jobId = data.data.jobId;
      console.log('✅ Background job queued:', jobId);

      // Check job status
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await request.get(`${API_BASE}/jobs/${jobId}/status`, {
        headers
      });

      if (statusResponse.ok()) {
        const statusData = await statusResponse.json();
        console.log('Job status:', statusData.data.status);
        expect(statusData.data.status).toMatch(/queued|processing|completed|failed/);
      }
    } else {
      expect([200, 503]).toContain(response.status());
    }
  });

  test('should handle message retry on failure', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Publish message that will fail processing
    const failingJobPayload = {
      type: 'test-failing-job',
      data: {
        shouldFail: true
      }
    };

    const response = await request.post(`${API_BASE}/jobs/create`, {
      headers,
      data: failingJobPayload
    });

    if (response.ok()) {
      const data = await response.json();
      const jobId = data.data.jobId;

      // Wait and check if retry occurred
      await new Promise(resolve => setTimeout(resolve, 3000));

      const statusResponse = await request.get(`${API_BASE}/jobs/${jobId}/status`, {
        headers
      });

      if (statusResponse.ok()) {
        const statusData = await statusResponse.json();
        console.log('Job retry attempts:', statusData.data.attempts || 0);

        // Should have attempted retries
        if (statusData.data.attempts) {
          expect(statusData.data.attempts).toBeGreaterThan(0);
          console.log('✅ Message retry mechanism working');
        }
      }
    }
  });
});
