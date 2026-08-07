import { fetchApi } from "@/utils/api";

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
        tenantId?: string;
    };
}

/**
 * Reusable and centralized API service calls for authentication endpoints.
 */
export const authService = {
    signup: async (email: string, password: string, role: string) => {
        return fetchApi("/api/v1/auth/signup", {
            method: "POST",
            body: { email, password, role },
        });
    },

    login: async (email: string, password: string, role: string) => {
        return fetchApi<AuthResponse>("/api/v1/auth/login", {
            method: "POST",
            body: { email, password, role },
        });
    },

    forgotPassword: async (email: string) => {
        return fetchApi("/api/v1/auth/forgot-password", {
            method: "POST",
            body: { email },
        });
    },

    verifyEmail: async (email: string, otp: string) => {
        return fetchApi<AuthResponse>("/api/v1/auth/verify-email", {
            method: "POST",
            body: { email, otp },
        });
    },

    resendVerifyOtp: async (email: string) => {
        return fetchApi("/api/v1/auth/resend-otp", {
            method: "POST",
            body: { email },
        });
    },

    resetPassword: async (email: string, otp: string, password: string) => {
        return fetchApi("/api/v1/auth/reset-password", {
            method: "POST",
            body: { email, otp, password },
        });
    },

    refresh: async (refreshToken?: string) => {
        return fetchApi<AuthResponse>("/api/v1/auth/refresh", {
            method: "POST",
            body: { refreshToken },
        });
    },

    getMe: async () => {
        return fetchApi<{ user: AuthResponse["user"] }>("/api/v1/auth/me", {
            method: "GET",
        });
    },
};
