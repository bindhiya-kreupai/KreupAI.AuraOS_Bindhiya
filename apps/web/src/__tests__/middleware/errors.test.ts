/**
 * Error Classes & Serialization Tests
 *
 * Covers: ApplicationError hierarchy, serializeError, bilingual messages
 */

import { describe, it, expect } from 'vitest';
import {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  TenantIsolationError,
  BusinessRuleError,
  isOperationalError,
  serializeError,
  getErrorStatusCode,
} from '@/lib/errors';

describe('Error Classes', () => {
  describe('ApplicationError', () => {
    it('should create with default values', () => {
      const error = new ApplicationError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.messageAr).toBe('خطأ داخلي في الخادم');
    });

    it('should accept custom values', () => {
      const error = new ApplicationError('Custom', 422, 'BUSINESS_RULE_VIOLATION', false, {
        field: 'name',
      });
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(error.isOperational).toBe(false);
      expect(error.context).toEqual({ field: 'name' });
      expect(error.messageAr).toBe('انتهاك قاعدة العمل');
    });

    it('should fall back to INTERNAL_ERROR Arabic for unknown code', () => {
      const error = new ApplicationError('test', 500, 'UNKNOWN_CODE');
      expect(error.messageAr).toBe('خطأ داخلي في الخادم');
    });
  });

  describe('ValidationError', () => {
    it('should have 400 status and correct code', () => {
      const error = new ValidationError('Invalid email');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.messageAr).toBe('خطأ في التحقق من البيانات');
    });
  });

  describe('AuthenticationError', () => {
    it('should have 401 status with default message', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication failed');
      expect(error.messageAr).toBe('فشل المصادقة');
    });
  });

  describe('AuthorizationError', () => {
    it('should have 403 status', () => {
      const error = new AuthorizationError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.messageAr).toBe('صلاحيات غير كافية');
    });
  });

  describe('NotFoundError', () => {
    it('should include resource name in message', () => {
      const error = new NotFoundError('Employee');
      expect(error.message).toBe('Employee not found');
      expect(error.statusCode).toBe(404);
      expect(error.messageAr).toBe('المورد غير موجود');
    });
  });

  describe('ConflictError', () => {
    it('should have 409 status', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.messageAr).toBe('تعارض في البيانات');
    });
  });

  describe('RateLimitError', () => {
    it('should have 429 status', () => {
      const error = new RateLimitError();
      expect(error.statusCode).toBe(429);
      expect(error.messageAr).toBe('تم تجاوز حد الطلبات');
    });
  });

  describe('DatabaseError', () => {
    it('should have 500 status', () => {
      const error = new DatabaseError('Connection refused');
      expect(error.statusCode).toBe(500);
      expect(error.messageAr).toBe('خطأ في قاعدة البيانات');
    });
  });

  describe('ExternalServiceError', () => {
    it('should include service name in message', () => {
      const error = new ExternalServiceError('Stripe', 'Payment failed');
      expect(error.message).toBe('Stripe: Payment failed');
      expect(error.statusCode).toBe(502);
      expect(error.messageAr).toBe('خطأ في الخدمة الخارجية');
    });
  });

  describe('TenantIsolationError', () => {
    it('should have 403 status', () => {
      const error = new TenantIsolationError();
      expect(error.statusCode).toBe(403);
      expect(error.messageAr).toBe('انتهاك عزل المستأجر');
    });
  });

  describe('BusinessRuleError', () => {
    it('should have 422 status', () => {
      const error = new BusinessRuleError('Cannot approve own request');
      expect(error.statusCode).toBe(422);
      expect(error.messageAr).toBe('انتهاك قاعدة العمل');
    });
  });
});

describe('isOperationalError', () => {
  it('should return true for operational ApplicationError', () => {
    expect(isOperationalError(new ValidationError('bad input'))).toBe(true);
  });

  it('should return false for non-operational ApplicationError', () => {
    const error = new ApplicationError('crash', 500, 'INTERNAL_ERROR', false);
    expect(isOperationalError(error)).toBe(false);
  });

  it('should return false for plain Error', () => {
    expect(isOperationalError(new Error('random'))).toBe(false);
  });
});

describe('serializeError', () => {
  it('should serialize ApplicationError with messageAr', () => {
    const error = new ValidationError('Email is required', { field: 'email' });
    const serialized = serializeError(error);

    expect(serialized.success).toBe(false);
    expect(serialized.error.message).toBe('Email is required');
    expect(serialized.error.messageAr).toBe('خطأ في التحقق من البيانات');
    expect(serialized.error.code).toBe('VALIDATION_ERROR');
    expect(serialized.error.context).toEqual({ field: 'email' });
  });

  it('should include stack trace in development', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new ValidationError('test');
    const serialized = serializeError(error);
    expect(serialized.error.stack).toBeDefined();

    process.env.NODE_ENV = origEnv;
  });

  it('should hide stack trace in production for ApplicationError', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new ValidationError('test');
    const serialized = serializeError(error);
    expect(serialized.error.stack).toBeUndefined();

    process.env.NODE_ENV = origEnv;
  });

  it('should mask internal details for plain Error in production', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('SQL injection detected in column XYZ');
    const serialized = serializeError(error);

    expect(serialized.success).toBe(false);
    expect(serialized.error.message).toBe('An unexpected error occurred');
    expect(serialized.error.messageAr).toBe('خطأ داخلي في الخادم');
    expect(serialized.error.code).toBe('INTERNAL_ERROR');
    expect(serialized.error.stack).toBeUndefined();

    process.env.NODE_ENV = origEnv;
  });

  it('should show full details for plain Error in development', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('DB crash');
    const serialized = serializeError(error);

    expect(serialized.error.message).toBe('DB crash');
    expect(serialized.error.stack).toBeDefined();

    process.env.NODE_ENV = origEnv;
  });
});

describe('getErrorStatusCode', () => {
  it('should return status code from ApplicationError', () => {
    expect(getErrorStatusCode(new NotFoundError('x'))).toBe(404);
    expect(getErrorStatusCode(new ValidationError('x'))).toBe(400);
    expect(getErrorStatusCode(new RateLimitError())).toBe(429);
  });

  it('should return 500 for plain Error', () => {
    expect(getErrorStatusCode(new Error('random'))).toBe(500);
  });
});
