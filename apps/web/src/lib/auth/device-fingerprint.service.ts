import crypto from 'crypto';
import { logger } from '@/lib/logger';

export interface DeviceFingerprint {
  hash: string;
  userAgent: string;
  ipAddress: string;
  acceptLanguage: string | null;
}

const FINGERPRINT_SALT = process.env.DEVICE_FINGERPRINT_SALT || 'auraos-device-fingerprint';

export function generateDeviceFingerprint(
  userAgent: string,
  ipAddress: string,
  acceptLanguage?: string | null
): DeviceFingerprint {
  const raw = [userAgent, ipAddress, acceptLanguage || 'en-US', FINGERPRINT_SALT].join('||');

  const hash = crypto.createHash('sha256').update(raw).digest('hex');

  return {
    hash,
    userAgent: userAgent.substring(0, 200),
    ipAddress,
    acceptLanguage: acceptLanguage || null,
  };
}

export async function isKnownDevice(
  userId: string,
  fingerprintHash: string,
  prisma: any
): Promise<boolean> {
  try {
    const count = await prisma.userSession.count({
      where: {
        userId,
        deviceFingerprint: fingerprintHash,
      },
    });
    return count > 0;
  } catch (error: any) {
    logger.error({ error, userId }, 'Error checking known device');
    return true;
  }
}
