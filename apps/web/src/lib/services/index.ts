/**
 * Service Layer Index
 * Central export point for all service classes
 */

export { BaseService, type ServiceResponse, type ListOptions } from './base.service';
export { UserService, userService } from './user.service';
export { LicenseService, licenseService } from './license.service';
export { MasterDataService, masterDataService } from './master-data.service';

// Re-export types for convenience
export type {
  CreateUserInput,
  UpdateUserInput,
  UserQueryOptions,
} from './user.service';

export type {
  CreateLicenseInput,
  UpdateLicenseInput,
  LicenseQueryOptions,
} from './license.service';

export type {
  MasterDataQueryOptions,
  EntityConfig,
} from './master-data.service';
