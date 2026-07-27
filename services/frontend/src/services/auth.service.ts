import { apiFetch } from './api';

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
  };
}

export const authService = {
  async signup(payload: {
    email: string;
    password: string;
    role?: string;
    tenantId?: string;
  }): Promise<SignupResponse> {
    return apiFetch<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async verifyEmail(payload: { email: string; otp: string }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async forgotPassword(payload: { email: string }): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    password: string;
  }): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async getMe(): Promise<User> {
    return apiFetch<User>('/auth/me');
  },
};
