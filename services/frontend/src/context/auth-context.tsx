'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, authService } from '@/services/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { getRoleThemeStyles } from '@/lib/role-colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginMutation: ReturnType<typeof useMutation<any, any, any>>;
  logoutMutation: ReturnType<typeof useMutation<any, any, void>>;
  themeStyles: React.CSSProperties;
  refetchUser: () => Promise<any>;
  loginWithData: (data: { accessToken: string; refreshToken: string; user: User }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if token exists in localStorage on mount
    setTokenExists(!!authStorage.getAccessToken());
  }, []);

  // Fetch current user if token exists
  const {
    data: user = null,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      if (!authStorage.getAccessToken()) return null;
      try {
        return await authService.getMe();
      } catch (err) {
        authStorage.clear();
        setTokenExists(false);
        return null;
      }
    },
    enabled: tokenExists,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authStorage.setAccessToken(data.accessToken);
      authStorage.setRefreshToken(data.refreshToken);
      setTokenExists(true);
      queryClient.setQueryData(['me'], data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const rt = authStorage.getRefreshToken();
      if (rt) {
        try {
          await authService.logout(rt);
        } catch {
          // Continue clearing storage even if API call fails
        }
      }
      authStorage.clear();
      setTokenExists(false);
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
    },
  });

  // Compute theme styles dynamically based on current user role
  const themeStyles = useMemo(() => {
    return getRoleThemeStyles(user?.role);
  }, [user?.role]);

  const loginWithData = useCallback(
    (data: { accessToken: string; refreshToken: string; user: User }) => {
      authStorage.setAccessToken(data.accessToken);
      authStorage.setRefreshToken(data.refreshToken);
      setTokenExists(true);
      queryClient.setQueryData(['me'], data.user);
    },
    [queryClient]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading: tokenExists ? isLoading : false,
      isAuthenticated: !!user,
      loginMutation,
      logoutMutation,
      themeStyles,
      refetchUser,
      loginWithData,
    }),
    [user, isLoading, tokenExists, loginMutation, logoutMutation, themeStyles, refetchUser, loginWithData]
  );

  return (
    <AuthContext.Provider value={value}>
      <div style={themeStyles} className="contents">
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
