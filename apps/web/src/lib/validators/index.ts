import { NextResponse } from 'next/server';
import type { z} from 'zod';
import { ZodError } from 'zod';

export * from './competency-library';
export * from './user-management';
export * from './master-data';

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ZodError
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validates query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @param searchParams - URLSearchParams to validate
 * @returns Validated query parameters or throws ZodError
 */
export function validateQueryParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return schema.parse(params);
}

/**
 * Formats Zod validation errors into a user-friendly format
 * @param error - ZodError instance
 * @returns Formatted error object
 */
export function formatValidationError(error: ZodError) {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    success: false,
    error: 'Validation failed',
    details: errors,
  };
}

/**
 * Creates a validation error response
 * @param error - ZodError instance
 * @returns NextResponse with formatted validation errors
 */
export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    formatValidationError(error),
    { status: 400 }
  );
}

/**
 * Wrapper for API route handlers with automatic validation
 * @param schema - Zod schema for request body validation
 * @param handler - API route handler function
 * @returns Wrapped handler with validation
 */
export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (validatedData: z.infer<T>, request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validatedData = validateRequest(schema, body);
      return await handler(validatedData, request);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }
      throw error;
    }
  };
}
