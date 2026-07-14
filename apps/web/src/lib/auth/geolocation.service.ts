import { logger } from '@/lib/logger';

const LOCAL_IPS = new Set(['127.0.0.1', '::1', 'localhost', '0.0.0.0', '::ffff:127.0.0.1']);

export interface GeoLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function resolveLocation(ipAddress: string): Promise<GeoLocation> {
  if (
    LOCAL_IPS.has(ipAddress) ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.')
  ) {
    return {
      city: null,
      region: null,
      country: null,
      timezone: null,
      latitude: null,
      longitude: null,
    };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=city,region,country,timezone,lat,lon&lang=en`,
      {
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) {
      logger.warn({ ipAddress, status: response.status }, 'Geolocation API returned error');
      return emptyLocation();
    }

    const data = await response.json();

    return {
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      timezone: data.timezone || null,
      latitude: data.lat ?? null,
      longitude: data.lon ?? null,
    };
  } catch (error: any) {
    if ((error as any)?.name === 'AbortError') {
      logger.warn({ ipAddress }, 'Geolocation API timed out');
    } else {
      logger.error({ error, ipAddress }, 'Geolocation API failed');
    }
    return emptyLocation();
  }
}

function emptyLocation(): GeoLocation {
  return {
    city: null,
    region: null,
    country: null,
    timezone: null,
    latitude: null,
    longitude: null,
  };
}

export function formatLocation(location: GeoLocation): string {
  const parts: string[] = [];
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  return parts.join(', ') || '';
}
