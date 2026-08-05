import { fetchApi } from "@/utils/api";

export interface LoginResponse {
    token: string;
}

/**
 * Reusable and centralized API service calls for authentication endpoints.
 */
export const authService = {
    signup: async (email: string, password: string) => {
        return fetchApi("/api/v1/auth/signup", {
            method: "POST",
            body: { email, password },
        });
    },

    login: async (email: string, password: string) => {
        return fetchApi<LoginResponse>("/api/v1/auth/login", {
            method: "POST",
            body: { email, password },
        });
    },

    forgotPassword: async (email: string) => {
        return fetchApi("/api/v1/auth/forgot-password", {
            method: "POST",
            body: { email },
        });
    },

    verifyEmail: async (email: string, otp: string) => {
        return fetchApi("/api/v1/auth/verify-email", {
            method: "POST",
            body: { email, otp },
        });
    },
};
