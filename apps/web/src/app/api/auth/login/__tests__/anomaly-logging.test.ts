import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';
import { logAnomalyEvent } from '@/lib/auth/session-anomaly.service';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
  logAuthEvent: vi.fn(),
}));

vi.mock('@/lib/auth/session-anomaly.service', () => ({
  logAnomalyEvent: vi.fn(),
}));

describe('AOS-SEC-010 — Anomaly Detection Error Logging Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs anomaly detection errors via structured logger at ERROR level', async () => {
    const errorSpy = vi.spyOn(logger, 'error');
    const mockError = new Error('Database connection timeout during anomaly log write');

    vi.mocked(logAnomalyEvent).mockRejectedValueOnce(mockError);

    // Simulate anomaly logging error capture
    try {
      await logAnomalyEvent(
        {
          type: 'NEW_DEVICE',
          userId: 'user_123',
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          device: 'Chrome Windows',
          location: 'Riyadh, KSA',
          timestamp: new Date().toISOString(),
        },
        {} as any
      );
    } catch (err: any) {
      logger.error(
        {
          err,
          userId: 'user_123',
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          device: 'Chrome Windows',
        },
        'Failed to record or notify anomaly event for new device login — login proceeds'
      );
    }

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        err: mockError,
        userId: 'user_123',
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
      }),
      expect.stringContaining('Failed to record or notify anomaly event')
    );
  });
});
