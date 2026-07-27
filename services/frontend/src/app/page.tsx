'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { LandingPageView } from '@/components/landing-page-view';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function Home() {
  const { isAuthenticated, user, logoutMutation } = useAuth();

  if (isAuthenticated && user) {
    return <DashboardView user={user} onLogout={() => logoutMutation.mutate()} />;
  }

  return <LandingPageView />;
}
