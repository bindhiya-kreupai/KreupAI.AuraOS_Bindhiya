/**
 * API Versioning Middleware
 * Handles API version negotiation via header, URL path, or query parameter
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Supported API versions
export const API_VERSIONS = ['v1'] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];

// Default version
export const DEFAULT_API_VERSION: ApiVersion = 'v1';

// Latest version
export const LATEST_API_VERSION: ApiVersion = 'v1';

// Deprecated versions with sunset dates
export const DEPRECATED_VERSIONS: Partial<Record<ApiVersion, string>> = {
  // Example: 'v0': '2025-12-31' // Sunset date
};

/**
 * Extract API version from request
 * Priority: URL path > Header > Query param > Default
 */
export function getApiVersion(request: NextRequest): ApiVersion {
  const url = new URL(request.url);

  // 1. Check URL path (e.g., /api/v1/users)
  const pathMatch = url.pathname.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    const version = pathMatch[1] as ApiVersion;
    if (isValidVersion(version)) {
      return version;
    }
  }

  // 2. Check Accept-Version header
  const headerVersion = request.headers.get('Accept-Version');
  if (headerVersion && isValidVersion(headerVersion as ApiVersion)) {
    return headerVersion as ApiVersion;
  }

  // 3. Check query parameter
  const queryVersion = url.searchParams.get('version');
  if (queryVersion && isValidVersion(queryVersion as ApiVersion)) {
    return queryVersion as ApiVersion;
  }

  // 4. Default version
  return DEFAULT_API_VERSION;
}

/**
 * Check if version is valid
 */
export function isValidVersion(version: string): version is ApiVersion {
  return API_VERSIONS.includes(version as ApiVersion);
}

/**
 * Check if version is deprecated
 */
export function isDeprecatedVersion(version: ApiVersion): boolean {
  return version in DEPRECATED_VERSIONS;
}

/**
 * Get sunset date for deprecated version
 */
export function getSunsetDate(version: ApiVersion): string | null {
  return DEPRECATED_VERSIONS[version] || null;
}

/**
 * API Version middleware
 * Adds version information to request headers and handles deprecated versions
 */
export function apiVersionMiddleware(request: NextRequest): NextResponse | null {
  const version = getApiVersion(request);

  // Check if version is deprecated
  if (isDeprecatedVersion(version)) {
    const sunsetDate = getSunsetDate(version);
    logger.warn(
      {
        version,
        sunsetDate,
        path: request.nextUrl.pathname,
      },
      'Deprecated API version used'
    );

    // Add deprecation warning headers
    const response = NextResponse.next();
    response.headers.set('X-API-Version', version);
    response.headers.set('X-API-Deprecated', 'true');
    if (sunsetDate) {
      response.headers.set('Sunset', sunsetDate);
      response.headers.set(
        'Link',
        `</api/${LATEST_API_VERSION}>; rel="successor-version"`
      );
    }
    response.headers.set(
      'Deprecation',
      'This API version is deprecated. Please migrate to the latest version.'
    );

    return response;
  }

  // Add version header to response
  const response = NextResponse.next();
  response.headers.set('X-API-Version', version);

  return response;
}

/**
 * Validate API version in route handler
 * Throws error if version is not supported
 */
export function validateApiVersion(request: NextRequest): ApiVersion {
  const version = getApiVersion(request);

  if (!isValidVersion(version)) {
    throw new Error(`Unsupported API version: ${version}`);
  }

  return version;
}

/**
 * Get version-specific response headers
 */
export function getVersionHeaders(version: ApiVersion): Record<string, string> {
  const headers: Record<string, string> = {
    'X-API-Version': version,
  };

  // Add deprecation headers if needed
  if (isDeprecatedVersion(version)) {
    headers['X-API-Deprecated'] = 'true';
    const sunsetDate = getSunsetDate(version);
    if (sunsetDate) {
      headers['Sunset'] = sunsetDate;
      headers['Link'] = `</api/${LATEST_API_VERSION}>; rel="successor-version"`;
    }
    headers['Deprecation'] =
      'This API version is deprecated. Please migrate to the latest version.';
  }

  return headers;
}

/**
 * Version-aware API response helper
 */
export function versionedResponse(
  data: any,
  version: ApiVersion,
  options?: {
    status?: number;
    headers?: Record<string, string>;
  }
): NextResponse {
  const versionHeaders = getVersionHeaders(version);
  const allHeaders = { ...versionHeaders, ...options?.headers };

  return NextResponse.json(data, {
    status: options?.status || 200,
    headers: allHeaders,
  });
}

/**
 * Handle unsupported version error
 */
export function handleUnsupportedVersion(
  requestedVersion: string
): NextResponse {
  logger.warn({ requestedVersion }, 'Unsupported API version requested');

  return NextResponse.json(
    {
      success: false,
      error: 'Unsupported API version',
      message: `API version '${requestedVersion}' is not supported. Supported versions: ${API_VERSIONS.join(', ')}`,
      supportedVersions: API_VERSIONS,
      latestVersion: LATEST_API_VERSION,
    },
    {
      status: 400,
      headers: {
        'X-API-Version': 'error',
      },
    }
  );
}

/**
 * Utility to check if a feature is available in a specific version
 */
export function isFeatureAvailable(
  feature: string,
  version: ApiVersion
): boolean {
  // Define feature availability per version
  const featureMatrix: Record<string, ApiVersion[]> = {
    'user-management': ['v1'],
    'license-management': ['v1'],
    'master-data': ['v1'],
    monitoring: ['v1'],
    // Add more features as needed
  };

  const availableVersions = featureMatrix[feature];
  return availableVersions ? availableVersions.includes(version) : false;
}

/**
 * Get API version from response headers (for testing)
 */
export function extractVersionFromResponse(response: Response): string | null {
  return response.headers.get('X-API-Version');
}
