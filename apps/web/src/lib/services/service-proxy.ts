/**
 * Service Proxy Helper
 * Standardizes communication between Next.js API routes and microservices
 */

import { servicesConfig } from './config/env';

export class ServiceProxy {
    /**
     * Proxies a request to a microservice
     * 
     * @param service Name of the service to proxy to
     * @param path The path on the microservice (without leading slash)
     * @param options Request options
     */
    static async request<T = any>(
        service: keyof typeof servicesConfig,
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const baseUrl = servicesConfig[service];
        const url = `${baseUrl}/${path.replace(/^\//, '')}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');
            const isJSON = contentType?.includes('application/json');

            if (!response.ok) {
                const error = isJSON ? await response.json() : { message: response.statusText };
                throw new Error(error.message || `Service ${service} request failed with status ${response.status}`);
            }

            if (response.status === 204) {
                return {} as T;
            }

            return isJSON ? await response.json() : ({} as T);
        } catch (error) {
            console.error(`[ServiceProxy] Error calling ${service}:`, error);
            throw error;
        }
    }

    /**
     * Specialized GET request
     */
    static async get<T = any>(
        service: keyof typeof servicesConfig,
        path: string,
        params?: Record<string, any>,
        headers?: HeadersInit
    ): Promise<T> {
        const query = params
            ? '?' + new URLSearchParams(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            ).toString()
            : '';

        return this.request<T>(service, `${path}${query}`, {
            method: 'GET',
            headers,
        });
    }

    /**
     * Specialized POST request
     */
    static async post<T = any>(
        service: keyof typeof servicesConfig,
        path: string,
        data?: any,
        headers?: HeadersInit
    ): Promise<T> {
        return this.request<T>(service, path, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            headers,
        });
    }

    /**
     * Specialized PUT request
     */
    static async put<T = any>(
        service: keyof typeof servicesConfig,
        path: string,
        data?: any,
        headers?: HeadersInit
    ): Promise<T> {
        return this.request<T>(service, path, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            headers,
        });
    }

    /**
     * Specialized DELETE request
     */
    static async delete<T = any>(
        service: keyof typeof servicesConfig,
        path: string,
        headers?: HeadersInit
    ): Promise<T> {
        return this.request<T>(service, path, {
            method: 'DELETE',
            headers,
        });
    }
}
