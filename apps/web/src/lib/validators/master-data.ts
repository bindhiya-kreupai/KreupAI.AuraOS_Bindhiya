import { z } from 'zod';

// Generic Master Data Query Schema
export const MasterDataQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

// Country Schemas
export const CreateCountrySchema = z.object({
  isoCode: z.string().min(2).max(3).toUpperCase(),
  name: z.string().min(1).max(100),
  currency: z.string().min(3).max(3).toUpperCase(),
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

// State Schemas
export const CreateStateSchema = z.object({
  countryId: z.string().uuid('Invalid country ID'),
  code: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(1).max(100),
});

export const UpdateStateSchema = CreateStateSchema.partial();

export const StateQuerySchema = MasterDataQuerySchema.extend({
  countryId: z.string().uuid().optional(),
});

// City Schemas
export const CreateCitySchema = z.object({
  stateId: z.string().uuid('Invalid state ID'),
  name: z.string().min(1).max(100),
});

export const UpdateCitySchema = CreateCitySchema.partial();

export const CityQuerySchema = MasterDataQuerySchema.extend({
  stateId: z.string().uuid().optional(),
});

// Currency Schemas
export const CreateCurrencySchema = z.object({
  code: z.string().min(3).max(3).toUpperCase(),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(5),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const UpdateCurrencySchema = CreateCurrencySchema.partial();

// Language Schemas
export const CreateLanguageSchema = z.object({
  code: z.string().min(2).max(5).toLowerCase(),
  name: z.string().min(1).max(100),
  isRTL: z.boolean().optional().default(false),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const UpdateLanguageSchema = CreateLanguageSchema.partial();

// Type exports
export type MasterDataQueryInput = z.infer<typeof MasterDataQuerySchema>;
export type CreateCountryInput = z.infer<typeof CreateCountrySchema>;
export type UpdateCountryInput = z.infer<typeof UpdateCountrySchema>;
export type CreateStateInput = z.infer<typeof CreateStateSchema>;
export type UpdateStateInput = z.infer<typeof UpdateStateSchema>;
export type StateQueryInput = z.infer<typeof StateQuerySchema>;
export type CreateCityInput = z.infer<typeof CreateCitySchema>;
export type UpdateCityInput = z.infer<typeof UpdateCitySchema>;
export type CityQueryInput = z.infer<typeof CityQuerySchema>;
export type CreateCurrencyInput = z.infer<typeof CreateCurrencySchema>;
export type UpdateCurrencyInput = z.infer<typeof UpdateCurrencySchema>;
export type CreateLanguageInput = z.infer<typeof CreateLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof UpdateLanguageSchema>;
