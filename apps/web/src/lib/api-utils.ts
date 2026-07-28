export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: { message: string; messageAr?: string };
}

export async function apiJson<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      return {
        ok: false,
        error: json?.error || { message: `Request failed (${res.status})` },
      };
    }
    return { ok: true, data: json?.data as T };
  } catch (err: any) {
    return { ok: false, error: { message: err?.message || 'Network error' } };
  }
}

export async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) return null;
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}
