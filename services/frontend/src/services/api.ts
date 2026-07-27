import { authStorage } from '@/lib/auth-storage';

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api/v1')
  : (process.env.API_GATEWAY_URL ? `${process.env.API_GATEWAY_URL}/api/v1` : 'http://localhost:4000/api/v1');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message?: string) {
    super(message || data?.message || 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

async function performRefresh(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Refresh token invalid');
  }

  const data = await response.json();
  if (!data.accessToken) {
    throw new Error('No access token returned from refresh endpoint');
  }

  authStorage.setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // Inject Tenant Host header for development gateway resolution
  const tenantHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  requestHeaders.set('X-Tenant-Host', tenantHost);

  // Inject token if available
  if (!skipAuth) {
    const token = authStorage.getAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  try {
    let response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    // Handle Token Expiry
    if (response.status === 401 && !skipAuth && authStorage.getRefreshToken()) {
      if (isRefreshing) {
        // Wait for active refresh to complete
        const newToken = await new Promise<string>((resolve) => {
          refreshQueue.push((token) => resolve(token));
        });
        requestHeaders.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, { ...rest, headers: requestHeaders });
      } else {
        isRefreshing = true;
        try {
          const newToken = await performRefresh();
          isRefreshing = false;
          processQueue(newToken);

          requestHeaders.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(url, { ...rest, headers: requestHeaders });
        } catch (err) {
          isRefreshing = false;
          refreshQueue = [];
          authStorage.clear();
          // Optionally trigger dynamic redirect on client
          if (typeof window !== 'undefined') {
            const isCreatorPath = window.location.pathname.startsWith('/creator');
            window.location.href = isCreatorPath ? '/creator/signin' : '/viewer/signin';
          }
          throw new ApiError(401, { message: 'Session expired. Please log in again.' });
        }
      }
    }

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, { message: error instanceof Error ? error.message : 'Network error occurred' });
  }
}
