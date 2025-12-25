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

  /**
   * Build URL with query parameters
   */
  private static buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);

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
  private static async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
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
    } catch {
      if (error instanceof APIError) {
        throw error;
      }

      // Network or other errors
      throw new APIError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      );
    }
  }

  /**
   * GET request
   */
  static async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }
}
