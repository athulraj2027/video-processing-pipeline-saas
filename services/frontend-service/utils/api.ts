import { env } from "./env";

export class ApiError extends Error {
    status: number;
    payload: any;

    constructor(message: string, status: number, payload: any = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

interface FetchApiOptions extends Omit<RequestInit, "body"> {
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    token?: string;
    idempotencyKey?: string;
}

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * A boilerplate function to send HTTP requests from the frontend to the backend.
 * Automatically handles:
 * - URL building with backend base URL and query parameters.
 * - JSON stringification for non-FormData request bodies.
 * - Setting standard headers (e.g. Content-Type: application/json).
 * - Appending the Authorization JWT Bearer token if present.
 * - Injecting an Idempotency-Key header for state-modifying requests.
 * - Structured error handling by throwing ApiError for non-2xx responses.
 */
export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
    const { body, params, token, headers, idempotencyKey, ...customOptions } = options;

    // 1. Build URL with query parameters
    let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                searchParams.append(key, String(val));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // 2. Set headers
    const requestHeaders = new Headers(headers);

    // Automatically set Content-Type to JSON if body is present and not FormData
    if (body && !(body instanceof FormData)) {
        if (!requestHeaders.has("Content-Type")) {
            requestHeaders.set("Content-Type", "application/json");
        }
    }

    // Inject JWT Authorization header if token is provided or stored in cookies/localStorage
    const authToken = token || getAuthToken();
    if (authToken) {
        requestHeaders.set("Authorization", `Bearer ${authToken}`);
    }

    // Inject Idempotency-Key header for state-modifying requests (POST, PUT, PATCH)
    const isWriteMethod = ["POST", "PUT", "PATCH"].includes((customOptions.method || "").toUpperCase());
    if (isWriteMethod) {
        const idKey = idempotencyKey || generateUUID();
        requestHeaders.set("Idempotency-Key", idKey);
    }

    // 3. Prepare request init
    const requestInit: RequestInit = {
        ...customOptions,
        headers: requestHeaders,
    };

    if (body) {
        requestInit.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    // 4. Perform the request
    const response = await fetch(url, requestInit);

    // 5. Handle response content
    let responseData: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
    } else {
        responseData = await response.text();
    }

    // 6. Handle automatic token refresh for 401 Unauthorized responses
    const isAuthRoute = endpoint.includes("/auth/login") ||
        endpoint.includes("/auth/refresh") ||
        endpoint.includes("/auth/verify-email") ||
        endpoint.includes("/auth/signup");

    if (response.status === 401 && !isAuthRoute) {
        try {
            // Attempt to refresh the token
            const refreshUrl = `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}api/v1/auth/refresh`;

            const localRefreshToken = getCookie("refreshToken") || null;

            const refreshRes = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: localRefreshToken,
                }),
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccessToken = refreshData.accessToken || refreshData.token;
                const newRefreshToken = refreshData.refreshToken;

                if (typeof window !== "undefined") {
                    if (newAccessToken) {
                        document.cookie = `token=${newAccessToken}; path=/; max-age=86400; SameSite=Lax`;
                    }
                    if (newRefreshToken) {
                        document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Lax`;
                    }
                }

                // Update original authorization header and retry original request
                if (newAccessToken) {
                    const newHeaders = new Headers(requestInit.headers);
                    newHeaders.set("Authorization", `Bearer ${newAccessToken}`);
                    requestInit.headers = newHeaders;

                    const retryResponse = await fetch(url, requestInit);

                    let retryData: any;
                    const retryContentType = retryResponse.headers.get("content-type");
                    if (retryContentType && retryContentType.includes("application/json")) {
                        retryData = await retryResponse.json();
                    } else {
                        retryData = await retryResponse.text();
                    }

                    if (!retryResponse.ok) {
                        const errMessage = retryData?.message || retryData?.error || `HTTP error! Status: ${retryResponse.status}`;
                        throw new ApiError(errMessage, retryResponse.status, retryData);
                    }

                    return retryData as T;
                }
            } else {
                // Refresh token invalid/expired, clear local storage
                if (typeof window !== "undefined") {
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                }
            }
        } catch (refreshError) {
            console.error("Automatic token refresh failed:", refreshError);
        }
    }

    if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || `HTTP error! Status: ${response.status}`;
        throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData as T;
}

/**
 * Helper utility to extract cookies on the client side.
 */
function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
}

/**
 * Retrieves the authorization token from storage (cookie or localStorage).
 */
function getAuthToken(): string | undefined {
    if (typeof window === "undefined") return undefined;
    // Try to get from cookie
    return getCookie("token") || undefined;
}

/**
 * Generates a unique UUID or fallback random identifier.
 */
function generateUUID(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
