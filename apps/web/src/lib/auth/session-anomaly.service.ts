import { logger } from '@/lib/logger';

export interface AnomalyEvent {
  type: 'NEW_DEVICE' | 'NEW_LOCATION' | 'NEW_IP';
  userId: string;
  email: string;
  ipAddress: string;
  device: string;
  location: string;
  timestamp: string;
}

export async function logAnomalyEvent(event: AnomalyEvent, prisma: any): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: '',
        userId: event.userId,
        action: 'ANOMALY',
        module: 'Session Security',
        resourceType: 'Session Management',
        metadata: {
          description: generateAnomalyDescription(event),
          anomalyType: event.type,
          ipAddress: event.ipAddress,
          device: event.device,
          location: event.location,
        },
        ipAddress: event.ipAddress,
      },
    });

    logger.warn(
      {
        userId: event.userId,
        email: event.email,
        anomalyType: event.type,
        ipAddress: event.ipAddress,
        device: event.device,
      },
      'Session anomaly detected'
    );
  } catch (error: any) {
    logger.error({ error, userId: event.userId }, 'Failed to log anomaly event');
  }
}

function generateAnomalyDescription(event: AnomalyEvent): string {
  switch (event.type) {
    case 'NEW_DEVICE':
      return `New device login detected: ${event.device} from ${event.location || event.ipAddress}`;
    case 'NEW_LOCATION':
      return `Login from new location: ${event.location} (device: ${event.device})`;
    case 'NEW_IP':
      return `Login from new IP address: ${event.ipAddress} (device: ${event.device})`;
    default:
      return `Suspicious login activity: ${event.ipAddress} (${event.device})`;
  }
}
