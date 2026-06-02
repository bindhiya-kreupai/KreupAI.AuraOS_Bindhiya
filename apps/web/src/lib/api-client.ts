/**
 * API Client Helper
 * Centralized fetch wrapper with error handling, authentication, and type safety
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class APIClient {
  private static baseURL = '/api';

  private static getRequestOrigin(): string {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
  }

  /**
   * Build URL with query parameters
   */
  private static buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, this.getRequestOrigin());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Generic fetch wrapper
   */
  private static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    const url = this.buildURL(endpoint, params);

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');

      if (!response.ok) {
        const error = isJSON ? await response.json() : { message: response.statusText };
        throw new APIError(
          error.message || error.error || 'Request failed',
          response.status,
          error
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return isJSON ? await response.json() : ({} as T);
    } catch (error: any) {
      if (error instanceof APIError) {
        throw error;
      }

      // Network or other errors
      throw new APIError(error instanceof Error ? error.message : 'Network error', 0, error);
    }
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  static async post<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * PATCH request
   */
  static async patch<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }

  // ---------------------------------------------------------------------------
  // Envelope helpers
  // ---------------------------------------------------------------------------
  // The API surface mixes two response shapes:
  //   A) Flat:     { <hintKey>: T[] }
  //   B) Wrapped:  { success: true, data: T[] }
  //   C) Wrapped + nested: { success: true, data: { <hintKey>: T[] } }
  //   D) Wrapped + meta:   { success: true, data: T[], meta: {...} }
  // These helpers let services accept any of those without manual branching.

  static unwrapList<T = unknown>(response: unknown, hintKey?: string): T[] {
    if (response == null) return [];
    if (Array.isArray(response)) return response as T[];
    const obj = response as Record<string, any>;
    if (hintKey && Array.isArray(obj[hintKey])) return obj[hintKey] as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (obj.data && typeof obj.data === 'object') {
      if (hintKey && Array.isArray(obj.data[hintKey])) return obj.data[hintKey] as T[];
      for (const k of ['items', 'records', 'results']) {
        if (Array.isArray(obj.data[k])) return obj.data[k] as T[];
      }
    }
    for (const k of ['items', 'records', 'results']) {
      if (Array.isArray(obj[k])) return obj[k] as T[];
    }
    return [];
  }

  static unwrapItem<T = unknown>(response: unknown, hintKey?: string): T | null {
    if (response == null) return null;
    if (Array.isArray(response)) return null;
    const obj = response as Record<string, any>;
    if (obj.success === false) return null;
    if (hintKey && obj[hintKey] != null) return obj[hintKey] as T;
    if (obj.data != null && typeof obj.data === 'object') {
      if (hintKey && obj.data[hintKey] != null) return obj.data[hintKey] as T;
      return obj.data as T;
    }
    if (obj.data != null) return obj.data as T;
    // Drop common metadata-only wrappers so callers get the payload
    const { success, error, meta, ...rest } = obj;
    if (Object.keys(rest).length === 0) return null;
    return obj as T;
  }
}
