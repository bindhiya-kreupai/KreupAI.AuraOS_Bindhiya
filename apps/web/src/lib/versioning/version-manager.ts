/**
 * API Version Manager
 * Centralized version management and migration logic
 */

import { ApiVersion } from '@/lib/middleware/api-version';

/**
 * Version metadata
 */
export interface VersionMetadata {
  version: ApiVersion;
  releaseDate: string;
  status: 'active' | 'deprecated' | 'sunset';
  sunsetDate?: string;
  changelog: string[];
  breakingChanges: string[];
}

/**
 * Version registry
 */
export const VERSION_REGISTRY: Record<ApiVersion, VersionMetadata> = {
  v1: {
    version: 'v1',
    releaseDate: '2025-12-21',
    status: 'active',
    changelog: [
      'Initial API release',
      'User management endpoints',
      'License management',
      'Master data APIs',
      'Authentication & authorization',
      'Audit logging',
      'Rate limiting',
      'Tenant isolation',
      'Query performance monitoring',
    ],
    breakingChanges: [],
  },
};

/**
 * Get version metadata
 */
export function getVersionMetadata(version: ApiVersion): VersionMetadata {
  return VERSION_REGISTRY[version];
}

/**
 * Get all active versions
 */
export function getActiveVersions(): ApiVersion[] {
  return Object.values(VERSION_REGISTRY)
    .filter((meta) => meta.status === 'active')
    .map((meta) => meta.version);
}

/**
 * Get all deprecated versions
 */
export function getDeprecatedVersions(): ApiVersion[] {
  return Object.values(VERSION_REGISTRY)
    .filter((meta) => meta.status === 'deprecated')
    .map((meta) => meta.version);
}

/**
 * Data transformation between versions
 */
export class VersionTransformer {
  /**
   * Transform request data from client version to internal version
   */
  static transformRequest<T>(
    data: T,
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): T {
    // Currently all versions use the same schema
    // Add transformation logic when v2 is introduced
    if (fromVersion === toVersion) {
      return data;
    }

    // Example transformation (when v2 is released):
    // if (fromVersion === 'v1' && toVersion === 'v2') {
    //   return this.transformV1ToV2Request(data);
    // }

    return data;
  }

  /**
   * Transform response data from internal version to client version
   */
  static transformResponse<T>(
    data: T,
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): T {
    // Currently all versions use the same schema
    if (fromVersion === toVersion) {
      return data;
    }

    // Example transformation (when v2 is released):
    // if (fromVersion === 'v2' && toVersion === 'v1') {
    //   return this.transformV2ToV1Response(data);
    // }

    return data;
  }

  /**
   * Example: Transform v1 request to v2 (future use)
   */
  // private static transformV1ToV2Request<T>(data: T): T {
  //   // Example: Rename fields, restructure data, etc.
  //   return data;
  // }

  /**
   * Example: Transform v2 response to v1 (future use)
   */
  // private static transformV2ToV1Response<T>(data: T): T {
  //   // Example: Ensure backward compatibility
  //   return data;
  // }
}

/**
 * Version compatibility checker
 */
export class VersionCompatibility {
  /**
   * Check if two versions are compatible
   */
  static isCompatible(version1: ApiVersion, version2: ApiVersion): boolean {
    // Currently only v1 exists, all compatible
    return true;

    // Future logic:
    // const major1 = this.getMajorVersion(version1);
    // const major2 = this.getMajorVersion(version2);
    // return major1 === major2;
  }

  /**
   * Get major version number
   */
  static getMajorVersion(version: ApiVersion): number {
    return parseInt(version.replace('v', ''));
  }

  /**
   * Check if version supports a specific feature
   */
  static supportsFeature(version: ApiVersion, feature: string): boolean {
    const metadata = getVersionMetadata(version);

    // All v1 features are supported
    const v1Features = [
      'user-management',
      'license-management',
      'master-data',
      'monitoring',
      'audit-logs',
      'roles',
      'sessions',
      'authentication',
    ];

    return v1Features.includes(feature);
  }

  /**
   * Get recommended version for a feature
   */
  static getRecommendedVersion(feature: string): ApiVersion {
    // Always recommend latest for now
    return 'v1';

    // Future logic:
    // const activeVersions = getActiveVersions();
    // return activeVersions[activeVersions.length - 1];
  }
}

/**
 * Migration guide generator
 */
export class MigrationGuide {
  /**
   * Get migration steps from one version to another
   */
  static getMigrationSteps(
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): string[] {
    if (fromVersion === toVersion) {
      return ['No migration needed - versions are the same'];
    }

    // Future: Return version-specific migration steps
    return [
      `Migrating from ${fromVersion} to ${toVersion}`,
      'Review breaking changes in changelog',
      'Update API endpoints to use new version',
      'Test all integrations',
      'Update error handling for new response formats',
      'Monitor for deprecation warnings',
    ];
  }

  /**
   * Get breaking changes between versions
   */
  static getBreakingChanges(
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): string[] {
    const fromMeta = getVersionMetadata(fromVersion);
    const toMeta = getVersionMetadata(toVersion);

    if (fromVersion === toVersion) {
      return [];
    }

    // Return breaking changes from target version
    return toMeta.breakingChanges;
  }

  /**
   * Generate migration checklist
   */
  static generateChecklist(
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): {
    task: string;
    required: boolean;
    description: string;
  }[] {
    return [
      {
        task: 'Review changelog',
        required: true,
        description: `Review all changes in ${toVersion}`,
      },
      {
        task: 'Update API endpoints',
        required: true,
        description: `Change all API calls to use /api/${toVersion}/...`,
      },
      {
        task: 'Update request/response handling',
        required: true,
        description: 'Adapt to any schema changes',
      },
      {
        task: 'Test error scenarios',
        required: true,
        description: 'Verify error handling works with new version',
      },
      {
        task: 'Update documentation',
        required: true,
        description: 'Update internal docs to reflect API version change',
      },
      {
        task: 'Monitor deprecation warnings',
        required: false,
        description: 'Watch for deprecation headers in responses',
      },
    ];
  }
}

/**
 * Version announcement system
 */
export interface VersionAnnouncement {
  version: ApiVersion;
  type: 'release' | 'deprecation' | 'sunset';
  date: string;
  title: string;
  message: string;
  actionRequired: boolean;
}

export class VersionAnnouncements {
  /**
   * Get all active announcements
   */
  static getAnnouncements(): VersionAnnouncement[] {
    const announcements: VersionAnnouncement[] = [
      {
        version: 'v1',
        type: 'release',
        date: '2025-12-21',
        title: 'API v1 Released',
        message:
          'Initial release of AuraOS API with comprehensive HRMS functionality.',
        actionRequired: false,
      },
    ];

    return announcements.filter(
      (a) => new Date(a.date) <= new Date() // Only show past announcements
    );
  }

  /**
   * Get announcements for specific version
   */
  static getVersionAnnouncements(version: ApiVersion): VersionAnnouncement[] {
    return this.getAnnouncements().filter((a) => a.version === version);
  }

  /**
   * Get critical announcements (deprecation/sunset)
   */
  static getCriticalAnnouncements(): VersionAnnouncement[] {
    return this.getAnnouncements().filter(
      (a) => a.type === 'deprecation' || a.type === 'sunset'
    );
  }
}
