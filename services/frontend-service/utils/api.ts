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
}

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

/**
 * A boilerplate function to send HTTP requests from the frontend to the backend.
 * Automatically handles:
 * - URL building with backend base URL and query parameters.
 * - JSON stringification for non-FormData request bodies.
 * - Setting standard headers (e.g. Content-Type: application/json).
 * - Appending the Authorization JWT Bearer token if present.
 * - Structured error handling by throwing ApiError for non-2xx responses.
 */
export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
    const { body, params, token, headers, ...customOptions } = options;

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
    // Try to get from cookie first, then localStorage
    return getCookie("token") || localStorage.getItem("token") || undefined;
}
